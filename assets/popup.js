document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.popup-overlay');
    const popup = document.querySelector('.product-popup');
    const closeBtn = document.querySelector('.close-popup');
    const quickAddButtons = document.querySelectorAll('.quick-add-btn');
  
    let currentProduct = null;
  
    // Fetch product data
    async function getProductData(productId) {
      try {
        const response = await fetch(`/products/${productId}.js`);
        return await response.json();
      } catch (error) {
        console.error('Error fetching product:', error);
        return null;
      }
    }
  
    // Populate popup with product data
    function populatePopup(product) {
      const popupTitle = popup.querySelector('.popup-title');
      const popupPrice = popup.querySelector('.popup-price');
      const popupDescription = popup.querySelector('.popup-description');
      const popupImage = popup.querySelector('#popup-product-image');
      
      popupTitle.textContent = product.title;
      popupPrice.textContent = formatMoney(product.price);
      popupDescription.textContent = product.description;
      popupImage.src = product.featured_image;
      popupImage.alt = product.title;
  
      // Add variant selectors
      const variantSelectors = popup.querySelector('.variant-selectors');
      variantSelectors.innerHTML = ''; // Clear existing selectors
      
      product.options_with_values.forEach(option => {
        const container = document.createElement('div');
        container.className = 'variant-option';
        
        const label = document.createElement('label');
        label.textContent = option.name;
        
        const select = document.createElement('select');
        select.name = option.name;
        
        option.values.forEach(value => {
          const optionEl = document.createElement('option');
          optionEl.value = value;
          optionEl.textContent = value;
          select.appendChild(optionEl);
        });
        
        container.appendChild(label);
        container.appendChild(select);
        variantSelectors.appendChild(container);
      });
    }
  
    // Money formatter
    function formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    }
  
    // Event Listeners
    quickAddButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        e.stopPropagation(); // Prevent event from bubbling up
        const productId = button.dataset.productId;
        currentProduct = await getProductData(productId);
        if (currentProduct) {
          populatePopup(currentProduct);
          openPopup();
        }
      });
    });
  
    // Only add click event to the close button and overlay
    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
  
    function openPopup() {
      overlay.style.display = 'flex';
    }
  
    function closePopup() {
      overlay.style.display = 'none';
    }
  });