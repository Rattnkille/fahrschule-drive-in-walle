// Promo Banner
const banner = document.getElementById('promoBanner');
const bannerClose = document.getElementById('bannerClose');
if (bannerClose && banner) {
  if (sessionStorage.getItem('bannerClosed')) {
    banner.style.display = 'none';
  }
  bannerClose.addEventListener('click', () => {
    banner.style.transition = 'max-height 0.3s ease, padding 0.3s ease';
    banner.style.maxHeight = '0';
    banner.style.paddingTop = '0';
    banner.style.paddingBottom = '0';
    banner.style.overflow = 'hidden';
    sessionStorage.setItem('bannerClosed', '1');
  });
}

// Hamburger Menu
const navToggle = document.getElementById('navToggle');
const navList = document.getElementById('navList');
if (navToggle && navList) {
  navToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));
}

// Counter animation
const counters = document.querySelectorAll('.stat-num');
if (counters.length) {
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.closest('.stat').dataset.target);
      const isDecimal = target % 1 !== 0;
      const duration = 1600;
      const frameMs = 16;
      const steps = duration / frameMs;
      const increment = target / steps;
      let current = 0;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);
      }, frameMs);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(el => counterObs.observe(el));
}
