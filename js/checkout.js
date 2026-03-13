let cart = JSON.parse(localStorage.getItem("cart")) || []

let total = 0

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

async function calculateTotal(){

for(let item of cart){

const res = await fetch(`${window.API_BASE}/api/products/${item.productId}`)

const product = await res.json()

total += product.price * item.qty

}

document.getElementById("total").innerText = total

}

calculateTotal()
async function payNow(){

const token = localStorage.getItem("token")

const res = await fetch(window.API_BASE + "/api/payment/create-order",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body:JSON.stringify({
amount:total
})

})

const data = await res.json()

openRazorpay(data.order)

}
function openRazorpay(order){

const options = {

key:"YOUR_RAZORPAY_KEY",

amount:order.amount,

currency:"INR",

order_id:order.id,

handler:function(response){

verifyPayment(response)

}

}

const rzp = new Razorpay(options)

rzp.open()

}
async function verifyPayment(payment){

const token = localStorage.getItem("token")

const res = await fetch(window.API_BASE + "/api/payment/verify-payment",{

method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Bearer "+token
},

body:JSON.stringify(payment)

})

const data = await res.json()

if(data.success){

alert("Payment Successful!")

localStorage.removeItem("cart")
if (window.updateCartBadge) window.updateCartBadge();
window.location="orders.html"

}

}