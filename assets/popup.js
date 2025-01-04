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
      currentProduct: null,
      currentVariant: null,
      isLoading: false
    };
  
    // Format money amount
    function formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    }
  
    // Populate popup with product data
    function populatePopup(productData) {
      if (!productData) return;
  
      // Set basic product information
      elements.popupTitle.textContent = productData.title;
      elements.popupPrice.textContent = formatMoney(productData.price);
      elements.popupImage.src = productData.image;
      elements.popupImage.alt = productData.title;
  
      // Enable add to cart button
      elements.addToCartBtn.disabled = false;
      elements.addToCartBtn.textContent = 'ADD TO CART →';
  
      // Store product data in state
      state.currentProduct = productData;
      state.currentVariant = { id: productData.id };
    }
  
    // Add to cart functionality
    async function addToCart(variantId, quantity = 1) {
      if (state.isLoading) return;
  
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
  
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) throw new Error('Add to cart failed');
  
        const result = await response.json();
        
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
        currentProduct: null,
        currentVariant: null,
        isLoading: false
      };
    }
  
    // Event Listeners
    elements.quickAddButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
  
        const productData = {
          id: button.dataset.productId,
          handle: button.dataset.productHandle,
          title: button.dataset.productTitle,
          price: parseInt(button.dataset.productPrice, 10),
          image: button.dataset.productImage
        };
  
        populatePopup(productData);
        openPopup();
      });
    });
  
    // Add to cart button handler
    elements.addToCartBtn?.addEventListener('click', () => {
      if (state.currentVariant) {
        const quantity = 1;
        addToCart(state.currentVariant.id, quantity);
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