// ========================= Toast =========================
function toast(msg, type = 'ok', ms = 2500) {
  const box = document.getElementById('toast');
  if (!box) return alert(msg);
  const el = document.createElement('div');
  el.className = 'toast__item ' + type;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    setTimeout(() => el.remove(), 400);
  }, ms);
}

// ============== Локальна SVG-«обкладинка» ===============
function genCoverSVG(title, author) {
  const t = (title || '').trim();
  const a = (author || '').trim();
  const initials = ((t ? t[0] : '?') + (a ? a[0] : '')).toUpperCase();
  const bg = ['#2b59c3', '#8a2be2', '#006d77', '#6a994e', '#bc6c25', '#1d3557'][(t.length + a.length) % 6];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='720'>
    <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='${bg}' /><stop offset='100%' stop-color='#111827' /></linearGradient></defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <text x='50%' y='55%' text-anchor='middle' fill='white'
          font-family='Inter,Segoe UI,Arial' font-size='64' font-weight='700'>${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

// ======================= Улюблене ========================
const FAV_KEY = 'mylib_favorites';
function getFav() {
  try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); }
  catch { return new Set(); }
}
function setFav(s) { localStorage.setItem(FAV_KEY, JSON.stringify([...s])); }
function isFav(id) { return getFav().has(String(id)); }
function toggleFav(id) { const s = getFav(); const k = String(id); s.has(k) ? s.delete(k) : s.add(k); setFav(s); }

// ===================== API autodetect ====================
const API = typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : '/api/books';
function toItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.books)) return payload.books;
  return [];
}

// ======================= Тема (dark/light) ===============
function setTheme(name) {
  document.documentElement.classList.toggle('theme-light', name === 'light');
  localStorage.setItem('theme', name);
}
function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)').matches;
  setTheme(saved || (prefersLight ? 'light' : 'dark'));
}
document.addEventListener('DOMContentLoaded', initTheme);
document.getElementById('themeToggle')?.addEventListener('click', () => {
  const cur = localStorage.getItem('theme') || 'dark';
  setTheme(cur === 'dark' ? 'light' : 'dark');
});

// ======================= Хелпери =========================
function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function coverFromBook(b) {
  if (b.cover_url) return b.cover_url;
  if (b.isbn) return `https://covers.openlibrary.org/b/isbn/${encodeURIComponent(b.isbn)}-L.jpg`;
  return null;
}
// CSP-safe <img>
function createCoverImg(src) {
  const img = document.createElement('img');
  img.className = 'cover-img';
  img.loading = 'lazy';
  img.alt = '';
  img.src = src;
  img.addEventListener('load', () => img.classList.add('loaded'));
  img.addEventListener('error', () => img.remove());
  return img;
}

// ==================== Дані ===============================
let BOOKS = [];

// ==================== Лічильники =========================
function counters(list) {
  const total = list.length;
  const read = list.filter(x => x.status === 'PROCHYTANA').length;
  const plan = total - read;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statRead').textContent = read;
  document.getElementById('statPlan').textContent = plan;
}

