window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
const container = document.getElementById("products")
const categoryFiltersContainer = document.getElementById('categoryFilters')

const CATEGORIES = ['shirt','jeans','armani','chappals','shoes','flipflops','perfumes']
let allProducts = []

// render checkbox filters
function renderFilters(){
    if(!categoryFiltersContainer) return
    categoryFiltersContainer.innerHTML = ''
    CATEGORIES.forEach(cat => {
        const id = `filter-${cat}`
        const wrapper = document.createElement('div')
        wrapper.className = 'filter-item'
        wrapper.innerHTML = `<input type="checkbox" id="${id}" value="${cat}"><label for="${id}">${capitalize(cat)}</label>`
        categoryFiltersContainer.appendChild(wrapper)
        wrapper.querySelector('input').addEventListener('change', () => applyFilters())
    })
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1) }

function getSelectedCategories(){
    if(!categoryFiltersContainer) return []
    const checked = Array.from(categoryFiltersContainer.querySelectorAll('input[type=checkbox]:checked'))
    return checked.map(c => c.value)
}

function renderProducts(products){
    if(!container) return
    container.innerHTML = ''
    products.forEach(product => {
        const card = document.createElement('div')
        card.className = 'product-card'
        const image = product.images && product.images.length > 0
            ? normalizeImageUrl(product.images[0])
            : 'https://via.placeholder.com/300x400'
        card.innerHTML = `
            <img src="${image}">
            <h3>${product.name}</h3>
            <p>₹${product.price}</p>
        `
        card.onclick = () => { window.location = `product.html?id=${product._id}` }
        container.appendChild(card)
    })
}

function applyFilters(){
    const selected = getSelectedCategories()
    if(!selected.length){ renderProducts(allProducts); return }
    const filtered = allProducts.filter(p => {
        if(!p.category) return false
        return selected.includes(String(p.category).toLowerCase())
    })
    renderProducts(filtered)
}

async function loadProducts(){
    const res = await fetch(window.API_BASE + '/api/products')
    allProducts = await res.json()
    renderProducts(allProducts)
}

document.addEventListener('DOMContentLoaded', () => {
    renderFilters()
    loadProducts()
})