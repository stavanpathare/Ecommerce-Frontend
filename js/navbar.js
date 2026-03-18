const userMenu = document.getElementById("userMenu");
const user = JSON.parse(localStorage.getItem("user"));

if (user) {
    userMenu.innerHTML = `
    <div class="user-dropdown">
        <span id="userToggle" class="user-name">${user.name}</span>
        <div id="dropdownMenu" class="dropdown-menu">
            <a href="orders.html">Your Orders</a>
            <a href="account.html">Account Info</a>
            <button onclick="logout()">Logout</button>
        </div>
    </div>
    `;

    const toggle = document.getElementById("userToggle");
    const menu = document.getElementById("dropdownMenu");
    const nav = document.querySelector('.navbar');

    function positionMenuForMobile() {
        // place dropdown as a fixed panel below header on narrow screens
        if (!menu) return;
        if (window.innerWidth <= 768) {
            const rect = nav.getBoundingClientRect();
            menu.style.position = 'fixed';
            menu.style.top = Math.ceil(rect.bottom) + 'px';
            menu.style.left = '8px';
            menu.style.right = '8px';
            menu.style.width = 'auto';
            menu.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
            menu.style.borderRadius = '6px';
            menu.style.zIndex = 1500;
        } else {
            // clear mobile inline styles for desktop
            menu.style.position = '';
            menu.style.top = '';
            menu.style.left = '';
            menu.style.right = '';
            menu.style.width = '';
            menu.style.boxShadow = '';
            menu.style.borderRadius = '';
            menu.style.zIndex = '';
        }
    }

    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        menu.classList.toggle("show");
        positionMenuForMobile();
    });

    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) {
            menu.classList.remove("show");
            // clear any inline mobile positioning when closed
            menu.style.position = '';
            menu.style.top = '';
            menu.style.left = '';
            menu.style.right = '';
            menu.style.width = '';
            menu.style.boxShadow = '';
            menu.style.borderRadius = '';
            menu.style.zIndex = '';
        }
    });

    // adjust on resize while menu is open
    window.addEventListener('resize', () => {
        if (menu.classList.contains('show')) positionMenuForMobile();
    });

} else {
    userMenu.innerHTML = `<a href="login.html" class="login-btn">Login</a>`;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location = "index.html";
}

// Cart badge: compute cart key and update badge count
function getCartKey() {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    return currentUser ? `cart_${currentUser._id}` : 'cart_guest';
}

function updateCartBadge() {
    const badge = document.getElementById('cartCount');
    if (!badge) return;
    try {
        const key = getCartKey();
        const cart = JSON.parse(localStorage.getItem(key)) || [];
        // sum quantities if present, else count items
        const count = cart.reduce((s, it) => s + (Number(it.qty) || 1), 0);
        if (count > 0) {
            badge.innerText = count;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    } catch (err) {
        console.error('Could not update cart badge', err);
    }
}

// update badge on load
document.addEventListener('DOMContentLoaded', updateCartBadge);

// update when localStorage changes in other tabs
window.addEventListener('storage', (e) => {
    // if cart keys change, refresh badge
    if (!e.key) return;
    if (e.key.startsWith('cart_') || e.key === 'cart_guest' || e.key === 'user') {
        // small timeout to allow other handlers to finish
        setTimeout(updateCartBadge, 50);
    }
});