// ==================== Рендер =============================
async function render(list) {
  const grid = document.getElementById('booksGrid');
  const loading = document.getElementById('loadingMessage');
  if (loading) loading.style.display = 'none';
  grid.innerHTML = '';
  counters(list);

  if (!list.length) {
    grid.innerHTML = '<div class="muted" style="padding:24px;">Порожньо. Додайте першу книгу.</div>';
    return;
  }

  for (const b of list) {
    const imgUrl = coverFromBook(b);
    const bgSvg = genCoverSVG(b.tytul, b.autor);

    const card = document.createElement('div');
    card.className = 'card';
    
    // Створення елементу метаінформації з роком та жанром
    const meta = [];
    meta.push(`${b.kilkist_storinyok || 0} стор.`);
    if (b.year_published) meta.push(`${b.year_published} р.`); // ДОДАНО
    if (b.genre) meta.push(esc(b.genre)); // ДОДАНО
    const metaHtml = meta.join(' • ');


    card.innerHTML = `
      <div class="card__cover">
        <div class="cover-fallback" style="background-image:url('${esc(bgSvg)}')"></div>
      </div>
      <div class="card__body">
        <div class="card__title">${esc(b.tytul)}</div>
        <div class="card__author">${esc(b.autor || '—')}</div>
        <div class="card__meta">
          <span class="badge ${b.status === 'PROCHYTANA' ? '' : 'plan'}">
            ${b.status === 'PROCHYTANA' ? 'Прочитано' : 'Планую'}
          </span>
          <span class="card__meta-details">${metaHtml}</span>
          <div class="kebab">
            <button class="kebab__btn" title="Дії">⋮</button>
            <div class="kebab__menu">
              <button class="menu-open" data-id="${b.id}">Опис</button>
              <button class="menu-edit" data-id="${b.id}">Редагувати</button>
              <button class="menu-del" data-id="${b.id}">Видалити</button>
              ${isFav(b.id)
                ? `<button class="menu-unfav" data-id="${b.id}">Прибрати з улюблених</button>`
                : `<button class="menu-fav" data-id="${b.id}">Додати до улюблених</button>`}
              ${b.status === 'PLANUYU'
                ? `<button class="menu-mark-read" data-id="${b.id}">Позначити як прочитано</button>`
                : ''}
              ${b.status === 'PROCHYTANA'
                ? `<button class="menu-mark-plan" data-id="${b.id}">Позначити як планую</button>`
                : ''}
            </div>
          </div>
        </div>
      </div>`;
    const coverBox = card.querySelector('.card__cover');
    if (imgUrl) coverBox.appendChild(createCoverImg(imgUrl));
    grid.appendChild(card);
  }
}

// =================== Фільтри / сортування ================
function applyFilters() {
  const favOnly = document.querySelector('.nav .nav__link.active')?.textContent.trim() === 'Улюблене';
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const st = document.getElementById('statusSelect').value;
  const sort = document.getElementById('sortSelect').value;

  let list = BOOKS.filter(b => {
    if (favOnly && !isFav(b.id)) return false;
    // Додаємо Жанр у пошук
    const m = (b.tytul + ' ' + (b.autor || '') + ' ' + (b.genre || '')).toLowerCase().includes(q);
    const s = !st || b.status === st;
    return m && s;
  });

  if (sort === '+title') list.sort((a, b) => a.tytul.localeCompare(b.tytul, 'uk'));
  else if (sort === '-title') list.sort((a, b) => b.tytul.localeCompare(a.tytul, 'uk'));
  else if (sort === '+date') list.sort((a, b) => new Date(a.data_dodania) - new Date(b.data_dodania));
  else list.sort((a, b) => new Date(b.data_dodania) - new Date(a.data_dodania));

  render(list);
}

// =================== Завантаження ========================
async function load() {
  const loadingEl = document.getElementById('loadingMessage');
  const grid = document.getElementById('booksGrid');
  if (loadingEl) loadingEl.style.display = 'block';
  console.log('[load] API =', API);

  try {
    const url = API.includes('?') ? API : `${API}?limit=1000&offset=0`;
    console.log('[load] fetching', url);
    const r = await fetch(url, { cache: 'no-store' });
    console.log('[load] status', r.status);

    if (!r.ok) throw new Error(r.status + ' ' + r.statusText);

    const data = await r.json();
    console.log('[load] payload', data);

    const items = toItems(data);
    console.log('[load] items length =', items.length);

    BOOKS = items;
    applyFilters();
  } catch (e) {
    console.error('[load] failed:', e);
    if (grid) {
      grid.innerHTML = `
        <div class="muted" style="padding:24px;">
          Не вдалося завантажити книги з API. Переконайтеся, що сервер запущений.
          <br/><small>${String(e && e.message || e)}</small>
        </div>`;
    }
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}


document.addEventListener('DOMContentLoaded', () => {
  load();
  ['searchInput', 'statusSelect', 'sortSelect'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', applyFilters);
    el?.addEventListener('change', applyFilters);
  });
});

