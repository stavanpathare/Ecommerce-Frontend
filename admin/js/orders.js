const user = JSON.parse(localStorage.getItem("user"));

if(!user || user.role !== "admin"){
 alert("Admin access only");
 window.location = "../index.html";
}
function go(page){
 window.location = page
}

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

async function loadOrders(){

const token = localStorage.getItem("token")

const res = await fetch(window.API_BASE + "/api/orders",{
 headers:{
  Authorization:"Bearer "+token
 }
})

const orders = await res.json()

const table = document.getElementById("ordersTable")

orders.forEach(order=>{

const row = document.createElement("tr")

row.innerHTML = `
<td>${order.user.email}</td>
<td>₹${order.totalAmount}</td>
<td>${order.status}</td>
<td>
<select onchange="updateStatus('${order._id}',this.value)">
<option>Pending</option>
<option>Shipped</option>
<option>Delivered</option>
</select>
</td>
`

table.appendChild(row)

})

}

async function updateStatus(id,status){

const token = localStorage.getItem("token")

await fetch(`${window.API_BASE}/api/orders/${id}/status`,{

method:"PUT",

headers:{
"Content-Type":"application/json",
Authorization:"Bearer "+token
},

body:JSON.stringify({status})

})

alert("Status updated")

}

loadOrders()

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location = "../index.html";
}