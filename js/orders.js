async function loadOrders(){

const token = localStorage.getItem("token")

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
const res = await fetch(window.API_BASE + "/api/orders/myorders",{

headers:{
Authorization:"Bearer "+token
}

})

const orders = await res.json()

const container = document.getElementById("ordersContainer")

orders.forEach(order=>{

const div = document.createElement("div")

div.className="order-card"

div.innerHTML=`

<h3>Order ID: ${order._id}</h3>
<p>Total: ₹${order.totalAmount}</p>
<p>Status: ${order.status}</p>

`

container.appendChild(div)

})

}

loadOrders()