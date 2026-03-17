// ===== Auth Check =====
const user = JSON.parse(localStorage.getItem("user"));

if (!user || user.role !== "admin") {
    alert("Admin access only");
    window.location = "../index.html";
}

// ===== Navigation =====
function go(page) {
    window.location = page;
}

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

// ===== Load Orders =====
async function loadOrders() {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(window.API_BASE + "/api/orders", {
            headers: {
                Authorization: "Bearer " + token
            }
        });

        const orders = await res.json();

        const container = document.getElementById("ordersContainer");
        container.innerHTML = "";

        if (!orders.length) {
            container.innerHTML = "<p>No orders found</p>";
            return;
        }

        orders.forEach(order => {
            const card = document.createElement("div");
            card.className = "order-card";

            // ===== Products =====
            const productsHtml = (order.products || []).map(p => {
                const prod = p.productId || p.product || {};
                const img = (prod.images && prod.images[0]) 
                    ? prod.images[0] 
                    : '../icons/product.png';

                const name = prod.name || 'Product';
                const price = prod.price != null ? `₹${prod.price}` : '';
                const qty = p.quantity || 1;
                const size = p.size ? ` | Size: ${p.size}` : '';

                return `
                    <div class="order-product">
                        <img src="${img}" />
                        <div>
                            <strong>${name}</strong>
                            <span>${price} × ${qty}${size}</span>
                        </div>
                    </div>
                `;
            }).join('');

            // ===== User / Shipping =====
            const ship = order.shippingDetails || {};
            const userObj = order.userId || order.user || {};

            const userHtml = `
                <strong>${ship.name || userObj.name || ''}</strong>
                <div>${ship.phone || ''}</div>
                <div>${ship.address || ''}, ${ship.city || ''} - ${ship.pincode || ''}</div>
            `;

            // ===== Payment =====
            const isPaid = order.paymentStatus?.toLowerCase() === "paid";
            const paymentHtml = `
                <span class="${isPaid ? 'paid' : 'pending'}">
                    ${isPaid ? 'Paid (Razorpay)' : 'Pending'}
                </span>
            `;

            // ===== Status =====
            const currentStatus = order.orderStatus || order.status || "Placed";
            const statusOptions = ["Placed", "Shipped", "Delivered", "Cancelled"];

            const optionsHtml = statusOptions.map(s =>
                `<option value="${s}" ${s === currentStatus ? "selected" : ""}>${s}</option>`
            ).join('');

            // ===== Final Card HTML =====
            card.innerHTML = `
                <div class="order-left">
                    ${productsHtml}
                </div>

                <div class="order-user">
                    ${userHtml}
                </div>

                <div class="order-total">
                    ₹${order.totalAmount || 0}
                </div>

                <div class="order-status">
                    ${paymentHtml}
                </div>

                <div class="order-action">
                    <select onchange="updateStatus('${order._id}', this.value)">
                        ${optionsHtml}
                    </select>
                    <div class="order-date">
                        ${new Date(order.createdAt).toLocaleString()}
                    </div>
                </div>
            `;

            container.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading orders:", err);
        alert("Failed to load orders");
    }
}

// ===== Update Status =====
async function updateStatus(id, status) {
    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`${window.API_BASE}/api/orders/${id}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + token
            },
            body: JSON.stringify({ status })
        });

        if (!res.ok) {
            const err = await res.text().catch(() => null);
            alert("Failed: " + (err || res.status));
            return;
        }

        alert("Status updated");

    } catch (err) {
        console.error(err);
        alert("Update failed");
    }
}

// ===== Logout =====
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location = "../index.html";
}

// ===== Init =====
loadOrders();