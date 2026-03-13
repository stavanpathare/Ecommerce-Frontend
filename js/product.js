// ===== product.js (Fixed) =====
document.addEventListener("DOMContentLoaded", () => {
    window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");
    let selectedSize = null;
    let availableSizes = [];
    const SIZE_MAP = {
        shirt: ['S','M','L','XL'],
        jeans: ['28','30','32','34','36','38','40'],
        armani: ['28','30','32','34','36','38','40'],
    chappals: ['7','8','9','10'],
    shoes: ['7','8','9','10'],
    flipflops: ['7','8','9','10'],
        perfumes: []
    };

    // Load product details
    async function loadProduct() {
        try {
            const res = await fetch(`${window.API_BASE}/api/products/${productId}`);
            if (!res.ok) throw new Error("Product not found");
            const product = await res.json();

            document.getElementById("productName").innerText = product.name;
            document.getElementById("productPrice").innerText = "₹" + product.price;
            document.getElementById("productDescription").innerText = product.description;

            const mainImageEl = document.getElementById("mainImage");
            if (product.images && product.images.length > 0) {
                mainImageEl.src = normalizeImageUrl(product.images[0]);
            } else {
                mainImageEl.src = 'https://via.placeholder.com/300x400';
            }

            const thumbnails = document.getElementById("thumbnailContainer");
            thumbnails.innerHTML = ""; // Clear previous thumbnails
            (product.images || []).forEach(img => {
                const thumb = document.createElement("img");
                thumb.src = normalizeImageUrl(img);
                thumb.onclick = () => document.getElementById("mainImage").src = normalizeImageUrl(img);
                thumbnails.appendChild(thumb);
            });

            // render sizes based on product.sizes or category map
            const sizeContainer = document.getElementById('sizeOptions');
            sizeContainer.innerHTML = '';
            availableSizes = (product.sizes && product.sizes.length) ? product.sizes : (SIZE_MAP[product.category] || []);
            if (!availableSizes || availableSizes.length === 0) {
                sizeContainer.innerHTML = '<small>No size selection for this product</small>';
            } else {
                availableSizes.forEach(sz => {
                    const btn = document.createElement('button');
                    btn.className = 'size';
                    btn.innerText = sz;
                    btn.onclick = () => {
                        // clear previous selection
                        Array.from(sizeContainer.querySelectorAll('.size')).forEach(b => {
                            b.style.background = 'white'; b.style.color = 'black';
                        });
                        btn.style.background = 'black'; btn.style.color = 'white';
                        selectedSize = sz;
                    };
                    sizeContainer.appendChild(btn);
                });
            }
        } catch (err) {
            console.error("Error loading product:", err);
            alert("Failed to load product");
        }
    }
    loadProduct();

    // (size selection handled when sizes are rendered)

    // Add to cart (attached globally)
    window.addToCart = function() {
        // require size only if sizes are available for this product
        if (availableSizes && availableSizes.length > 0 && !selectedSize) {
            alert('Please select size');
            return;
        }

        const currentUser = JSON.parse(localStorage.getItem("user"));
        const cartKey = currentUser ? `cart_${currentUser._id}` : "cart_guest";
        let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    const existingItem = cart.find(item => item.productId === productId && item.size === (selectedSize || ''));
        if (existingItem) existingItem.qty++;
    else cart.push({ productId, size: selectedSize || '', qty: 1 });

        localStorage.setItem(cartKey, JSON.stringify(cart));
        alert("Added to cart");
    };

    // Button click calls global addToCart
    document.getElementById("addToCart").onclick = () => window.addToCart();
});