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
