document.addEventListener('DOMContentLoaded', () => {
    console.log("System initialized. Booting up mainframe connection...");
    fetchProducts();
});

// DOM Elements
const productGrid = document.getElementById('productGrid');
const loadingState = document.getElementById('loading');
const emptyState = document.getElementById('emptyState');
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');

// Route points to your web application backend serving the database products
const API_URL = '/api/products';

async function fetchProducts() {
    showLoading(true);
    try {
        console.log("Attempting to fetch data from:", API_URL);
        const response = await fetch(API_URL);

        console.log("Server responded with status:", response.status);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const products = await response.json();
        console.log("Data received from server:", products);

        renderProducts(products);
    } catch (error) {
        console.error('CRITICAL ERROR fetching products:', error);
        showToast('Connection failed. Check console for details.', 'error');
        showLoading(false);
    }
}

async function searchProducts(keyword) {
    showLoading(true);
    try {
        const response = await fetch(`${API_URL}/search?keyword=${encodeURIComponent(keyword)}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('CRITICAL ERROR searching products:', error);
        showToast('Search protocol failed.', 'error');
        showLoading(false);
    }
}

function renderProducts(products) {
    console.log("Rendering products to the grid...");
    showLoading(false);

    if (!productGrid || !emptyState) {
        console.error("Missing HTML elements! Make sure productGrid and emptyState exist in home.html");
        return;
    }

    productGrid.innerHTML = '';

    if (!products || products.length === 0) {
        console.log("No products found in database.");
        productGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    productGrid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    // Added 'index' parameter to apply staggered animation delays
    products.forEach((product, index) => {
        try {
            let stockClass = 'stock-badge';
            let stockQuantity = product.stockQuantity || 0;
            let stockText = `${stockQuantity} in stock`;
            let disableBtn = false;

            if (stockQuantity <= 0) {
                stockClass += ' out';
                stockText = 'Out of Stock';
                disableBtn = true;
            } else if (stockQuantity < 5) {
                stockClass += ' low';
                stockText = `Only ${stockQuantity} left`;
            }

            const imageContent = product.productUrl
                ? `<img src="${product.productUrl}" alt="${product.name || 'Product'}" onerror="this.src='https://via.placeholder.com/300x180/1a1a24/00ffff?text=Image+Not+Found'">`
                : `<span>NO IMAGE DATA</span>`;

            let displayPrice = 'Price TBA';
            if (product.price !== null && product.price !== undefined) {
                displayPrice = `$${Number(product.price).toFixed(2)}`;
            }

            // Calculate the delay so cards cascade into view (0.1s increments)
            const delay = index * 0.1;

            // Used class 'fade-in-stagger' and injected the inline animation-delay style
            const cardHTML = `
                <div class="product-card fade-in-stagger" style="animation-delay: ${delay}s">
                    <div class="product-image-placeholder">
                        ${imageContent}
                    </div>
                    <div class="product-category">${product.category || 'Uncategorized'}</div>
                    <h3 class="product-title">${product.name || 'Unnamed Protocol'}</h3>
                    <p class="product-desc">${product.description || 'No description available.'}</p>

                    <div class="product-footer">
                        <div class="product-price">${displayPrice}</div>
                        <div class="${stockClass}">${stockText}</div>
                    </div>

                    <button class="btn-buy" ${disableBtn ? 'disabled' : ''} onclick="addToCart(${product.id})">
                        ${disableBtn ? 'UNAVAILABLE' : 'ADD TO CART'}
                    </button>
                </div>
            `;
            productGrid.insertAdjacentHTML('beforeend', cardHTML);
        } catch (err) {
            console.error("Error rendering individual product:", product, err);
        }
    });
    console.log("Render complete!");
}

if(searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
            searchProducts(keyword);
        } else {
            fetchProducts();
        }
    });
}

if(clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        fetchProducts();
    });
}

function showLoading(isLoading) {
    if (!loadingState || !productGrid || !emptyState) return;
    if (isLoading) {
        loadingState.classList.remove('hidden');
        productGrid.classList.add('hidden');
        emptyState.classList.add('hidden');
    } else {
        loadingState.classList.add('hidden');
    }
}

function addToCart(productId) {
    showToast(`Product ID ${productId} added to cart.`, 'success');
}

function showToast(message, type) {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3500);
}