// =================== Модалка книги =======================
function openModal(book) {
  const cover = coverFromBook(book) || genCoverSVG(book.tytul, book.autor);
  document.getElementById('modalCover').style.backgroundImage = `url('${esc(cover)}')`;
  document.getElementById('modalTitle').textContent = book.tytul || 'Без назви';
  document.getElementById('modalAuthor').textContent = book.autor || '';
  
  // ОНОВЛЕННЯ: відображення Year Published та Genre у modal-meta
  const meta = [];
  meta.push(`Сторінок: ${book.kilkist_storinyok || 0}`);
  if (book.year_published) meta.push(`Рік: ${book.year_published}`);
  if (book.genre) meta.push(`Жанр: ${esc(book.genre)}`);
  if (book.isbn) meta.push(`ISBN: ${book.isbn}`);
  
  document.getElementById('modalMeta').textContent = meta.join(' • ');

  document.getElementById('modalDesc').innerHTML = esc(book.description || 'Опис відсутній.');
  document.getElementById('modalBackdrop').classList.remove('hidden');
  document.getElementById('bookModal').classList.remove('hidden');
}
function closeModal() {
  document.getElementById('modalBackdrop').classList.add('hidden');
  document.getElementById('bookModal').classList.add('hidden');
}
document.getElementById('modalBackdrop')?.addEventListener('click', closeModal);
document.getElementById('modalClose')?.addEventListener('click', closeModal);

// ============== Делеговані дії (клік) ====================
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  // Kebab toggle (і фікс мерехтіння)
  if (btn.classList.contains('kebab__btn')) {
    const wrap = btn.parentElement; // .kebab
    document.querySelectorAll('.kebab').forEach(k => {
      if (k !== wrap) {
        k.classList.remove('open');
        k.closest('.card')?.classList.remove('menu-opened');
      }
    });
    wrap.classList.toggle('open');
    wrap.closest('.card')?.classList.toggle('menu-opened', wrap.classList.contains('open'));
    return;
  }

  // Опис
  if (btn.classList.contains('menu-open')) {
    const id = btn.dataset.id;
    const r = await fetch(`${API}/${id}`);
    const book = await r.json();
    openModal(book);
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }

  // Редагувати
  if (btn.classList.contains('menu-edit')) {
    const id = btn.dataset.id;
    const r = await fetch(`${API}/${id}`); const book = await r.json();
    document.getElementById('addTitle').value = book.tytul || '';
    document.getElementById('addAuthor').value = book.autor || '';
    document.getElementById('addPages').value = book.kilkist_storinyok || '';
    document.getElementById('addStatus').value = book.status || 'PLANUYU';
    // ДОДАНО: заповнення полів Рік та Жанр при редагуванні
    document.getElementById('year_published').value = book.year_published ?? '';
    document.getElementById('genre').value = book.genre ?? '';
    // Кінець ДОДАНО
    document.getElementById('addIsbn').value = book.isbn || '';
    document.getElementById('addCover').value = book.cover_url || '';
    document.getElementById('addModal').dataset.editId = id;
    document.querySelector('#addForm .primary').textContent = 'Зберегти';
    openAdd();
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }

  // Видалити
  if (btn.classList.contains('menu-del')) {
    const id = btn.dataset.id;
    if (!confirm('Видалити книгу?')) return;
    const r = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (r.status === 204) {
      BOOKS = BOOKS.filter(x => String(x.id) !== String(id));
      applyFilters();
    }
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }

  // Улюблене
  if (btn.classList.contains('menu-fav')) {
    toggleFav(btn.dataset.id);
    applyFilters();
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }
  if (btn.classList.contains('menu-unfav')) {
    toggleFav(btn.dataset.id);
    applyFilters();
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }

  // Позначити статус
  if (btn.classList.contains('menu-mark-read') || btn.classList.contains('menu-mark-plan')) {
    const id = btn.dataset.id;
    const status = btn.classList.contains('menu-mark-read') ? 'PROCHYTANA' : 'PLANUYU';
    const r1 = await fetch(`${API}/${id}`); const book = await r1.json();
    // ОНОВЛЕННЯ: передаємо рік та жанр у payload для PUT-запиту
    const payload = { 
      tytul: book.tytul, 
      autor: book.autor, 
      kilkist_storinyok: book.kilkist_storinyok, 
      status,
      year_published: book.year_published,
      genre: book.genre
    };
    const r2 = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (r2.ok) {
      const i = BOOKS.findIndex(x => String(x.id) === String(id));
      if (i > -1) BOOKS[i].status = status;
      applyFilters();
    }
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }
});

