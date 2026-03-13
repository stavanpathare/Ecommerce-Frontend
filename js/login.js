window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
const form = document.getElementById("loginForm");

form.addEventListener("submit", async function(e){

 e.preventDefault();

 const email = document.getElementById("email").value;
 const password = document.getElementById("password").value;

 const res = await fetch(window.API_BASE + "/api/auth/login",{

  method:"POST",

  headers:{
   "Content-Type":"application/json"
  },

  body:JSON.stringify({email,password})

 });

 const data = await res.json();

 if(!res.ok){

  alert(data.message || "Login failed");
  return;

 }

 localStorage.setItem("token",data.token);
 localStorage.setItem("user",JSON.stringify(data.user));

 alert("Login successful");

 if(data.user.role === "admin"){
  window.location="admin/dashboard.html";
 }else{
  window.location="index.html";
 }

});