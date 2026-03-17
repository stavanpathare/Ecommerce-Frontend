async function loadOrders(){

const token = localStorage.getItem("token")

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
try{
  const res = await fetch(window.API_BASE + "/api/orders/myorders",{
    headers:{ Authorization:"Bearer "+token }
  })

  if(!res.ok){
    console.error('Failed to load orders', res.status);
    document.getElementById('ordersContainer').innerText = 'Failed to load orders.';
    return;
  }

  const orders = await res.json()
  const container = document.getElementById("ordersContainer")
  container.innerHTML = '';

  if(!orders || orders.length === 0){
    container.innerHTML = '<p>No orders yet.</p>';
    return;
  }

  orders.forEach(order=>{
    const productsHtml = (order.products || []).map(p=>{
      const prod = p.productId || p.product || {};
      const img = (prod.images && prod.images[0]) ? prod.images[0] : 'icons/product.png';
      const name = prod.name || 'Product';
      const price = prod.price != null ? '₹'+prod.price : '';
      const qty = p.quantity || 1;
      const size = p.size ? (' | Size: '+p.size) : '';
      return `
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:10px;">
          <img src="${img}" alt="${name}" style="width:84px;height:72px;object-fit:cover;border-radius:6px;border:1px solid #eee;" />
          <div>
            <div style="font-weight:700">${name}</div>
            <div style="color:#444">${price} &nbsp; × ${qty}${size}</div>
          </div>
        </div>`;
    }).join('');

    const ship = order.shippingDetails || {};
    const shippingHtml = `
      <div style="margin-top:8px;">
        <div style="font-weight:700">${ship.name || ''}</div>
        <div>${ship.phone || ''}</div>
        <div>${ship.address || ''}, ${ship.city || ''} - ${ship.pincode || ''}</div>
      </div>`;

    const paymentInfo = (order.paymentStatus && (order.paymentStatus.toLowerCase() === 'paid' || order.paymentStatus.toLowerCase() === 'paid'))
      ? 'Paid (Razorpay)'
      : 'Pending (Razorpay)';

    const status = order.orderStatus || order.status || 'Placed';

    const card = document.createElement('div');
    card.className = 'order-card';
    card.style = 'background:#fff;padding:18px;border-radius:10px;box-shadow:0 6px 18px rgba(15,15,15,0.06);margin-bottom:16px;';

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:220px;">
          <h3 style="margin:0 0 8px 0;font-size:18px;">Order ID: ${order._id}</h3>
          <div style="color:#666;font-size:13px;margin-bottom:6px;">Placed: ${new Date(order.createdAt).toLocaleString()}</div>
          ${productsHtml}
        </div>

        <div style="width:260px;max-width:45%;min-width:200px;">
          <div style="font-weight:700">Shipping</div>
          ${shippingHtml}

          <div style="margin-top:10px;font-weight:700">Payment</div>
          <div style="color:#444">${paymentInfo}</div>

          <div style="margin-top:12px;font-weight:700">Status</div>
          <div style="color:#111">${status}</div>
        </div>
      </div>
    `;

    container.appendChild(card);
  })

}catch(err){
  console.error('loadOrders error',err);
  document.getElementById('ordersContainer').innerText = 'Failed to load orders.';
}

}

loadOrders()