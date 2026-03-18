// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {

    window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

    const cartContainer = document.getElementById("cartItems");
    const totalPriceEl = document.getElementById("totalPrice");

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const cartKey = currentUser ? `cart_${currentUser._id}` : "cart_guest";

    let cart = JSON.parse(localStorage.getItem(cartKey)) || [];

    // ===== Load Cart =====
    async function loadCart() {
        cartContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p>Your cart is empty.</p>";
            totalPriceEl.innerText = 0;
            return;
        }

        for (let item of cart) {
            try {
                const res = await fetch(`${window.API_BASE}/api/products/${item.productId}`);
                if (!res.ok) continue;

                const product = await res.json();
                if (!product) continue;

                total += product.price * item.qty;

                const image = product.images?.length > 0
                    ? normalizeImageUrl(product.images[0])
                    : "https://via.placeholder.com/300";

                const div = document.createElement("div");
                div.className = "cart-item";

                div.innerHTML = `
                    <img src="${image}">
                    <div class="cart-details">
                        <h3>${product.name}</h3>
                        <p>Size: ${item.size}</p>
                        <p>₹${product.price}</p>
                        <div class="qty-controls">
                            <button onclick="decreaseQty('${item.productId}','${item.size}')">-</button>
                            <span>${item.qty}</span>
                            <button onclick="increaseQty('${item.productId}','${item.size}')">+</button>
                        </div>
                    </div>
                    <button onclick="removeItem('${item.productId}','${item.size}')">Remove</button>
                `;

                cartContainer.appendChild(div);

            } catch (err) {
                console.error("Error loading product:", err);
            }
        }

        totalPriceEl.innerText = total;
    }

    // ===== Cart Operations =====
    window.increaseQty = function (productId, size) {
        cart = cart.map(item => {
            if (item.productId === productId && item.size === size) item.qty++;
            return item;
        });
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
        window.updateCartBadge?.();
    };

    window.decreaseQty = function (productId, size) {
        cart = cart.map(item => {
            if (item.productId === productId && item.size === size && item.qty > 1) item.qty--;
            return item;
        });
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
        window.updateCartBadge?.();
    };

    window.removeItem = function (productId, size) {
        cart = cart.filter(item => !(item.productId === productId && item.size === size));
        localStorage.setItem(cartKey, JSON.stringify(cart));
        loadCart();
        window.updateCartBadge?.();
    };

    // ===== Proceed to Checkout (FIXED) =====
    window.proceedToCheckout = function () {

        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        // ✅ Check empty cart
        if (cart.length === 0) {
            alert("Your cart is empty");
            return;
        }

        // ✅ Check login
        if (!user || !token) {
            alert("Please login to continue");

            localStorage.setItem("redirectAfterLogin", "checkout.html");
            window.location.href = "login.html";
            return;
        }

        // ✅ Go to checkout
        window.location.href = "checkout.html";
    };

    // ===== Attach Button =====
    const proceedBtn = document.getElementById("proceedToCheckoutBtn");
    if (proceedBtn) {
        proceedBtn.addEventListener("click", window.proceedToCheckout);
    }

    // ===== Initial Load =====
    loadCart();
});