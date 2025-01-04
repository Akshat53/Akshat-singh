document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const overlay = document.querySelector('.popup-overlay');
    const popup = document.querySelector('.product-popup');
    const closeBtn = document.querySelector('.close-popup');
    const quickAddButtons = document.querySelectorAll('.quick-add-btn');
    
    // Product data cache
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
      const popupTitle = popup.querySelector('.product-title');
      const popupPrice = popup.querySelector('.product-price');
      const popupDescription = popup.querySelector('.product-description');
      const popupImage = popup.querySelector('#popup-product-image');
      const variantSelectors = popup.querySelector('.variant-selectors');
      
      popupTitle.textContent = product.title;
      popupPrice.textContent = formatMoney(product.price);
      popupDescription.textContent = product.description;
      popupImage.src = product.featured_image;
      popupImage.alt = product.title;
      
      // Clear existing variant selectors
      variantSelectors.innerHTML = '';
      
      // Add variant options
      product.options_with_values.forEach(option => {
        const container = document.createElement('div');
        container.className = 'variant-option';
        
        const label = document.createElement('label');
        label.textContent = option.name;
        
        const select = document.createElement('select');
        select.name = option.name;
        select.dataset.option = option.name;
        
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
    
    // Add to cart functionality
    async function addToCart(variantId, quantity = 1) {
      try {
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
        
        const data = await response.json();
        
        // Check if we need to add Soft Winter Jacket
        const variant = currentProduct.variants.find(v => v.id === variantId);
        if (variant && variant.option1 === 'Black' && variant.option2 === 'Medium') {
          // Add Soft Winter Jacket (you'll need to replace this ID)
          await addToCart('your-soft-winter-jacket-variant-id', 1);
        }
        
        // Close popup and show success message
        closePopup();
        showMessage('Product added to cart!');
        
      } catch (error) {
        console.error('Error adding to cart:', error);
        showMessage('Error adding to cart', true);
      }
    }
    
    // Event Listeners
    quickAddButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const productId = e.target.dataset.productId;
        currentProduct = await getProductData(productId);
        if (currentProduct) {
          populatePopup(currentProduct);
          openPopup();
        }
      });
    });
    
    closeBtn.addEventListener('click', closePopup);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closePopup();
    });
    
    popup.querySelector('.add-to-cart-btn').addEventListener('click', () => {
      const variantSelects = popup.querySelectorAll('.variant-option select');
      const selectedOptions = Array.from(variantSelects).map(select => select.value);
      
      // Find matching variant
      const variant = currentProduct.variants.find(v => 
        v.options.every((opt, index) => opt === selectedOptions[index])
      );
      
      if (variant) {
        addToCart(variant.id);
      }
    });
    
    // Utility functions
    function openPopup() {
      overlay.style.display = 'block';
    }
    
    function closePopup() {
      overlay.style.display = 'none';
    }
    
    function formatMoney(cents) {
      return (cents / 100).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD'
      });
    }
    
    function showMessage(message, isError = false) {
      // Implement your message display logic here
      alert(message);
    }
  });