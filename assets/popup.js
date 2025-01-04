document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
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
  
    // Popup open/close functions
    function openPopup() {
      elements.overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  
    function closePopup() {
      elements.overlay.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
      
      // Reset state
      state.currentProduct = null;
      state.currentVariant = null;
      state.isLoading = false;
    }
  
    // Event Listeners
    elements.quickAddButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = button.dataset.productId;
        console.log('Quick add clicked for product:', productId); // Debug log
        
        try {
          state.currentProduct = await getProductData(productId);
          
          if (state.currentProduct) {
            openPopup();
          }
        } catch (error) {
          console.error('Error handling quick add:', error);
        }
      });
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
  });document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
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
  
    // Popup open/close functions
    function openPopup() {
      elements.overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  
    function closePopup() {
      elements.overlay.style.display = 'none';
      document.body.style.overflow = ''; // Restore scrolling
      
      // Reset state
      state.currentProduct = null;
      state.currentVariant = null;
      state.isLoading = false;
    }
  
    // Event Listeners
    elements.quickAddButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const productId = button.dataset.productId;
        console.log('Quick add clicked for product:', productId); // Debug log
        
        try {
          state.currentProduct = await getProductData(productId);
          
          if (state.currentProduct) {
            openPopup();
          }
        } catch (error) {
          console.error('Error handling quick add:', error);
        }
      });
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
  });