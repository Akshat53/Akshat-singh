document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements for better performance
    const elements = {
      overlay: document.querySelector('.popup-overlay'),
      popup: document.querySelector('.product-popup'),
      closeBtn: document.querySelector('.close-popup'),
      quickAddButtons: document.querySelectorAll('.quick-add-btn'),
      addToCartBtn: document.querySelector('.add-to-cart-btn'),
      quantityInput: document.querySelector('#quantity'),
      popupTitle: document.querySelector('.popup-title'),
      popupPrice: document.querySelector('.popup-price'),
      popupDescription: document.querySelector('.popup-description'),
      popupImage: document.querySelector('#popup-product-image'),
      variantSelectors: document.querySelector('.variant-selectors')
    };
  
    // State management
    let state = {
      currentProduct: null,
      currentVariant: null,
      isLoading: false
    };
  
    // Fetch product data from Shopify
    async function getProductData(productId) {
      try {
        const response = await fetch(`/products/${productId}.js`);
        if (!response.ok) {
          throw new Error('Product fetch failed');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    }
  
    // Find variant by selected options
    function findVariant(product, selectedOptions) {
      return product.variants.find(variant => 
        product.options.every((option, index) => 
          variant[`option${index + 1}`] === selectedOptions[option.name]
        )
      );
    }
  
    // Get all currently selected options
    function getSelectedOptions() {
      const selectedOptions = {};
      const selects = elements.popup.querySelectorAll('.variant-selectors select');
      
      selects.forEach(select => {
        selectedOptions[select.name] = select.value;
      });
  
      return selectedOptions;
    }
  
    // Update variant when selections change
    function handleVariantChange() {
      if (!state.currentProduct) return;
  
      const selectedOptions = getSelectedOptions();
      state.currentVariant = findVariant(state.currentProduct, selectedOptions);
      
      if (state.currentVariant) {
        // Update price
        elements.popupPrice.textContent = formatMoney(state.currentVariant.price);
        
        // Update button state
        elements.addToCartBtn.disabled = !state.currentVariant.available;
        elements.addToCartBtn.textContent = state.currentVariant.available 
          ? 'ADD TO CART →' 
          : 'Sold Out';
  
        // Update image if variant has a specific image
        if (state.currentVariant.featured_image) {
          elements.popupImage.src = state.currentVariant.featured_image.src;
        }
      }
    }
  
    // Populate popup with product data
    function populatePopup(product) {
      if (!product) return;
  
      // Set basic product information
      elements.popupTitle.textContent = product.title;
      elements.popupPrice.textContent = formatMoney(product.price);
      elements.popupDescription.textContent = product.description;
      elements.popupImage.src = product.featured_image;
      elements.popupImage.alt = product.title;
  
      // Clear and populate variant selectors
      elements.variantSelectors.innerHTML = '';
      
      if (product.options_with_values && product.options_with_values.length > 0) {
        product.options_with_values.forEach(option => {
          const container = document.createElement('div');
          container.className = 'variant-option';
          
          const label = document.createElement('label');
          label.textContent = option.name;
          
          const select = document.createElement('select');
          select.name = option.name;
          select.setAttribute('aria-label', option.name);
          select.addEventListener('change', handleVariantChange);
          
          option.values.forEach(value => {
            const optionEl = document.createElement('option');
            optionEl.value = value;
            optionEl.textContent = value;
            select.appendChild(optionEl);
          });
          
          container.appendChild(label);
          container.appendChild(select);
          elements.variantSelectors.appendChild(container);
        });
  
        // Set initial variant
        handleVariantChange();
      } else {
        // If no variants, use the default variant
        state.currentVariant = product.variants[0];
      }
  
      // Reset quantity
      elements.quantityInput.value = '1';
    }
  
    // Format money amount
    function formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    }
  
    // Add to cart functionality
    async function addToCart(variantId, quantity) {
      if (state.isLoading) return;
  
      try {
        state.isLoading = true;
        elements.addToCartBtn.disabled = true;
        elements.addToCartBtn.textContent = 'Adding...';
  
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: [{
              id: variantId,
              quantity: quantity
            }]
          })
        });
  
        if (!response.ok) throw new Error('Add to cart failed');
  
        const result = await response.json();
        
        // Success handling
        elements.addToCartBtn.textContent = 'Added! ✓';
        
        // Optional: Update cart count or show mini cart
        updateCartCount();
  
        // Close popup after short delay
        setTimeout(() => {
          closePopup();
        }, 1000);
  
      } catch (error) {
        console.error('Error adding to cart:', error);
        elements.addToCartBtn.textContent = 'Failed - Try Again';
      } finally {
        state.isLoading = false;
        elements.addToCartBtn.disabled = false;
      }
    }
  
    // Optional: Update cart count in header
    async function updateCartCount() {
      try {
        const response = await fetch('/cart.js');
        const cart = await response.json();
        
        // Update cart count if you have a cart count element
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
          cartCount.textContent = cart.item_count;
        }
      } catch (error) {
        console.error('Error updating cart count:', error);
      }
    }
  
    // Event Listeners
    elements.quickAddButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        button.disabled = true;
        
        try {
          const productId = button.dataset.productId;
          state.currentProduct = await getProductData(productId);
          
          if (state.currentProduct) {
            populatePopup(state.currentProduct);
            openPopup();
          }
        } catch (error) {
          console.error('Error handling quick add:', error);
        } finally {
          button.disabled = false;
        }
      });
    });
  
    elements.addToCartBtn.addEventListener('click', () => {
      if (state.currentVariant) {
        const quantity = parseInt(elements.quantityInput.value, 10) || 1;
        addToCart(state.currentVariant.id, quantity);
      }
    });
  
    // Close popup handlers
    elements.closeBtn.addEventListener('click', closePopup);
    elements.overlay.addEventListener('click', (e) => {
      if (e.target === elements.overlay) closePopup();
    });
  
    // Handle escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopup();
    });
  
    // Quantity input validation
    elements.quantityInput.addEventListener('change', (e) => {
      const value = parseInt(e.target.value, 10);
      if (isNaN(value) || value < 1) {
        e.target.value = '1';
      }
    });
  
    // Popup open/close functions
    function openPopup() {
      elements.overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      elements.addToCartBtn.disabled = false;
      elements.addToCartBtn.textContent = 'ADD TO CART →';
    }
  
    function closePopup() {
      elements.overlay.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
      
      // Reset state
      state = {
        currentProduct: null,
        currentVariant: null,
        isLoading: false
      };
  
      // Reset UI
      elements.variantSelectors.innerHTML = '';
      elements.quantityInput.value = '1';
    }
  });