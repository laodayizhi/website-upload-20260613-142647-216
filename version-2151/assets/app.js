(() => {
  const panel = document.querySelector('[data-mobile-panel]');
  const menuButton = document.querySelector('[data-menu-button]');

  if (panel && menuButton) {
    menuButton.addEventListener('click', () => {
      panel.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const value = input ? input.value.trim() : '';
      const target = value ? `search.html?q=${encodeURIComponent(value)}` : 'search.html';
      window.location.href = target;
    });
  });

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dotsWrap = hero.querySelector('[data-hero-dots]');
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
    let timer = null;

    const dots = slides.map((_, dotIndex) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', `切换到第${dotIndex + 1}屏`);
      button.addEventListener('click', () => show(dotIndex));
      dotsWrap.appendChild(button);
      return button;
    });

    function show(nextIndex) {
      slides[index].classList.remove('is-active');
      dots[index].classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index].classList.add('is-active');
      dots[index].classList.add('is-active');
      restart();
    }

    function restart() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(() => show(index + 1), 5200);
    }

    if (slides.length > 0) {
      dots[index].classList.add('is-active');
      prev && prev.addEventListener('click', () => show(index - 1));
      next && next.addEventListener('click', () => show(index + 1));
      restart();
    }
  }

  const grid = document.querySelector('[data-filter-grid]');

  if (grid) {
    const keyword = document.querySelector('[data-filter-keyword]');
    const year = document.querySelector('[data-filter-year]');
    const reset = document.querySelector('[data-filter-reset]');
    const empty = document.querySelector('[data-filter-empty]');
    const cards = Array.from(grid.querySelectorAll('[data-card]'));

    function applyFilter() {
      const q = (keyword ? keyword.value : '').trim().toLowerCase();
      const y = year ? year.value : '';
      let shown = 0;

      cards.forEach((item) => {
        const haystack = `${item.dataset.title || ''} ${item.dataset.genre || ''} ${item.dataset.region || ''}`.toLowerCase();
        const matchesKeyword = !q || haystack.includes(q);
        const matchesYear = !y || item.dataset.year === y;
        const visible = matchesKeyword && matchesYear;
        item.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    }

    keyword && keyword.addEventListener('input', applyFilter);
    year && year.addEventListener('change', applyFilter);
    reset && reset.addEventListener('click', () => {
      if (keyword) {
        keyword.value = '';
      }
      if (year) {
        year.value = '';
      }
      applyFilter();
    });
  }
})();
