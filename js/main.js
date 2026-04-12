// Mobile toggle for inner pages (tab bar)
const mobileToggle = document.getElementById('mobile-toggle');
const mobileMenu = document.getElementById('mobile-menu');

// Show hamburger on small screens
if (mobileToggle) {
  const mql = window.matchMedia('(max-width: 640px)');
  const updateToggle = () => {
    mobileToggle.style.display = mql.matches ? 'inline' : 'none';
    if (!mql.matches && mobileMenu) mobileMenu.classList.remove('open');
  };
  updateToggle();
  mql.addEventListener('change', updateToggle);

  mobileToggle.addEventListener('click', () => {
    if (mobileMenu) mobileMenu.classList.toggle('open');
  });
}

// Populate line numbers in gutter
const gutter = document.querySelector('.line-gutter');
if (gutter) {
  const lines = Math.ceil(window.innerHeight / 20);
  let html = '';
  for (let i = 1; i <= lines; i++) {
    html += `<div style="
      text-align: right;
      padding-right: 12px;
      font-size: 11px;
      line-height: 22px;
      color: var(--fg-dark);
      user-select: none;
    ">${i}</div>`;
  }
  gutter.innerHTML = html;
}
