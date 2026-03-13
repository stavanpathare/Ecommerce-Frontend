// admin/js/newarrivals-admin.js
// Simple admin manager for New Arrivals using localStorage
(function () {
  // API base can be configured from the page via `window.API_BASE`.
  // If not set, the code will use the same origin (''), which is fine when
  // the backend is served from the same host/port as the static files.
  window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');
  // fetch items from server API
  async function fetchItems() {
    try {
  const res = await fetch(window.API_BASE + '/api/newarrivals');
      if (res.status === 404) {
        console.warn('No API at', window.API_BASE + '/api/newarrivals', '— static server may be running instead of backend');
        return [];
      }
      if (!res.ok) throw new Error('Failed to fetch: ' + res.status);
      try {
        return await res.json();
      } catch (err) {
        console.warn('fetchItems: response not JSON, returning empty list', err);
        return [];
      }
    } catch (e) {
      console.error('fetch error', e);
      return [];
    }
  }

  async function createItem(formData) {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: 'Bearer ' + token } : {};
  const res = await fetch(window.API_BASE + '/api/newarrivals', {
        method: 'POST',
        headers,
        body: formData
      });
      if (res.status === 405) {
        // static servers often return 405 for POST — helpful hint
        throw new Error('Method Not Allowed (405). Are you running a static-only server (e.g. Live Server) instead of your backend?');
      }
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error('Upload failed: ' + res.status + ' ' + txt);
      }
      // some backends may return empty body (204) — handle gracefully
      const text = await res.text();
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch (err) {
        console.warn('createItem: response not JSON, returning empty object', err);
        return {};
      }
    } catch (e) {
      console.error('create error', e);
      throw e;
    }
  }

  async function deleteItem(id) {
    try {
      const token = localStorage.getItem('token');
  const res = await fetch(window.API_BASE + `/api/newarrivals/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
      return res.ok;
    } catch (e) {
      console.error('delete error', e);
      return false;
    }
  }

  function renderList() {
    const list = document.getElementById('newArrivalsList');
    if (!list) return;
    list.innerHTML = '';

    fetchItems().then(items => {
      if (!items || items.length === 0) {
        list.innerHTML = '<p>No new arrivals set.</p>';
        return;
      }

      items.forEach((it) => {
        const row = document.createElement('div');
        row.className = 'na-row';
        // server items are expected to have _id and image (url)
        // normalize image URL so it points to API_BASE when relative
  const imgPath = it.image || '';
  const imgSrc = imgPath ? normalizeImageUrl(imgPath) : 'images/sample1.jpg';
        row.innerHTML = `
          <div class="na-row-left">
            <img src="${escape(imgSrc)}" alt="${escape(it.title)}"/>
          </div>
          <div class="na-row-mid">
            <strong>${escape(it.title)}</strong>
            <div class="na-link">${escape(it.link || '')}</div>
          </div>
          <div class="na-row-right">
            <button data-id="${escape(it._id || it.id || '')}" class="na-delete">Delete</button>
          </div>
        `;
        list.appendChild(row);
      });

      // attach delete listeners
      Array.from(list.querySelectorAll('.na-delete')).forEach(btn => {
        btn.addEventListener('click', function () {
          const id = this.getAttribute('data-id');
          if (!id) return;
          if (!confirm('Delete this new arrival?')) return;
          deleteItem(id).then(ok => {
            if (ok) renderList();
            else alert('Failed to delete');
          });
        });
      });
    }).catch(err => {
      console.error('renderList error', err);
      list.innerHTML = '<p>Failed to load new arrivals.</p>';
    });
  }

  function escape(s){
    if (!s && s !== 0) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isQuotaExceeded(e) {
    if (!e) return false;
    try {
      return e && (e.code === 22 || e.code === 1014 || e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    } catch (err) {
      return false;
    }
  }

  function resizeImageFile(file, maxWidth = 800, quality = 0.8) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = function () {
          let { width, height } = img;
          if (width > maxWidth) {
            const ratio = maxWidth / width;
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          // convert to JPEG to reduce size; if original is PNG with transparency you may prefer PNG
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        };
        img.onerror = function (err) {
          URL.revokeObjectURL(url);
          reject(err);
        };
        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  }

    // Resize and return a Blob suitable for FormData uploads
    function resizeImageToBlob(file, maxWidth = 800, quality = 0.8) {
      return new Promise((resolve, reject) => {
        try {
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = function () {
            let { width, height } = img;
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(function (blob) {
              URL.revokeObjectURL(url);
              if (blob) resolve(blob);
              else reject(new Error('Failed to create blob'));
            }, 'image/jpeg', quality);
          };
          img.onerror = function (err) {
            URL.revokeObjectURL(url);
            reject(err);
          };
          img.src = url;
        } catch (err) {
          reject(err);
        }
      });
    }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('naForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const titleEl = document.getElementById('naTitle');
      const title = titleEl ? titleEl.value.trim() : '';
      const fileInput = document.getElementById('naImage');
      const linkEl = document.getElementById('naLink');
      const link = linkEl ? linkEl.value.trim() : '';

      if (!title) {
        alert('Please enter a title');
        return;
      }
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        alert('Please choose an image file');
        return;
      }

      const file = fileInput.files[0];

      // Resize image in client to reduce upload size, then send to server
      resizeImageToBlob(file, 1200, 0.8).then(blob => {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('image', blob, file.name || 'image.jpg');
        if (link) formData.append('link', link);
        createItem(formData).then(res => {
          if (res && (res._id || res.id)) {
            renderList();
            form.reset();
          } else {
            alert('Failed to save new arrival');
          }
        }).catch(err => {
          console.error('createItem error', err);
          alert('Failed to upload new arrival');
        });
      }).catch(() => {
        alert('Failed to process image. Try a smaller image or different format.');
      });
    });

    renderList();
  });

})();
