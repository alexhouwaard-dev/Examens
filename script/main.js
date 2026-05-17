// ── BUILD TABLE OF CONTENTS ──────────────────────────────────
(function buildTOC() {
  const content = document.getElementById('post-content');
  const toc     = document.getElementById('toc');
  const headings = content.querySelectorAll('h2, h3, h4');

  let currentH2Item = null;
  let currentH3Item = null;
  let currentSubtree = null;
  let currentSubtreeH4 = null;

  headings.forEach(heading => {
    const tag  = heading.tagName.toLowerCase();
    const id   = heading.id;
    const text = heading.textContent;

    if (tag === 'h2') {
      currentH2Item = document.createElement('li');
      currentH2Item.className = 'tree-item';

      const btn = document.createElement('button');
      btn.className = 'tree-toggle';
      btn.dataset.target = id;
      btn.innerHTML = `<span class="chevron">▶</span><span class="h2-icon"></span>${text}`;
      btn.addEventListener('click', () => {
        const sub = currentH2Item.querySelector('.subtree');
        if (!sub) return;
        const isOpen = sub.classList.contains('open');
        sub.classList.toggle('open', !isOpen);
        btn.classList.toggle('open', !isOpen);
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      currentH2Item.appendChild(btn);

      // Create subtree container
      currentSubtree = document.createElement('ul');
      currentSubtree.className = 'subtree';
      const inner = document.createElement('div');
      inner.className = 'subtree-inner';
      currentSubtree.appendChild(inner);
      currentH2Item.appendChild(currentSubtree);
      toc.appendChild(currentH2Item);

      currentH3Item = null;
      currentSubtreeH4 = null;

    } else if (tag === 'h3') {
      if (!currentSubtree) return;
      const inner = currentSubtree.querySelector('.subtree-inner');

      const li = document.createElement('li');
      li.className = 'tree-item';

      const a = document.createElement('a');
      a.className = 'tree-link-h3';
      a.href = '#' + id;
      a.textContent = text;
      a.addEventListener('click', e => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(a);

      // h4 sub-list
      currentSubtreeH4 = document.createElement('ul');
      currentSubtreeH4.className = 'subtree-h4';
      li.appendChild(currentSubtreeH4);

      inner.appendChild(li);
      currentH3Item = li;

    } else if (tag === 'h4') {
      if (!currentSubtreeH4) return;

      const li = document.createElement('li');
      const a  = document.createElement('a');
      a.className = 'tree-link-h4';
      a.href = '#' + id;
      a.textContent = text;
      a.addEventListener('click', e => {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      li.appendChild(a);
      currentSubtreeH4.appendChild(li);
    }
  });

  // Open first H2 subtree by default
  const firstToggle = toc.querySelector('.tree-toggle');
  const firstSub    = toc.querySelector('.subtree');
  if (firstToggle && firstSub) {
    firstSub.classList.add('open');
    firstToggle.classList.add('open');
  }
})();

// ── SCROLL PROGRESS BAR ──────────────────────────────────────
(function scrollProgress() {
  const bar = document.getElementById('progress-bar');
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${scrolled / total})`;
  }, { passive: true });
})();

// ── ACTIVE SIDEBAR HIGHLIGHT ON SCROLL ───────────────────────
(function activeHighlight() {
  const content  = document.getElementById('post-content');
  const headings = [...content.querySelectorAll('h2, h3, h4')];
  const allLinks = document.querySelectorAll('#toc a');
  const allBtns  = document.querySelectorAll('#toc .tree-toggle');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;

      // Clear all
      allLinks.forEach(l => l.classList.remove('active'));
      allBtns.forEach(b => b.classList.remove('active'));

      // Activate matching link
      const link = document.querySelector(`#toc a[href="#${id}"]`);
      if (link) link.classList.add('active');

      // Find parent H2 toggle
      const heading = entry.target;
      let prev = heading.previousElementSibling;
      while (prev) {
        if (prev.tagName === 'H2') {
          const btn = document.querySelector(`#toc .tree-toggle[data-target="${prev.id}"]`);
          if (btn) {
            btn.classList.add('active');
            // auto-open parent
            const li  = btn.closest('.tree-item');
            const sub = li?.querySelector('.subtree');
            if (sub && !sub.classList.contains('open')) {
              sub.classList.add('open');
              btn.classList.add('open');
            }
          }
          break;
        }
        prev = prev.previousElementSibling;
      }
      // if the heading itself is H2
      if (heading.tagName === 'H2') {
        const btn = document.querySelector(`#toc .tree-toggle[data-target="${id}"]`);
        if (btn) btn.classList.add('active');
      }
    });
  }, { rootMargin: '-15% 0px -70% 0px' });

  headings.forEach(h => observer.observe(h));
})();
