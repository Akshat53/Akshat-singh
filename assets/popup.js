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
  
    // State management
    let state = {
      currentVariantId: null,
      isLoading: false
    };
  
    // Format money amount
    function formatMoney(amount) {
      // Convert string to number and ensure it's a valid number
      const price = parseFloat(amount);
      if (isNaN(price)) {
        return '$0.00';
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(price);
    }
  
    // Populate popup with product data
    function populatePopup(productData) {
      if (!productData) return;
  
      // Set basic product information
      elements.popupTitle.textContent = productData.title;
      elements.popupPrice.textContent = formatMoney(productData.price);
      elements.popupImage.src = productData.image;
      elements.popupImage.alt = productData.title;
  
      // Store variant ID in state
      state.currentVariantId = productData.variantId;
  
      // Enable add to cart button
      elements.addToCartBtn.disabled = false;
      elements.addToCartBtn.textContent = 'ADD TO CART →';
    }
  
    // Add to cart functionality
    async function addToCart(variantId, quantity = 1) {
      if (state.isLoading || !variantId) return;
  
      try {
        state.isLoading = true;
        elements.addToCartBtn.disabled = true;
        elements.addToCartBtn.textContent = 'Adding...';
  
        const formData = {
          items: [{
            id: variantId,
            quantity: quantity
          }]
        };
  
        console.log('Adding to cart:', formData); // Debug log
  
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.description || 'Add to cart failed');
        }
        
        // Success handling
        elements.addToCartBtn.textContent = 'Added! ✓';
        
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
        currentVariantId: null,
        isLoading: false
      };
  
      // Reset button
      elements.addToCartBtn.textContent = 'ADD TO CART →';
      elements.addToCartBtn.disabled = false;
    }
  
    // Event Listeners
    elements.quickAddButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
  
        const productData = {
          title: button.dataset.productTitle,
          price: button.dataset.productPrice,
          image: button.dataset.productImage,
          variantId: button.dataset.variantId
        };
  
        console.log('Product data:', productData); // Debug log
  
        populatePopup(productData);
        openPopup();
      });
    });
  
    // Add to cart button handler
    elements.addToCartBtn?.addEventListener('click', () => {
      if (state.currentVariantId) {
        const quantity = 1;
        addToCart(state.currentVariantId, quantity);
      } else {
        console.error('No variant ID available');
        elements.addToCartBtn.textContent = 'Error - Try Again';
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