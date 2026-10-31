// Header shadow once the page has scrolled
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Fade sections in as they enter the viewport
const revealer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealer.observe(el));

// Photo viewer for galleries (only on pages that have one)
const lightbox = document.querySelector('.lightbox');
if (lightbox) {
  const lightboxImg = lightbox.querySelector('img');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption');
  const photos = [...document.querySelectorAll('.gallery .photo')];
  let current = 0;
  const show = (i) => {
    current = (i + photos.length) % photos.length;
    const img = photos[current].querySelector('img');
    lightboxImg.src = img.currentSrc || img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = img.alt;
  };
  photos.forEach((button, i) => {
    button.addEventListener('click', () => {
      show(i);
      lightbox.showModal();
    });
  });
  lightbox.querySelector('.lightbox-prev')?.addEventListener('click', () => show(current - 1));
  lightbox.querySelector('.lightbox-next')?.addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });
}
