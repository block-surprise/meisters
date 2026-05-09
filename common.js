// common.js
async function loadHeader() {
  const response = await fetch('header.html');
  const html = await response.text();
  document.getElementById('header-placeholder').innerHTML = html;
}

// ページ読み込み時にヘッダーを読み込む
window.addEventListener('DOMContentLoaded', loadHeader);
