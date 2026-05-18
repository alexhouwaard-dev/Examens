// ── PAGE SWITCHING ────────────────────────────────────────────
const tabs      = document.querySelectorAll('.page-tab');
const pages     = document.querySelectorAll('.page-content');
const tocPanels = document.querySelectorAll('.toc-panel');
const HEADER_HEIGHT = 64; // matches --header-h in CSS

// Helper function for smooth scrolling with header offset
function smoothScroll(elementId) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - HEADER_HEIGHT - 20; // 20px extra padding
  
  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth'
  });
}

function switchPage(pageId) {
  // tabs
  tabs.forEach(t => t.classList.toggle('active', t.dataset.page === pageId));
  // content
  pages.forEach(p => p.classList.toggle('active', p.id === 'page-' + pageId));
  // toc panels — show only the active one
  tocPanels.forEach(p => {
    p.style.display = p.dataset.toc === pageId ? 'block' : 'none';
  });
  // rebuild TOC for this page
  buildTOC(pageId);
  // reset scroll
  window.scrollTo(0, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  // Logo click to home
  const logo = document.getElementById('logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => switchPage('home'));
  }

  // Tab clicks
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchPage(tab.dataset.page));
  });

  // Topic card buttons for navigation
  document.querySelectorAll('.topic-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const pageId = btn.dataset.page;
      if (pageId) {
        switchPage(pageId);
      }
    });
  });

});

// ── BUILD TABLE OF CONTENTS ───────────────────────────────────
function buildTOC(pageId) {
  const panel = document.querySelector(`.toc-panel[data-toc="${pageId}"]`);
  if (!panel) return;

  // Reset panel for rebuilding
  panel.innerHTML = '';
  panel.dataset.built = 'false';

  const pageEl  = document.getElementById('page-' + pageId);
  if (!pageEl) return;

  // Explicitly mark sidebar headings so TOC selection stays reliable.
  pageEl.querySelectorAll('.post-title, .content h2').forEach(h => {
    h.classList.add('sidebar-heading');
  });

  const headings = pageEl.querySelectorAll('.sidebar-heading');
  if (!headings.length) {
    panel.innerHTML = '<p class="toc-empty">Nog geen inhoud.</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'tree';

  const usedIds = new Set();

  function ensureHeadingId(heading) {
    if (heading.id && !usedIds.has(heading.id)) {
      usedIds.add(heading.id);
      return heading.id;
    }

    const base = (heading.textContent || 'section')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'section';

    let candidate = base;
    let counter = 2;
    while (usedIds.has(candidate) || document.querySelectorAll(`#${candidate}`).length > 0) {
      candidate = `${base}-${counter}`;
      counter += 1;
    }

    heading.id = candidate;
    usedIds.add(candidate);
    return candidate;
  }

  headings.forEach(heading => {
    const tag  = heading.tagName.toLowerCase();
    const id   = ensureHeadingId(heading);
    const text = heading.textContent;

    if (tag === 'h1' || tag === 'h2') {
      const li = document.createElement('li');
      li.className = 'tree-item h2-item';

      const a = document.createElement('a');
      a.className = 'tree-link-h2';
      a.href = '#' + id;
      a.textContent = text;
      a.addEventListener('click', e => {
        e.preventDefault();
        smoothScroll(id);
      });
      
      li.appendChild(a);
      ul.appendChild(li);
    }
  });

  if (pageId === 'ccna') {
    const pdfLi = document.createElement('li');
    pdfLi.className = 'tree-item h2-item';
    const pdfLink = document.createElement('a');
    pdfLink.className = 'tree-link-h2';
    pdfLink.href = 'static/CCNA_Commandos.pdf';
    pdfLink.setAttribute('download', '');
    pdfLink.textContent = 'CCNA_Handige commands';
    pdfLi.appendChild(pdfLink);
    ul.appendChild(pdfLi);
  }

  panel.appendChild(ul);

  // activate scroll highlighting
  activateHighlight(pageId);
}

// ── SCROLL HIGHLIGHT ──────────────────────────────────────────
function activateHighlight(pageId) {
  const pageEl   = document.getElementById('page-' + pageId);
  if (!pageEl) return;
  const headings = [...pageEl.querySelectorAll('.sidebar-heading')];
  const panel    = document.querySelector(`.toc-panel[data-toc="${pageId}"]`);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      // Remove all active highlights
      panel.querySelectorAll('a').forEach(l => l.classList.remove('active'));

      // Highlight current link
      const link = panel.querySelector(`a[href="#${id}"]`);
      if (link) {
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-15% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
}

// ── SCROLL PROGRESS BAR ───────────────────────────────────────
(function scrollProgress() {
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    if (total > 0) bar.style.transform = `scaleX(${scrolled / total})`;
  }, { passive: true });
})();

// ── INIT ──────────────────────────────────────────────────────
switchPage('home');