// =================== Add book modal ======================
function openAdd() {
  document.getElementById('addModalBackdrop').classList.remove('hidden');
  document.getElementById('addModal').classList.remove('hidden');
}
function closeAdd() {
  document.getElementById('addModal').dataset.editId = '';
  document.querySelector('#addForm .primary').textContent = 'Додати';
  document.getElementById('addModalBackdrop').classList.add('hidden');
  document.getElementById('addModal').classList.add('hidden');
}
document.getElementById('addBtn')?.addEventListener('click', openAdd);
document.getElementById('addClose')?.addEventListener('click', closeAdd);
document.getElementById('addCancel')?.addEventListener('click', closeAdd);

document.getElementById('addForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // ДОДАНО: Зчитування значень Рік та Жанр
  const yearEl = document.getElementById('year_published');
  const genreEl = document.getElementById('genre');

  const payload = {
    tytul: document.getElementById('addTitle').value.trim(),
    autor: document.getElementById('addAuthor').value.trim(),
    kilkist_storinyok: parseInt(document.getElementById('addPages').value || '0', 10),
    status: document.getElementById('addStatus').value,
    isbn: document.getElementById('addIsbn').value.trim() || undefined,
    cover_url: document.getElementById('addCover').value.trim() || undefined
  };
  
  // Додаємо Рік та Жанр до payload
  payload.year_published = yearEl && yearEl.value ? Number(yearEl.value) : undefined;
  const g = genreEl ? (genreEl.value || '').trim() : '';
  payload.genre = g.length ? g : undefined;
  
  try {
    if (!payload.cover_url) {
      const auto = await fetchCover(payload.tytul, payload.autor, payload.isbn);
      if (auto) payload.cover_url = auto;
    }
  } catch {}
  const editId = document.getElementById('addModal').dataset.editId;
  let r;
  if (editId) {
    r = await fetch(`${API}/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } else {
    r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  }
  if (r.ok) { closeAdd(); await load(); } else { alert('Помилка збереження'); }
});

// =================== Import modal ========================
function openImport() {
  document.getElementById('importModalBackdrop').classList.remove('hidden');
  document.getElementById('importModal').classList.remove('hidden');
}
function closeImport() {
  document.getElementById('importModalBackdrop').classList.add('hidden');
  document.getElementById('importModal').classList.add('hidden');
}
document.getElementById('importClose')?.addEventListener('click', closeImport);
document.getElementById('importCancel')?.addEventListener('click', closeImport);

document.getElementById('importBtn')?.addEventListener('click', async () => {
  const q = prompt('Введіть назву книги (і, за бажанням, автора через тире):');
  if (!q) return;
  const p = q.split('—').map(x => x.trim());
  // Спробувати серверний fetch-list
  try {
    const r = await fetch(`${API}/fetch-list`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ title: p[0] || '', author: p[1] || '' }])
    });
    if (r.ok) { await load(); return; }
  } catch {}
  // fallback: наш бекенд-пошук (обхід CSP)
  try {
    const rq = await fetch(`/api/ext/search?q=${encodeURIComponent(q)}`);
    const js = await rq.json();
    const it = js?.items?.[0];
    if (it) {
      await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tytul: it.title || p[0] || '',
          autor: it.author || p[1] || '',
          kilkist_storinyok: it.pages || 0,
          status: 'PLANUYU',
          isbn: it.isbn || undefined,
          cover_url: it.cover || undefined,
          description: it.description || undefined
          // Рік та жанр тут не відомі
        })
      });
      await load();
      return;
    }
  } catch {}
  alert('Не вдалося знайти книгу онлайн');
});

document.getElementById('importDo')?.addEventListener('click', async () => {
  const lines = document.getElementById('importText').value.split(/\n+/).map(x => x.trim()).filter(Boolean);
  if (!lines.length) return closeImport();
  const items = lines.map(l => {
    // ОНОВЛЕННЯ: Додаємо підтримку для Рік та Жанр в імпорті
    // Очікуваний формат: Назва — Автор — Сторінок — [STATUS] — [Рік] — [Жанр]
    const p = l.split('—').map(x => x.trim());
    return {
      tytul: p[0] || '',
      autor: p[1] || '',
      kilkist_storinyok: parseInt(p[2] || '0', 10) || 200,
      status: (p[3] || 'PLANUYU').toUpperCase().includes('ПРОЧ') ? 'PROCHYTANA' : 'PLANUYU',
      year_published: parseInt(p[4], 10) || undefined, // Рік
      genre: p[5] || undefined // Жанр
    };
  });
  try {
    await fetch(`${API}/bulk`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ books: items })
    });
    closeImport();
    await load();
  } catch { alert('Помилка імпорту'); }
});

// =========== Пошук обкладинки через наш бекенд ==========
async function fetchCover(title, author, isbn) {
  const u = new URL('/api/ext/cover', window.location.origin);
  if (isbn) u.searchParams.set('isbn', isbn);
  if (title) u.searchParams.set('title', title);
  if (author) u.searchParams.set('author', author);
  try {
    const r = await fetch(u.toString(), { cache: 'no-store' });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.url || null;
  } catch { return null; }
}

// ============== Збагачення (progress overlay) ===========
let enrichUI = null;
function enrichShow(total) {
  enrichUI = document.createElement('div');
  enrichUI.id = 'enrichOverlay';
  enrichUI.style.cssText = `
    position:fixed; right:16px; bottom:16px; z-index:1100;
    width:280px; padding:12px; border-radius:12px;
    background:rgba(17,24,39,.96); color:#fff;
    box-shadow:0 10px 26px rgba(0,0,0,.35); font:14px system-ui;`;
  enrichUI.innerHTML = `
    <div style="font-weight:700; margin-bottom:6px;">Збагачення</div>
    <div id="enrichText" style="opacity:.9; margin-bottom:8px;">0 / ${total}</div>
    <div style="height:8px; background:rgba(255,255,255,.15); border-radius:999px; overflow:hidden;">
      <div id="enrichBar" style="height:100%; width:0%; background:#7c3aed;"></div>
    </div>`;
  document.body.appendChild(enrichUI);
}
function enrichUpdate(done, total) {
  if (!enrichUI) return;
  const t = enrichUI.querySelector('#enrichText');
  const bar = enrichUI.querySelector('#enrichBar');
  if (t) t.textContent = `${done} / ${total}`;
  if (bar) bar.style.width = `${Math.round((done / Math.max(total, 1)) * 100)}%`;
}
function enrichHide() { enrichUI?.remove(); enrichUI = null; }

document.getElementById('enrichBtn')?.addEventListener('click', async () => {
  const targets = BOOKS.filter(b => !b.cover_url);
  if (!targets.length) { toast('Все вже з обкладинками 🙂', 'ok'); return; }

  const btn = document.getElementById('enrichBtn');
  btn.disabled = true;

  enrichShow(targets.length);
  let done = 0;

  for (const b of targets) {
    let url = null;
    try { url = await fetchCover(b.tytul, b.autor, b.isbn); } catch {}
    if (url) {
      try {
        await fetch(`${API}/${b.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tytul: b.tytul, autor: b.autor, kilkist_storinyok: b.kilkist_storinyok,
            status: b.status, isbn: b.isbn || undefined, cover_url: url,
            year_published: b.year_published, // ОНОВЛЕННЯ
            genre: b.genre // ОНОВЛЕННЯ
          })
        });
        b.cover_url = url;
        // миттєво оновити картку
        const trigger = document.querySelector(`.menu-open[data-id="${b.id}"]`);
        const card = trigger?.closest('.card');
        if (card) {
          const box = card.querySelector('.card__cover');
          box.querySelector('img')?.remove();
          box.appendChild(createCoverImg(url));
        }
      } catch {}
    }
    done += 1;
    enrichUpdate(done, targets.length);
    await new Promise(r => setTimeout(r, 10));
  }

  enrichHide();
  btn.disabled = false;
  toast('Збагачення виконано', 'ok');
});

