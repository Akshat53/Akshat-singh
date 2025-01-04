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
      colorOptions: document.querySelector('.color-options'),
      sizeSelect: document.querySelector('.size-select')
    };
  
    // State management
    let state = {
      currentProduct: null,
      selectedColor: null,
      selectedSize: null,
      isLoading: false
    };
  
    // Format money amount
    function formatMoney(amount) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount / 100); // Divide by 100 to convert cents to dollars
    }
  
    // Update add to cart button state
    function updateAddToCartButton(enabled = true, text = 'ADD TO CART →') {
      if(elements.addToCartBtn) {
        elements.addToCartBtn.disabled = !enabled;
        elements.addToCartBtn.innerHTML = text + (enabled ? ' <span class="arrow">→</span>' : '');
      }
    }
  
    // Create color options
    function createColorOptions(colors) {
      if(!elements.colorOptions) return;
      
      elements.colorOptions.innerHTML = '';
      colors.forEach(color => {
        const colorBtn = document.createElement('div');
        colorBtn.className = 'color-option';
        colorBtn.textContent = color;
        colorBtn.addEventListener('click', () => selectColor(color, colorBtn));
        elements.colorOptions.appendChild(colorBtn);
      });
    }
  
    // Create size options
    function createSizeOptions(sizes) {
      if(!elements.sizeSelect) return;
  
      elements.sizeSelect.innerHTML = '<option value="">Choose your size</option>';
      sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        elements.sizeSelect.appendChild(option);
      });
    }
  
    // Select color handler
    function selectColor(color, element) {
      if(!elements.colorOptions) return;
  
      // Remove selected class from all colors
      elements.colorOptions.querySelectorAll('.color-option').forEach(btn => {
        btn.classList.remove('selected');
      });
      // Add selected class to chosen color
      element.classList.add('selected');
      state.selectedColor = color;
      validateSelection();
    }
  
    // Validate selection
    function validateSelection() {
      const isValid = state.selectedColor && state.selectedSize;
      updateAddToCartButton(isValid);
      return isValid;
    }
  
    // Populate popup with product data
    function populatePopup(productData) {
      if(!productData) return;
  
      if(elements.popupTitle) elements.popupTitle.textContent = productData.title;
      if(elements.popupPrice) elements.popupPrice.textContent = formatMoney(productData.price);
      if(elements.popupImage) {
        elements.popupImage.src = productData.image;
        elements.popupImage.alt = productData.title;
      }
      
      // Create color and size options if available
      if (productData.colors) {
        createColorOptions(productData.colors);
      }
      if (productData.sizes) {
        createSizeOptions(productData.sizes);
      }
  
      // Reset selections
      state.selectedColor = null;
      state.selectedSize = null;
      validateSelection();
    }
  
    // Add to cart functionality
    async function addToCart() {
      if (state.isLoading || !validateSelection()) return;
  
      try {
        state.isLoading = true;
        updateAddToCartButton(false, 'Adding...');
  
        const formData = {
          items: [{
            id: state.currentProduct.variantId,
            quantity: 1,
            properties: {
              Color: state.selectedColor,
              Size: state.selectedSize
            }
          }]
        };
  
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
  
        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.description || 'Add to cart failed');
        }
  
        updateAddToCartButton(true, 'Added! ✓');
        
        setTimeout(() => {
          closePopup();
        }, 1500);
  
      } catch (error) {
        console.error('Error adding to cart:', error);
        updateAddToCartButton(true, 'Failed - Try Again');
      } finally {
        state.isLoading = false;
      }
    }
  
    // Open popup
    function openPopup() {
      if(!elements.overlay) return;
      elements.overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  
    // Close popup
    function closePopup() {
      if(!elements.overlay) return;
      elements.overlay.style.display = 'none';
      document.body.style.overflow = '';
      
      // Reset state
      state = {
        currentProduct: null,
        selectedColor: null,
        selectedSize: null,
        isLoading: false
      };
  
      // Reset UI
      if(elements.colorOptions) elements.colorOptions.innerHTML = '';
      if(elements.sizeSelect) elements.sizeSelect.innerHTML = '';
      updateAddToCartButton(true);
    }
  
    // Event Listeners
    // Quick add buttons
    elements.quickAddButtons?.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
  
        const productData = {
          title: button.dataset.productTitle,
          price: button.dataset.productPrice,
          image: button.dataset.productImage,
          variantId: button.dataset.variantId,
          colors: ['Blue', 'Black'], // Replace with dynamic data
          sizes: ['S', 'M', 'L', 'XL'] // Replace with dynamic data
        };
  
        state.currentProduct = productData;
        populatePopup(productData);
        openPopup();
      });
    });
  
    // Size select handler
    elements.sizeSelect?.addEventListener('change', (e) => {
      state.selectedSize = e.target.value;
      validateSelection();
    });
  
    // Add to cart button handler
    elements.addToCartBtn?.addEventListener('click', addToCart);
  
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