// if (!cart || cart.length === 0) {
//   alert("Your cart is empty");
//   window.location = "cart.html";
// }
const currentUser = JSON.parse(localStorage.getItem("user"));
const cartKey = currentUser ? `cart_${currentUser._id}` : "cart_guest";

let cart = JSON.parse(localStorage.getItem(cartKey)) || [];
let total = 0;

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

/*
CALCULATE TOTAL (SAFE)
*/
async function calculateTotal() {

  total = 0;

  if (cart.length === 0) {
    document.getElementById("total").innerText = 0;
    return;
  }

  for (let item of cart) {
    try {
      const res = await fetch(`${window.API_BASE}/api/products/${item.productId}`);
      const product = await res.json();

      if (product && product.price) {
        total += product.price * item.qty;
      }

    } catch (err) {
      console.error("Error fetching product:", err);
    }
  }

  document.getElementById("total").innerText = total;
}

calculateTotal();


/*
GET SHIPPING DETAILS
*/
function getShippingDetails() {

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();
  const city = document.getElementById("city").value.trim();
  const pincode = document.getElementById("pincode").value.trim();

  if (!name || !phone || !address || !city || !pincode) {
    alert("Please fill all shipping details");
    return null;
  }

  return { name, phone, address, city, pincode };
}


/*
PAY NOW
*/
async function payNow() {

  await calculateTotal(); // ✅ ensure total is correct

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    return;
  }

  if (total <= 0) {
    alert("Cart total is invalid");
    return;
  }

  const shippingDetails = getShippingDetails();
  if (!shippingDetails) return;

  try {

    console.log("TOTAL:", total);
    console.log("CART:", cart);

    // ✅ STEP 1: CREATE ORDER
    const orderRes = await fetch(window.API_BASE + "/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        products: cart.map(item => ({
          productId: item.productId,
          quantity: item.qty,
          size: item.size || ""
        })),
        totalAmount: total,
        shippingDetails
      })
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok) {
      console.error("ORDER ERROR:", orderData);
      alert(orderData.error || "Order creation failed");
      return;
    }

    // ✅ STEP 2: CREATE RAZORPAY ORDER
    const paymentRes = await fetch(window.API_BASE + "/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ amount: total })
    });

    const paymentData = await paymentRes.json();

    if (!paymentRes.ok || !paymentData.success || !paymentData.order) {
      console.error("PAYMENT ERROR:", paymentData);
      alert("Payment initialization failed");
      return;
    }

    // ✅ STEP 3: OPEN RAZORPAY
    openRazorpay(paymentData.order, orderData);

  } catch (err) {
    console.error("PAY NOW ERROR:", err);
    alert("Something went wrong");
  }
}


/*
RAZORPAY
*/
function openRazorpay(order, orderData) {

  const token = localStorage.getItem("token");

  const options = {
    key: "rzp_test_SSAvyt5rWqEQh6", // ✅ FIXED FORMAT

    amount: order.amount,
    currency: "INR",
    order_id: order.id,

    handler: async function (response) {

      try {

        const res = await fetch(window.API_BASE + "/api/payment/verify-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({
            ...response,
            orderId: orderData._id
          })
        });

        const data = await res.json();

        if (data.success) {
          alert("Payment Successful!");
          localStorage.removeItem(cartKey);
          window.location = "orders.html";
        } else {
          alert("Payment verification failed");
        }

      } catch (err) {
        console.error("VERIFY ERROR:", err);
        alert("Payment verification error");
      }
    },

    modal: {
      ondismiss: async function () {

        await fetch(window.API_BASE + "/api/payment/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({
            orderId: orderData._id,
            status: "failed"
          })
        });

        alert("Payment Cancelled");
      }
    }
  };

  const rzp = new Razorpay(options);

  rzp.on("payment.failed", async function () {

    await fetch(window.API_BASE + "/api/payment/update-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({
        orderId: orderData._id,
        status: "failed"
      })
    });

    alert("Payment Failed");
  });

  rzp.open();
}