// ============= Дрібні UI-покращення ======================
document.getElementById('searchInput')?.addEventListener('input', applyFilters);

// Закрити кебаб при кліку повз
document.addEventListener('click', (e) => {
  if (!e.target.closest('.kebab')) {
    document.querySelectorAll('.kebab').forEach(k => {
      k.classList.remove('open');
      k.closest('.card')?.classList.remove('menu-opened');
    });
  }
});

// ESC → закрити модалки
document.getElementById('addModalBackdrop')?.addEventListener('click', closeAdd);
document.getElementById('importModalBackdrop')?.addEventListener('click', closeImport);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAdd(); closeImport(); closeModal(); } });

// Навігація в топбарі
document.querySelectorAll('.nav .nav__link').forEach((link, idx) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav .nav__link').forEach(x => x.classList.remove('active'));
    link.classList.add('active');
    if (idx === 0) {
      document.getElementById('searchInput').value = '';
      document.getElementById('statusSelect').value = '';
      applyFilters();
    } else if (idx === 1) {
      // швидкий список авторів
      const authors = {};
      BOOKS.forEach(b => { const a = b.autor || '—'; authors[a] = (authors[a] || 0) + 1; });
      let html = '<div class="modal-card" style="grid-template-columns:1fr;"><button id="authorsClose" class="btn ghost small-x">✕</button><div class="modal-content"><h3>Автори</h3><ul>';
      Object.keys(authors).sort((a, b) => a.localeCompare(b, 'uk'))
        .forEach(a => { html += `<li style="margin:6px 0;display:flex;justify-content:space-between;"><span>${a}</span><span class="muted">${authors[a]}</span></li>`; });
      html += '</ul></div></div>';
      const m = document.createElement('div'); m.className = 'modal'; m.id = 'authorsModal'; m.innerHTML = html;
      const bd = document.createElement('div'); bd.className = 'modal-backdrop'; bd.id = 'authorsBackdrop';
      document.body.appendChild(bd); document.body.appendChild(m);
      function closeA(){ bd.remove(); m.remove(); }
      bd.addEventListener('click', closeA);
      m.querySelector('#authorsClose').addEventListener('click', closeA);
    } else if (idx === 2) {
      document.getElementById('statusSelect').value = 'PROCHYTANA'; applyFilters();
    }
  });
});

