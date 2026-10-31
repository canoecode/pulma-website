// Render a thumbnail of every page of each patent PDF, linking to that page.
// Thumbnails are drawn only when they scroll near the viewport.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const THUMB_WIDTH = 360;

// Draw one page at a time so large scanned PDFs don't stall the page.
let queue = Promise.resolve();
const drawer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    drawer.unobserve(entry.target);
    queue = queue.then(() => entry.target.draw()).catch(() => {});
  });
}, { rootMargin: '400px 0px' });

document.querySelectorAll('.doc-grid[data-pdf]').forEach(async (grid) => {
  const url = grid.dataset.pdf;
  const label = grid.dataset.label;
  try {
    const pdf = await pdfjsLib.getDocument(url).promise;
    for (let n = 1; n <= pdf.numPages; n++) {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.className = 'doc-thumb';
      link.href = `${url}#page=${n}`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', `${label}, page ${n} (PDF)`);
      const canvas = document.createElement('canvas');
      const num = document.createElement('span');
      num.className = 'doc-thumb__page';
      num.textContent = n;
      link.append(canvas, num);
      li.append(link);
      grid.append(li);

      link.draw = async () => {
        const page = await pdf.getPage(n);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: (THUMB_WIDTH / base.width) * Math.min(window.devicePixelRatio || 1, 2) });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        link.classList.add('is-loaded');
      };
      drawer.observe(link);
    }
  } catch (err) {
    grid.innerHTML = `<li class="doc-error">This document could not be previewed. <a href="${url}" target="_blank" rel="noopener">Open the PDF</a>.</li>`;
  }
});
