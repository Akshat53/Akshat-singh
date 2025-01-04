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
      }).format(amount);
    }
  
    // Update add to cart button state
    function updateAddToCartButton(enabled = true, text = 'ADD TO CART →') {
      elements.addToCartBtn.disabled = !enabled;
      elements.addToCartBtn.innerHTML = text + (enabled ? ' <span class="arrow">→</span>' : '');
    }
  
    // Create color options
    function createColorOptions(colors) {
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
      elements.popupTitle.textContent = productData.title;
      elements.popupPrice.textContent = formatMoney(productData.price / 100);
      elements.popupImage.src = productData.image;
      elements.popupImage.alt = productData.title;
      
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
  
        const result = await response.json();
  
        if (!response.ok) {
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
      elements.overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  
    // Close popup
    function closePopup() {
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
      elements.colorOptions.innerHTML = '';
      elements.sizeSelect.innerHTML = '';
      updateAddToCartButton(true);
    }
  
    // Event Listeners
    elements.quickAddButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
  
        const productData = {
          title: button.dataset.productTitle,
          price: parseFloat(button.dataset.productPrice),
          image: button.dataset.productImage,
          variantId: button.dataset.variantId,
          colors: ['Blue', 'Black'], // Example colors - replace with actual product colors
          sizes: ['S', 'M', 'L', 'XL'] // Example sizes - replace with actual product sizes
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