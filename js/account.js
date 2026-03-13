const user = JSON.parse(localStorage.getItem("user"))

document.getElementById("name").innerText = user.name
document.getElementById("email").innerText = user.email

function logout(){

localStorage.removeItem("token")
localStorage.removeItem("user")

window.location="index.html"

}