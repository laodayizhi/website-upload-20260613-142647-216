(() => {
  const input = document.getElementById('searchInput');
  const yearSelect = document.getElementById('searchYear');
  const button = document.getElementById('searchButton');
  const results = document.getElementById('searchResults');
  const empty = document.getElementById('searchEmpty');
  const data = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : SITE_MOVIES;

  if (!input || !yearSelect || !button || !results || !empty) {
    return;
  }

  const years = Array.from(new Set(data.map((item) => item.year).filter(Boolean))).sort((a, b) => Number(b) - Number(a));
  years.forEach((year) => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q') || '';
  input.value = query;

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function render(items) {
    results.innerHTML = items.map((item) => {
      const tags = (item.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('');
      return `
<article class="movie-card">
  <a class="poster" href="${escapeHtml(item.url)}" aria-label="${escapeHtml(item.title)}">
    <img src="${escapeHtml(item.cover)}" alt="${escapeHtml(item.title)}" loading="lazy">
    <span class="play-mark">▶</span>
    <span class="duration">${escapeHtml(item.duration)}</span>
  </a>
  <div class="movie-card-body">
    <a class="movie-title" href="${escapeHtml(item.url)}">${escapeHtml(item.title)}</a>
    <p>${escapeHtml(item.description)}</p>
    <div class="meta-line">
      <span>${escapeHtml(item.year)}</span>
      <span>${escapeHtml(item.region)}</span>
      <span>${Number(item.rating).toFixed(1)}分</span>
    </div>
    <div class="tag-line">${tags}</div>
  </div>
</article>`;
    }).join('');
    empty.textContent = items.length ? '' : '没有匹配的影片';
    empty.classList.toggle('is-visible', items.length === 0);
  }

  function search() {
    const keyword = input.value.trim().toLowerCase();
    const year = yearSelect.value;
    const items = data.filter((item) => {
      const haystack = `${item.title} ${item.description} ${item.genre} ${item.region} ${item.category} ${(item.tags || []).join(' ')}`.toLowerCase();
      const okKeyword = !keyword || haystack.includes(keyword);
      const okYear = !year || item.year === year;
      return okKeyword && okYear;
    }).slice(0, 120);
    render(items);
  }

  button.addEventListener('click', search);
  input.addEventListener('input', search);
  yearSelect.addEventListener('change', search);

  if (query) {
    search();
  }
})();
