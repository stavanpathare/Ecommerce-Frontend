// Centralized API base for frontend. Set window.API_BASE in your HTML (e.g. from .env build step).
window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
const API = window.API_BASE + '/api';

async function getProducts(){
	const res = await fetch(`${API}/products`);
	return res.json();
}

async function getProduct(id){
	const res = await fetch(`${API}/products/${id}`);
	return res.json();
}

async function loginUser(data){
	const res = await fetch(`${API}/auth/login`,{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data)
	});
	return res.json();
}

async function registerUser(data){
	const res = await fetch(`${API}/auth/register`,{
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data)
	});
	return res.json();
}