
function go(page){
 window.location = page
}

window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

const user = JSON.parse(localStorage.getItem("user"))

if(!user || user.role !== "admin"){
 alert("Admin Access Only")
 window.location = "../index.html"
}

// sizes mapping per category (used for admin form and product page fallbacks)
const SIZE_MAP = {
    shirt: ['S','M','L','XL'],
    jeans: ['28','30','32','34','36','38','40'],
    armani: ['28','30','32','34','36','38','40'],
    chappals: ['7','8','9','10'],
    shoes: ['7','8','9','10'],
    flipflops: ['7','8','9','10'],
    perfumes: []
}

// render size options in admin form depending on selected category
function renderAdminSizes() {
    const sel = document.getElementById('category');
    const container = document.getElementById('sizeOptions');
    if (!container || !sel) return;
    const cat = sel.value;
    container.innerHTML = '';
    const sizes = SIZE_MAP[cat] || [];
    if (!sizes.length) {
        container.innerHTML = '<small>No size selection for this category</small>';
        return;
    }
    const wrapper = document.createElement('div');
    wrapper.className = 'size-checkboxes';
    sizes.forEach(sz => {
        const id = `admin-size-${cat}-${sz}`;
        const div = document.createElement('div');
        div.className = 'filter-item';
        div.innerHTML = `<input type="checkbox" id="${id}" value="${sz}"><label for="${id}">${sz}</label>`;
        wrapper.appendChild(div);
    });
    container.appendChild(wrapper);
}

// attach listener to category select to update sizes on change
document.addEventListener('DOMContentLoaded', () => {
    const catEl = document.getElementById('category');
    if (catEl) {
        catEl.addEventListener('change', renderAdminSizes);
        renderAdminSizes();
    }
});

async function addProduct(){

const token = localStorage.getItem("token")

const name = document.getElementById("name").value
const price = document.getElementById("price").value
const description = document.getElementById("description").value
const category = document.getElementById("category") ? document.getElementById("category").value : ''

const formData = new FormData()

formData.append("name",name)
formData.append("price",price)
formData.append("description",description)
formData.append("category", category)

// collect sizes from admin sizeOptions
const sizeContainer = document.getElementById('sizeOptions');
let selectedSizes = [];
if (sizeContainer) {
    const checked = Array.from(sizeContainer.querySelectorAll('input[type=checkbox]:checked'))
    selectedSizes = checked.map(c => c.value)
}
if (selectedSizes.length) {
    // Append sizes as repeated form fields so typical multipart parsers
    // convert them into an array on the server (req.body.sizes)
    selectedSizes.forEach(sz => formData.append('sizes', sz));
    // Also include a JSON copy for servers that expect a JSON string
    formData.append('sizesJson', JSON.stringify(selectedSizes));
}

const images = document.getElementById("images").files

for(let img of images){
 formData.append("images",img)
}

await fetch(window.API_BASE + "/api/products",{
method:"POST",
headers:{
 Authorization:"Bearer "+token
},
body:formData
})

alert("Product Added")

loadProducts()
}

async function loadProducts(){

const res = await fetch(window.API_BASE + "/api/products")

const products = await res.json()

const container = document.getElementById("productList")

container.innerHTML=""

products.forEach(p=>{

const image = p.images && p.images.length > 0
 ? normalizeImageUrl(p.images[0])
 : "https://via.placeholder.com/300"

const div = document.createElement("div")

div.className="product-card"

div.innerHTML=`

<img src="${image}">

<h3>${p.name}</h3>

<p>₹${p.price}</p>
<p style="font-size:13px;color:#666;margin-top:6px">${p.category ? ('Category: '+p.category) : ''}</p>

<button onclick="deleteProduct('${p._id}')">Delete</button>

`

container.appendChild(div)

})

}

async function deleteProduct(id){

const token = localStorage.getItem("token")

await fetch(`${window.API_BASE}/api/products/${id}`,{
method:"DELETE",
headers:{
Authorization:"Bearer "+token
}
})

loadProducts()

}

loadProducts()

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location = "../index.html";
}