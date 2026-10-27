document.documentElement.classList.add('js');

const claimForm = document.querySelector('[data-supabase-claim]');
if (claimForm) {
  const invitation = location.hash.slice(1);
  if (/^[A-Za-z0-9_-]{40,1200}$/.test(invitation)) {
    document.getElementById('claim-token').value = invitation;
    // Remove the bearer invitation from browser history after reading it.
    history.replaceState(null, '', location.pathname);
  }
  claimForm.addEventListener('submit', () => {
    const button = claimForm.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Preparing your code…';
  });
}

const toggle = document.querySelector('[data-password-toggle]');
if (toggle) {
  toggle.hidden = false;
  toggle.addEventListener('click', () => {
    const field = document.getElementById('access-code');
    const show = field.type === 'password';
    field.type = show ? 'text' : 'password';
    toggle.setAttribute('aria-label', show ? 'Hide access code' : 'Show access code');
    toggle.setAttribute('aria-pressed', String(show));
  });
}

const search = document.getElementById('perk-search');
if (search) {
  const form = document.querySelector('.filter-form');
  const rows = [...document.querySelectorAll('[data-perk]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const sortOptions = [...document.querySelectorAll('.sort-toggle input')];
  let sort = sortOptions.find(option => option.checked)?.value || 'category';
  const list = document.querySelector('.perk-list');
  const reset = document.querySelector('[data-reset]');
  let category = filters.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.filter || '';
  function filter(updateUrl = true) {
    const words = search.value.toLowerCase().trim().split(/\s+/);
    let count = 0;
    for (const row of rows) {
      row.hidden = Boolean(category && row.dataset.category !== category) || !words.every(word => row.dataset.search.includes(word));
      if (!row.hidden) count += 1;
      else row.open = false;
    }
    for (const button of filters) {
      const selected = button.dataset.filter === category;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    }
    document.querySelector('.filter-submit').value = category;
    document.getElementById('result-count').textContent = `${count} ${count === 1 ? 'partner' : 'partners'}`;
    document.querySelector('.empty-state').hidden = count > 0;
    // Use server-generated ranks so browser and no-JavaScript ordering agree.
    for (const option of sortOptions) option.checked = option.value === sort;
    const attribute = `data-sort-${sort}`;
    rows.sort((a, b) => Number(a.getAttribute(attribute)) - Number(b.getAttribute(attribute)));
    list.append(...rows);
    const resetUrl = new URL(form.action);
    if (sort !== 'category') resetUrl.searchParams.set('sort', sort);
    reset.href = resetUrl.pathname + resetUrl.search;
    if (updateUrl) {
      const url = new URL(location.href);
      search.value.trim() ? url.searchParams.set('q', search.value.trim()) : url.searchParams.delete('q');
      category ? url.searchParams.set('category', category) : url.searchParams.delete('category');
      sort === 'category' ? url.searchParams.delete('sort') : url.searchParams.set('sort', sort);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
  }
  search.addEventListener('input', () => filter());
  sortOptions.forEach(option => option.addEventListener('change', () => { if (option.checked) { sort = option.value; filter(); } }));
  form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  filters.forEach(button => button.addEventListener('click', event => { event.preventDefault(); category = button.dataset.filter; filter(); }));
  reset.addEventListener('click', event => { event.preventDefault(); search.value = ''; category = ''; filter(); search.focus(); });
  window.addEventListener('popstate', () => { const url = new URL(location.href); search.value = url.searchParams.get('q') || ''; category = url.searchParams.get('category') || ''; sort = sortOptions.some(option => option.value === url.searchParams.get('sort')) ? url.searchParams.get('sort') : 'category'; filter(false); });
  if (location.hash) {
    const selected = rows.find(row => `#${row.id}` === location.hash);
    if (selected && !selected.hidden) selected.open = true;
  }
}

document.querySelectorAll('[data-copy]').forEach(button => {
  if (!navigator.clipboard) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById(button.dataset.copy).textContent);
      button.textContent = 'Copied';
    } catch { button.textContent = 'Select to copy'; }
    setTimeout(() => { button.textContent = 'Copy'; }, 2000);
  });
});

// Revalidate authentication on back/forward-cache restoration after signing out.
window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
