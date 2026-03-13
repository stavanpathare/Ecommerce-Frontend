async function login(){

const email = document.getElementById("email").value;

const password = document.getElementById("password").value;

const res = await loginUser({email,password});

localStorage.setItem("token",res.token);

alert("Login successful");

window.location="index.html";

}