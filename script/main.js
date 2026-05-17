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
      if (pageId && pageId !== 'python' && pageId !== 'security') {
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
  const headings = pageEl.querySelectorAll('.content h2, .content h3, .content h4');
  if (!headings.length) {
    panel.innerHTML = '<p class="toc-empty">Nog geen inhoud.</p>';
    return;
  }

  const ul = document.createElement('ul');
  ul.className = 'tree';

  let currentH3List = null;

  headings.forEach(heading => {
    const tag  = heading.tagName.toLowerCase();
    const id   = heading.id;
    const text = heading.textContent;

    if (tag === 'h2') {
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

      // Create list for H3s under this H2
      currentH3List = document.createElement('ul');
      currentH3List.className = 'tree-h3-list';
      li.appendChild(currentH3List);

    } else if (tag === 'h3') {
      if (!currentH3List) return;
      
      const li = document.createElement('li');
      li.className = 'tree-item h3-item';

      const a = document.createElement('a');
      a.className = 'tree-link-h3';
      a.href = '#' + id;
      a.textContent = text;
      a.addEventListener('click', e => {
        e.preventDefault();
        smoothScroll(id);
      });
      
      li.appendChild(a);
      currentH3List.appendChild(li);

    } else if (tag === 'h4') {
      if (!currentH3List) return;
      
      const li = document.createElement('li');
      li.className = 'tree-item h4-item';

      const a = document.createElement('a');
      a.className = 'tree-link-h4';
      a.href = '#' + id;
      a.textContent = text;
      a.addEventListener('click', e => {
        e.preventDefault();
        smoothScroll(id);
      });
      
      li.appendChild(a);
      currentH3List.appendChild(li);
    }
  });

  panel.appendChild(ul);

  // activate scroll highlighting
  activateHighlight(pageId);
}

// ── SCROLL HIGHLIGHT ──────────────────────────────────────────
function activateHighlight(pageId) {
  const pageEl   = document.getElementById('page-' + pageId);
  if (!pageEl) return;
  const headings = [...pageEl.querySelectorAll('.content h2, .content h3, .content h4')];
  const panel    = document.querySelector(`.toc-panel[data-toc="${pageId}"]`);

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      // Remove all active highlights
      panel.querySelectorAll('a').forEach(l => l.classList.remove('active'));

      // Highlight current link and parent H2
      const link = panel.querySelector(`a[href="#${id}"]`);
      if (link) {
        link.classList.add('active');
        
        // Also highlight parent H2 if this is H3 or H4
        const heading = entry.target;
        if (heading.tagName !== 'H2') {
          let prev = heading.previousElementSibling;
          while (prev) {
            if (prev.tagName === 'H2') {
              const h2Link = panel.querySelector(`a[href="#${prev.id}"]`);
              if (h2Link) h2Link.classList.add('active');
              break;
            }
            prev = prev.previousElementSibling;
          }
        }
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