// Надійні закриття Add-модалки
(function () {
  const closeBtns = [document.getElementById('addClose'), document.getElementById('addCancel')];
  closeBtns.forEach(b => b && b.addEventListener('click', (ev) => { ev.preventDefault(); closeAdd(); }));
  document.getElementById('addModalBackdrop')?.addEventListener('click', closeAdd);
})();

// «Улюблене» як окремий фільтр
(function () {
  const links = document.querySelectorAll('.nav .nav__link');
  links.forEach((link) => {
    if (link.textContent.trim() === 'Улюблене') {
      link.addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('statusSelect').value = '';
        applyFilters();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  });
})();

// ============= Lazy ensure cover (через бекенд) ==========
async function ensureCover(b) {
  if (coverFromBook(b)) return b;
  const url = await fetchCover(b.tytul, b.autor, b.isbn);
  if (url) b.cover_url = url;
  return b;
}
(async function () {
  const needs = BOOKS.filter(b => !coverFromBook(b));
  for (const b of needs) {
    const before = b.cover_url;
    await ensureCover(b);
    if (b.cover_url && b.cover_url !== before) {
      const trigger = document.querySelector(`.menu-open[data-id="${b.id}"]`);
      const card = trigger?.closest('.card');
      if (card) {
        const box = card.querySelector('.card__cover');
        box.querySelector('img')?.remove();
        box.appendChild(createCoverImg(b.cover_url));
      }
      try {
        await fetch(`${API}/${b.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tytul: b.tytul, autor: b.autor, kilkist_storinyok: b.kilkist_storinyok,
            status: b.status, cover_url: b.cover_url, isbn: b.isbn || undefined,
            year_published: b.year_published, // ОНОВЛЕННЯ
            genre: b.genre // ОНОВЛЕННЯ
          })
        });
      } catch {}
    }
  }
})();

// ========= Зовнішній пошук (через бекенд-проксі) =========
async function extSearch() {
  const q = document.getElementById('extQuery')?.value.trim();
  if (!q) return;
  const box = document.getElementById('extResults');
  if (!box) return;

  box.innerHTML = '<div class="muted">Шукаю…</div>';

  let data = { items: [] };
  try {
    const r = await fetch(`/api/ext/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
    if (r.ok) data = await r.json();
  } catch {}

  const uniq = new Map();
  for (const it of (data.items || [])) {
    const key = `${(it.title || '').toLowerCase()}|${(it.author || '').toLowerCase()}`;
    if (!uniq.has(key)) uniq.set(key, it);
  }
  const items = [...uniq.values()].slice(0, 20);

  if (!items.length) { box.innerHTML = '<div class="muted">Нічого не знайдено.</div>'; return; }

  box.innerHTML = '';
  items.forEach((it, idx) => {
    const cover = it.cover || null;
    const fallback = genCoverSVG(it.title, it.author);

    const card = document.createElement('div');
    card.className = 'ext-card';
    card.innerHTML = `
      <div class="ext-cover">
        <div class="cover-fallback" style="background-image:url('${esc(fallback)}')"></div>
      </div>
      <div class="ext-body">
        <div class="ext-title">${esc(it.title || '—')}</div>
        <div class="ext-meta">${esc(it.author || '')}</div>
        <div class="ext-meta">
          ${it.pages || 0} стор.
          ${it.year ? ` • ${it.year} р.` : ''}
          ${it.genre ? ` • ${esc(it.genre)}` : ''}
        </div>
        <button class="btn small" data-ext="${idx}">Додати</button>
      </div>`;
    if (cover) card.querySelector('.ext-cover').appendChild(createCoverImg(cover));
    box.appendChild(card);
  });

  box.querySelectorAll('button[data-ext]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const it = items[Number(btn.getAttribute('data-ext'))];
      try {
        await fetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tytul: it.title,
            autor: it.author,
            kilkist_storinyok: it.pages || 0,
            status: 'PLANUYU',
            isbn: it.isbn,
            cover_url: it.cover,
            description: it.description,
            year_published: it.year, // ДОДАНО
            genre: it.genre // ДОДАНО
          })
        });
        toast('Книгу додано', 'ok');
        await load();
      } catch { toast('Не вдалося додати', 'err'); }
    });
  });
}
document.getElementById('extSearchBtn')?.addEventListener('click', extSearch);
document.getElementById('extQuery')?.addEventListener('keydown', (e) => { if (e.key === 'Enter') extSearch(); });
