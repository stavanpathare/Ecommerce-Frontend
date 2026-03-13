// js/utils.js
// small helpers used across the frontend
(function(){
  // Ensure API_BASE normalized (no trailing slash)
  window.API_BASE = (window.API_BASE || '').replace(/\/$/, '');

  window.normalizeImageUrl = function (img) {
    if (!img && img !== 0) return '';
    try {
      img = String(img);
    } catch (e) {
      return '';
    }
    // absolute URL (http/https) — leave unchanged
    if (/^https?:\/\//i.test(img) || /^data:/i.test(img) || /^blob:/i.test(img)) return img;
    // protocol-relative
    if (img.startsWith('//')) return window.location.protocol + img;
    // relative path: prefix with API base if available, otherwise return as-is
    const base = window.API_BASE || '';
    if (img.startsWith('/')) return base ? (base + img) : img;
    return base ? (base + '/' + img) : img;
  };
})();
