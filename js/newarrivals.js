// js/newarrivals.js
// Reads 'newArrivals' from localStorage and renders them on the main page.
(function () {
  // allow configuring backend base URL from hosting page: window.API_BASE
  window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

  function getNewArrivals() {
    // replaced by server-backed fetch; kept for compatibility but prefer fetchNewArrivals
    try {
      const raw = localStorage.getItem('newArrivals');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse newArrivals', e);
      return null;
    }
  }

  function saveDefaultIfEmpty() {
    const existing = getNewArrivals();
    if (existing && existing.length) return existing;
    const sample = [
      { title: 'Casual Shirt', image: 'images/sample1.jpg', link: 'products.html' },
      { title: 'Flip Flops', image: 'images/sample2.jpg', link: 'products.html' },
      { title: 'Chappals', image: 'images/sample3.jpg', link: 'products.html' }
    ];
    try {
      localStorage.setItem('newArrivals', JSON.stringify(sample));
    } catch (e) {
      console.warn('Could not save default newArrivals', e);
    }
    return sample;
  }

  function render() {
    const container = document.getElementById('newArrivalsContainer');
    if (!container) return;
    container.innerHTML = '';
    const sampleFallback = saveDefaultIfEmpty();

    fetch(window.API_BASE + '/api/newarrivals').then(res => {
      if (res.status === 404) {
        console.warn('API not found at', window.API_BASE + '/api/newarrivals');
        throw new Error('api not found');
      }
      if (!res.ok) throw new Error('fetch failed: ' + res.status);
      return res.json().catch(() => { throw new Error('invalid json'); });
    }).then(items => {
      if (!items || !items.length) items = sampleFallback;
      items.forEach((it) => {
        const el = document.createElement('div');
        el.className = 'na-item';
  const imgSrc = it.image ? normalizeImageUrl(it.image) : "images/sample1.jpg";
        el.innerHTML = `
          <a href="${escapeHtml(it.link || '#')}">
            <div class="na-image"><img src="${escapeHtml(imgSrc)}" alt="${escapeHtml(it.title)}"></div>
            <div class="na-title">${escapeHtml(it.title)}</div>
          </a>
        `;
        container.appendChild(el);
      });
    }).catch(err => {
      // fallback to local/sample
      console.warn('newarrivals fetch failed, falling back to local/sample', err);
      const items = getNewArrivals() || sampleFallback;
      items.forEach((it) => {
        const el = document.createElement('div');
        el.className = 'na-item';
        el.innerHTML = `
          <a href="${escapeHtml(it.link || '#')}">
            <div class="na-image"><img src="${escapeHtml(it.image || 'images/sample1.jpg')    }" alt="${escapeHtml(it.title)}"></div>
            <div class="na-title">${escapeHtml(it.title)}</div>
          </a>
        `;
        container.appendChild(el);
      });
    });
  }

  // small escape util to avoid injection into attributes
  function escapeHtml(s) {
    if (!s && s !== 0) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  document.addEventListener('DOMContentLoaded', render);
})();
