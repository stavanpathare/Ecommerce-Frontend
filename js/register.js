window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e)=>{

 e.preventDefault();

 const name = document.getElementById("name").value;
 const email = document.getElementById("email").value;
 const password = document.getElementById("password").value;

 const res = await fetch(window.API_BASE + "/api/auth/register",{

  method:"POST",

  headers:{
   "Content-Type":"application/json"
  },

  body:JSON.stringify({name,email,password})

 });

 const data = await res.json();

 if(!res.ok){
  alert(data.message);
  return;
 }

 alert("Account created!");

 window.location = "login.html";

});