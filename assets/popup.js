document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const elements = {
      overlay: document.querySelector('.popup-overlay'),
      popup: document.querySelector('.product-popup'),
      closeBtn: document.querySelector('.close-popup'),
      quickAddButtons: document.querySelectorAll('.quick-add-btn'),
      addToCartBtn: document.querySelector('.add-to-cart-btn'),
      popupTitle: document.querySelector('.popup-title'),
      popupPrice: document.querySelector('.popup-price'),
      popupDescription: document.querySelector('.popup-description'),
      popupImage: document.querySelector('#popup-product-image'),
      variantSelectors: document.querySelector('.variant-selectors')
    };
  
    // Debug log to check if elements are found
    console.log('Quick add buttons found:', elements.quickAddButtons.length);
  
    // State management
    let state = {
      currentProduct: null,
      currentVariant: null,
      isLoading: false
    };
  
    // Fetch product data from Shopify
    async function getProductData(productHandle) {
      try {
        // Use the product handle instead of ID
        const response = await fetch(`/products/${productHandle}.js`);
        if (!response.ok) {
          throw new Error(`Product fetch failed: ${response.status}`);
        }
        const data = await response.json();
        console.log('Product data fetched:', data); // Debug log
        return data;
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    }
  
    // Format money amount
    function formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    }
  
    // Populate popup with product data
    function populatePopup(product) {
      if (!product) {
        console.error('No product data available');
        return;
      }
  
      console.log('Populating popup with product:', product); // Debug log
  
      // Set basic product information
      elements.popupTitle.textContent = product.title;
      elements.popupPrice.textContent = formatMoney(product.price);
      elements.popupDescription.innerHTML = product.description;
  
      // Set product image
      if (product.featured_image) {
        elements.popupImage.src = product.featured_image;
        elements.popupImage.alt = product.title;
      }
  
      // Handle variants if they exist
      if (product.variants && product.variants.length > 0) {
        state.currentVariant = product.variants[0];
        // Update price for initial variant
        elements.popupPrice.textContent = formatMoney(state.currentVariant.price);
      }
    }
  
    // Popup open/close functions
    function openPopup() {
      elements.overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  
    function closePopup() {
      elements.overlay.style.display = 'none';
      document.body.style.overflow = '';
      
      // Reset state
      state = {
        currentProduct: null,
        currentVariant: null,
        isLoading: false
      };
    }
  
    // Add to cart functionality
    async function addToCart(variantId, quantity = 1) {
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
        console.log('Added to cart:', result); // Debug log
        
        elements.addToCartBtn.textContent = 'Added! ✓';
        setTimeout(closePopup, 1000);
  
      } catch (error) {
        console.error('Error adding to cart:', error);
        elements.addToCartBtn.textContent = 'Failed - Try Again';
      } finally {
        state.isLoading = false;
        elements.addToCartBtn.disabled = false;
      }
    }
  
    // Event Listeners
    elements.quickAddButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productHandle = button.dataset.productHandle; // Change from productId to productHandle
        console.log('Quick add clicked for product:', productHandle); // Debug log
        
        if (!productHandle) {
          console.error('No product handle found on button');
          return;
        }
  
        try {
          state.currentProduct = await getProductData(productHandle);
          
          if (state.currentProduct) {
            populatePopup(state.currentProduct);
            openPopup();
          } else {
            console.error('Failed to fetch product data');
          }
        } catch (error) {
          console.error('Error handling quick add:', error);
        }
      });
    });
  
    // Add to cart button handler
    elements.addToCartBtn?.addEventListener('click', () => {
      if (state.currentVariant) {
        addToCart(state.currentVariant.id);
      }
    });
  
    // Close popup handlers
    elements.closeBtn?.addEventListener('click', closePopup);
    elements.overlay?.addEventListener('click', (e) => {
      if (e.target === elements.overlay) closePopup();
    });
  
    // Handle escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closePopup();
    });
  });