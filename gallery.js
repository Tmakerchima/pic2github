// 图片列表：自动扫描 img/ 目录（GitHub Pages 静态环境下手动维护此列表）
// 将你的图片放入 img/ 文件夹后，在下面 IMAGES 数组中添加文件名即可
const IMAGES = (function () {
  // 尝试从 images.json 加载（优先），否则回落到内置列表
  return [];
})();

const IMG_PREFIX = 'img/';

// 农场风格图标轮换
const BADGES = ['🌻', '🌽', '🍎', '🥕', '🐄', '🐓', '🌾', '🍓'];

let allImages = [];
let filtered  = [];
let current   = 0;

const gallery    = document.getElementById('gallery');
const stats      = document.getElementById('stats');
const emptyState = document.getElementById('empty-state');
const lightbox   = document.getElementById('lightbox');
const lbImg      = document.getElementById('lb-img');
const lbCaption  = document.getElementById('lb-caption');
const searchEl   = document.getElementById('search');
const sortEl     = document.getElementById('sort');

// ---- 加载图片列表 ----
async function loadImages() {
  // 先尝试加载 images.json（部署时由 CI/脚本生成）
  try {
    const res = await fetch('images.json');
    if (res.ok) {
      const data = await res.json();
      allImages = data.map(name => ({ name, src: IMG_PREFIX + name }));
    }
  } catch (_) { /* 使用内置列表 */ }

  // 内置列表兜底（本地开发用）
  if (allImages.length === 0 && IMAGES.length > 0) {
    allImages = IMAGES.map(name => ({ name, src: IMG_PREFIX + name }));
  }

  render();
}

// ---- 渲染 ----
function render() {
  const q = searchEl.value.toLowerCase().trim();
  filtered = allImages.filter(img => img.name.toLowerCase().includes(q));

  const order = sortEl.value;
  if (order === 'name')    filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (order === 'reverse') filtered.sort((a, b) => b.name.localeCompare(a.name));

  gallery.innerHTML = '';
  emptyState.style.display = filtered.length === 0 ? 'block' : 'none';
  stats.textContent = `🌾 共 ${allImages.length} 张照片，当前显示 ${filtered.length} 张`;

  filtered.forEach((img, idx) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${img.src}" alt="${img.name}" loading="lazy" />
      </div>
      <div class="card-body">
        <div class="card-name">${img.name}</div>
        <span class="card-badge">${BADGES[idx % BADGES.length]}</span>
      </div>`;
    card.addEventListener('click', () => openLightbox(idx));
    gallery.appendChild(card);
  });
}

// ---- 灯箱 ----
function openLightbox(idx) {
  current = idx;
  showLightboxImage();
  lightbox.classList.add('open');
}

function showLightboxImage() {
  const img = filtered[current];
  lbImg.src = img.src;
  lbImg.alt = img.name;
  lbCaption.textContent = `${img.name}  (${current + 1} / ${filtered.length})`;
}

function closeLightbox() {
  lightbox.classList.remove('open');
  lbImg.src = '';
}

function navigate(dir) {
  current = (current + dir + filtered.length) % filtered.length;
  showLightboxImage();
}

document.getElementById('lb-close').addEventListener('click', closeLightbox);
document.getElementById('lb-prev').addEventListener('click', () => navigate(-1));
document.getElementById('lb-next').addEventListener('click', () => navigate(1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   navigate(-1);
  if (e.key === 'ArrowRight')  navigate(1);
});

// ---- 搜索 & 排序 ----
searchEl.addEventListener('input', render);
sortEl.addEventListener('change', render);

// ---- 触摸滑动 ----
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(dx) > 50) navigate(dx < 0 ? 1 : -1);
}, { passive: true });

// ---- 启动 ----
loadImages();
