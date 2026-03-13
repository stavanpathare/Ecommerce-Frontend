const user = JSON.parse(localStorage.getItem("user"));

if(!user || user.role !== "admin"){
 alert("Admin access only");
 window.location = "../index.html";
}
function go(page){
 window.location = page
}

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

async function loadStats(){

const productsRes = await fetch(window.API_BASE + "/api/products")
const products = await productsRes.json()

document.getElementById("totalProducts").innerText = products.length


const token = localStorage.getItem("token")

const ordersRes = await fetch(window.API_BASE + "/api/orders",{
 headers:{
  Authorization:"Bearer "+token
 }
})

const orders = await ordersRes.json()

document.getElementById("totalOrders").innerText = orders.length

let revenue = 0

orders.forEach(o=>{
 revenue += o.totalAmount
})

document.getElementById("totalRevenue").innerText = "₹"+revenue

}
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location = "../index.html";
}

loadStats()