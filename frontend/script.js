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

// ========================= I18N ==========================
const SUPPORTED_LANGS = ["ua", "pl"];
const LANG_STORAGE_KEY = "mylib_lang";

let currentLang = localStorage.getItem(LANG_STORAGE_KEY);
if (!SUPPORTED_LANGS.includes(currentLang)) {
  currentLang = "ua";
}

const I18N = {
  ua: {
    "nav.catalog": "Каталог",
    "nav.authors": "Автори",
    "nav.favorites": "Улюблене",

    "btn.enrich": "Збагачення",
    "btn.theme": "Тема",
    "btn.login": "Увійти",
    "btn.logout": "Вийти",
    "btn.add_book": "Додати книгу",
    "btn.import": "Імпорт",

    "intro.title": "MyLibrary – твоя приватна бібліотека онлайн",
    "intro.p1": "Цей застосунок допомагає зберігати прочитані й заплановані книги.",
    "intro.p2": "Список книг і операції CRUD доступні лише після входу в систему.",

    "filters.search": "Пошук по назві або автору...",
    "filters.status_all": "Статус: Усі",
    "filters.status_read": "Прочитано",
    "filters.status_plan": "Планую",
    "filters.sort_new": "Сортування: Нові",
    "filters.sort_old": "Сортування: Старі",
    "filters.sort_title_az": "Назва A–Я",
    "filters.sort_title_za": "Назва Я–A",

    "counters.total": "Всього:",
    "counters.read": "Прочитано:",
    "counters.plan": "Планую:",

    "books.empty": "Порожньо. Додайте першу книгу.",
    "books.status.read": "Прочитано",
    "books.status.plan": "Планую",
    "books.pages_short": "стор.",

    "fav.add": "Улюблене",
    "fav.remove": "Прибрати з улюблених",

    "menu.actions": "Дії",
    "menu.open": "Відкрити",
    "menu.edit": "Редагувати",
    "menu.delete": "Видалити",
    "menu.mark_read": "Позначити як прочитано",
    "menu.mark_plan": "Позначити як планую",

    "ext.searching": "Шукаю…",
    "ext.nothing": "Нічого не знайдено.",
    "ext.add_btn": "Додати",

    "toast.book_added": "Книгу додано",
    "toast.book_add_failed": "Не вдалося додати",

    "btn.cancel": "Скасувати",
    "btn.add": "Додати",
    "btn.save": "Зберегти",

    "add.title": "Додати книгу",
    "add.label.title": "Назва",
    "add.label.author": "Автор",
    "add.label.pages": "Сторінок",
    "add.label.status": "Статус",
    "add.status.plan": "Планую",
    "add.status.read": "Прочитано",
    "add.label.isbn": "ISBN (необов'язково)",
    "add.label.cover": "Посилання на обкладинку (необов'язково)",
    "add.label.opis_67664": "Opis / notatki (opcjonalnie)",
    "add.placeholder.opis_67664": "Короткий опис або твої нотатки...",

    "books.pages_label": "Сторінок",
    "books.no_description": "Опис відсутній.",

    "auth.login_required": "Щоб побачити свою бібліотеку, спочатку увійдіть.",

    "authors.title": "Автори",
    "authors.subtitle": "Список унікальних авторів та кількість книжок у твоїй бібліотеці.",
    "authors.empty": "Ще немає жодної книги, щоб показати авторів.",

    "ext.title": "Пошук у відкритих базах",
    "ext.search_placeholder": "Пошук у відкритих базах",
    "ext.search_btn": "Знайти в базах",

    "ext.results_title": "Результати пошуку у відкритих базах",
    "ext.back_to_library": "Повернутись до своєї бібліотеки",

  },
  pl: {
    "nav.catalog": "Katalog",
    "nav.authors": "Autorzy",
    "nav.favorites": "Ulubione",

    "btn.enrich": "Wzbogacenie",
    "btn.theme": "Motyw",
    "btn.login": "Zaloguj",
    "btn.logout": "Wyloguj",
    "btn.add_book": "Dodaj książkę",
    "btn.import": "Import",

    "intro.title": "MyLibrary – Twoja prywatna biblioteka online",
    "intro.p1": "Ta aplikacja pozwala zapisać przeczytane i planowane książki.",
    "intro.p2": "Lista książek i akcje CRUD są widoczne dopiero po zalogowaniu.",

    "filters.search": "Szukaj po tytule lub autorze...",
    "filters.status_all": "Status: wszystkie",
    "filters.status_read": "Przeczytane",
    "filters.status_plan": "Planuję",
    "filters.sort_new": "Sortowanie: najnowsze",
    "filters.sort_old": "Sortowanie: najstarsze",
    "filters.sort_title_az": "Tytuł A–Z",
    "filters.sort_title_za": "Tytuł Z–A",

    "counters.total": "Razem:",
    "counters.read": "Przeczytane:",
    "counters.plan": "Planuję:",

    "books.empty": "Brak książek. Dodaj pierwszą pozycję.",
    "books.status.read": "Przeczytane",
    "books.status.plan": "Planuję",
    "books.pages_short": "str.",

    "fav.add": "Ulubione",
    "fav.remove": "Usuń z ulubionych",

    "menu.actions": "Akcje",
    "menu.open": "Otwórz",
    "menu.edit": "Edytuj",
    "menu.delete": "Usuń",
    "menu.mark_read": "Oznacz jako przeczytane",
    "menu.mark_plan": "Oznacz jako do przeczytania",

    "ext.searching": "Szukam…",
    "ext.nothing": "Nic nie znaleziono.",
    "ext.add_btn": "Dodaj",

    "toast.book_added": "Książka dodana",
    "toast.book_add_failed": "Nie udało się dodać",

    "btn.cancel": "Anuluj",
    "btn.add": "Dodaj",
    "btn.save": "Zapisz",

    "add.title": "Dodaj książkę",
    "add.label.title": "Tytuł",
    "add.label.author": "Autor",
    "add.label.pages": "Stron",
    "add.label.status": "Status",
    "add.status.plan": "Planuję",
    "add.status.read": "Przeczytane",
    "add.label.isbn": "ISBN (opcjonalnie)",
    "add.label.cover": "Link do okładki (opcjonalnie)",
    "add.label.opis_67664": "Opis / notatki (opcjonalnie)",
    "add.placeholder.opis_67664": "Krótki opis albo Twoje notatki...",

    "books.pages_label": "Stron",
    "books.no_description": "Brak opisu.",

    "auth.login_required": "Aby zobaczyć swoją bibliotekę, najpierw się zaloguj.",

    "authors.title": "Autorzy",
    "authors.subtitle": "Lista unikalnych autorów i liczba książek w Twojej bibliotece.",
    "authors.empty": "Nie ma jeszcze żadnej książki, aby wyświetlić autorów.",

    "ext.title": "Wyszukiwanie w otwartych bazach",
    "ext.search_placeholder": "Szukaj w otwartych bazach",
    "ext.search_btn": "Szukaj w bazach",

   "ext.results_title": "Wyniki wyszukiwania w otwartych bazach",
    "ext.back_to_library": "Wróć do swojej biblioteki"

  }
};

function t(key, fallback) {
  const dict = I18N[currentLang] || I18N.ua;
  return dict[key] || fallback || key;
}

function applyI18nToDom() {
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key, el.textContent);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (!key) return;
    const fallback = el.getAttribute("placeholder") || "";
    el.setAttribute("placeholder", t(key, fallback));
  });
}

function updateLangButtonsUI() {
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
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

// ======================= ulubiony ========================
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

// ===================== Auth (token) ======================
const TOKEN_KEY = 'mylib_token';
const USER_KEY = 'mylib_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY) || null;
}
function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}
function getUser() {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); }
  catch { return null; }
}
function setUser(u) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}
function isLoggedIn() {
  return !!getToken();
}

async function apiFetch(input, options = {}) {
  const opts = { ...(options || {}) };
  opts.headers = { ...(options && options.headers) };
  const token = getToken();
  if (token) {
    opts.headers['Authorization'] = 'Bearer ' + token;
  }
  return fetch(input, opts);
}

function updateAuthUI() {
  const logged = isLoggedIn();
  const addBtn = document.getElementById('addBtn');
  const importBtn = document.getElementById('importBtn');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (addBtn) addBtn.classList.toggle('hidden', !logged);
  if (importBtn) importBtn.classList.toggle('hidden', !logged);
  if (logoutBtn) logoutBtn.classList.toggle('hidden', !logged);
  if (loginBtn) loginBtn.classList.toggle('hidden', logged);
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

// ===================== Auth modal ========================
function openAuthModal() {
  document.getElementById('authModalBackdrop')?.classList.remove('hidden');
  document.getElementById('authModal')?.classList.remove('hidden');
  document.body.classList.add('modal-open');
}
function closeAuthModal() {
  document.getElementById('authModalBackdrop')?.classList.add('hidden');
  document.getElementById('authModal')?.classList.add('hidden');
  document.body.classList.remove('modal-open');
}
function showLoginTab() {
  document.getElementById('loginForm')?.classList.remove('hidden');
  document.getElementById('registerForm')?.classList.add('hidden');
}
function showRegisterTab() {
  document.getElementById('loginForm')?.classList.add('hidden');
  document.getElementById('registerForm')?.classList.remove('hidden');
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

// ==================== Render =============================
async function render(list) {
  const grid = document.getElementById('booksGrid');
  const loading = document.getElementById('loadingMessage');

  // Приховуємо лоадер
  if (loading) loading.style.display = 'none';
  
  // Очищаємо сітку та оновлюємо лічильники
  grid.innerHTML = '';
  counters(list);

  // Якщо список порожній
  if (!list.length) {
    grid.innerHTML = `<div class="muted" style="padding:24px;">${t('books.empty', 'Порожньо. Додайте першу книгу.')}</div>`;
    return;
  }

  // Рендеринг карток
  for (const b of list) {
    const imgUrl = coverFromBook(b);
    const bgSvg = genCoverSVG(b.tytul, b.autor);

    // Блок дій (Кебаб-меню) з локалізацією
    const actionsHtml = isLoggedIn() ? `
      <div class="kebab">
        <button class="kebab__btn" title="${t('menu.actions', 'Дії')}">⋮</button>
        <div class="kebab__menu">
          <button class="menu-open" data-id="${b.id}">${t('menu.open', 'Відкрити')}</button>
          <button class="menu-edit" data-id="${b.id}">${t('menu.edit', 'Редагувати')}</button>
          <button class="menu-del" data-id="${b.id}">${t('menu.delete', 'Видалити')}</button>
          <button class="${isFav(b.id) ? 'menu-unfav' : 'menu-fav'}" data-id="${b.id}">
            ${isFav(b.id) 
              ? t('fav.remove', 'Прибрати з улюблених') 
              : t('fav.add', 'Улюблене')}
          </button>
          ${b.status === 'PLANUYU'
            ? `<button class="menu-mark-read" data-id="${b.id}">${t('menu.mark_read', 'Позначити як прочитано')}</button>`
            : ''}
          ${b.status === 'PROCHYTANA'
            ? `<button class="menu-mark-plan" data-id="${b.id}">${t('menu.mark_plan', 'Позначити як планую')}</button>`
            : ''}
        </div>
      </div>` : '';

    // Створення елемента картки
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div class="card__cover">
        <div class="cover-fallback" style="background-image:url('${esc(bgSvg)}')"></div>
      </div>
      <div class="card__body">
        <div class="card__title">${esc(b.tytul)}</div>
        <div class="card__author">${esc(b.autor || '—')}</div>
        
        <div class="card__meta">
          <span class="badge ${b.status === 'PROCHYTANA' ? '' : 'plan'}">
            ${b.status === 'PROCHYTANA'
              ? t('books.status.read', 'Прочитано')
              : t('books.status.plan', 'Планую')}
          </span>
          <span>${b.kilkist_storinyok || 0} ${t('books.pages_short', 'стор.')}</span>
          
          ${actionsHtml}
        </div>
      </div>`;

    // Додавання картинки обкладинки, якщо вона є
    const coverBox = card.querySelector('.card__cover');
    if (imgUrl) {
      coverBox.appendChild(createCoverImg(imgUrl));
    }

    grid.appendChild(card);
  }
}

// =================== Filtry / sortowanie ================
function applyFilters() {
  const activeLink = document.querySelector('.nav .nav__link.active');
  const favOnly = activeLink?.dataset.view === 'favorites';
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const st = document.getElementById('statusSelect').value;
  const sort = document.getElementById('sortSelect').value;

  let list = BOOKS.filter(b => {
    if (favOnly && !isFav(b.id)) return false;
    const m = (b.tytul + ' ' + (b.autor || '')).toLowerCase().includes(q);
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
    const r = await apiFetch(url, { cache: 'no-store' });
    console.log('[load] status', r.status);

    if (r.status === 401 || r.status === 403) {
      BOOKS = [];
      if (grid) {
        grid.innerHTML = `
          <div class="muted" style="padding:24px;">
            ${t('auth.login_required', 'Aby zobaczyć swoją bibliotekę, najpierw się zaloguj.')}
          </div>`;
      }
      return;
    }

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
          Nie udało się pobrać danych z API.
          <br/><small>${String(e && e.message || e)}</small>
        </div>`;
    }
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}



document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();

// --- I18N init ---
  applyI18nToDom();
  updateLangButtonsUI();
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      if (!SUPPORTED_LANGS.includes(lang)) return;
      currentLang = lang;
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      applyI18nToDom();
      render(BOOKS);
      updateLangButtonsUI();
    });
  });

  load();

  const extBtn = document.getElementById('extSearchBtn');
  const extInput = document.getElementById('extQuery');
  if (extBtn) {
    extBtn.addEventListener('click', extSearch);
  }
  if (extInput) {
    extInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') extSearch();
    });
  }

  ['searchInput', 'statusSelect', 'sortSelect'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    }
  });

  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const authClose = document.getElementById('authClose');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      showLoginTab();
      openAuthModal();
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setToken(null);
      setUser(null);
      updateAuthUI();
      BOOKS = [];
      applyFilters();
      toast('Wylogowano.', 'ok');
    });
  }

  if (authClose) {
    authClose.addEventListener('click', () => {
      closeAuthModal();
    });
  }

  if (tabLogin) {
    tabLogin.addEventListener('click', () => {
      showLoginTab();
    });
  }

  if (tabRegister) {
    tabRegister.addEventListener('click', () => {
      showRegisterTab();
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const login = document.getElementById('loginLogin').value;
      const password = document.getElementById('loginPassword').value;
      try {
        const r = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          toast(data.error || 'Nie udało się zalogować.', 'error');
          return;
        }
        setToken(data.token);
        setUser(data.user);
        updateAuthUI();
        closeAuthModal();
        toast('Zalogowano.', 'ok');
        load();
      } catch {
        toast('Błąd sieci podczas logowania.', 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const login = document.getElementById('registerLogin').value;
      const password = document.getElementById('registerPassword').value;
      try {
        const r = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password })
        });
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          toast(data.error || 'Rejestracja nie powiodła się.', 'error');
          return;
        }
        setToken(data.token);
        setUser(data.user);
        updateAuthUI();
        closeAuthModal();
        toast('Konto utworzone i zalogowano.', 'ok');
        load();
      } catch {
        toast('Błąd sieci podczas rejestracji.', 'error');
      }
    });
  }
});



// =================== Модалка книги =======================
function openModal(book) {
  const cover = coverFromBook(book) || genCoverSVG(book.tytul, book.autor);
  document.getElementById('modalCover').style.backgroundImage = `url('${esc(cover)}')`;
  document.getElementById('modalTitle').textContent = book.tytul || 'Без назви';
  document.getElementById('modalAuthor').textContent = book.autor || '';
  document.getElementById('modalMeta').textContent =
    `${t('books.pages_label', 'Сторінок')}: ${book.kilkist_storinyok || 0}${book.isbn ? ` • ISBN: ${book.isbn}` : ''}`;
  document.getElementById('modalDesc').innerHTML = esc((book.opis_67664 || book.description) || t('books.no_description', 'Опис відсутній.'));
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
    const r = await apiFetch(`${API}/${id}`);
    const book = await r.json();
    openModal(book);
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }

  // Редагувати
  if (btn.classList.contains('menu-edit')) {
    const id = btn.dataset.id;
    const r = await apiFetch(`${API}/${id}`); const book = await r.json();
    document.getElementById('addTitle').value = book.tytul || '';
    document.getElementById('addAuthor').value = book.autor || '';
    document.getElementById('addPages').value = book.kilkist_storinyok || '';
    document.getElementById('addStatus').value = book.status || 'PLANUYU';
    document.getElementById('addIsbn').value = book.isbn || '';
    document.getElementById('addCover').value = book.cover_url || '';
    document.getElementById('addOpis_67664').value = (book.opis_67664 || book.description) || '';
    document.getElementById('addModal').dataset.editId = id;
    setAddSubmitMode('edit');
    openAdd();
    btn.closest('.kebab')?.classList.remove('open');
    btn.closest('.card')?.classList.remove('menu-opened');
    return;
  }

  // Видалити
  if (btn.classList.contains('menu-del')) {
    const id = btn.dataset.id;
    if (!confirm('Видалити книгу?')) return;
    const r = await apiFetch(`${API}/${id}`, { method: 'DELETE' });
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
    const r1 = await apiFetch(`${API}/${id}`); const book = await r1.json();
    const payload = { tytul: book.tytul, autor: book.autor, kilkist_storinyok: book.kilkist_storinyok, status };
    const r2 = await apiFetch(`${API}/${id}`, {
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
function setAddSubmitMode(mode) {
  const btn = document.getElementById('addSubmit');
  if (!btn) return;
  const key = mode === 'edit' ? 'btn.save' : 'btn.add';
  btn.setAttribute('data-i18n', key);
  btn.textContent = t(key, btn.textContent);
}

function openAdd() {
  document.getElementById('addModalBackdrop').classList.remove('hidden');
  document.getElementById('addModal').classList.remove('hidden');
}
function closeAdd() {
  document.getElementById('addModal').dataset.editId = '';
  setAddSubmitMode('add');
  document.getElementById('addModalBackdrop').classList.add('hidden');
  document.getElementById('addModal').classList.add('hidden');
}
document.getElementById('addBtn')?.addEventListener('click', openAdd);
document.getElementById('addClose')?.addEventListener('click', closeAdd);
document.getElementById('addCancel')?.addEventListener('click', closeAdd);

document.getElementById('addForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const payload = {
    tytul: document.getElementById('addTitle').value.trim(),
    autor: document.getElementById('addAuthor').value.trim(),
    kilkist_storinyok: parseInt(document.getElementById('addPages').value || '0', 10),
    status: document.getElementById('addStatus').value,
    isbn: document.getElementById('addIsbn').value.trim() || undefined,
    cover_url: document.getElementById('addCover').value.trim() || undefined,
    opis_67664: document.getElementById('addOpis_67664').value.trim() || undefined
  };
  try {
    if (!payload.cover_url) {
      const auto = await fetchCover(payload.tytul, payload.autor, payload.isbn);
      if (auto) payload.cover_url = auto;
    }
  } catch {}
  const editId = document.getElementById('addModal').dataset.editId;
  let r;
  if (editId) {
    r = await apiFetch(`${API}/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  } else {
    r = await apiFetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
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
  // Spróbuj po stronie serwera fetch-list
  try {
    const r = await apiFetch(`${API}/fetch-list`, {
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
      await apiFetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tytul: it.title || p[0] || '',
          autor: it.author || p[1] || '',
          kilkist_storinyok: it.pages || 0,
          status: 'PLANUYU',
          isbn: it.isbn || undefined,
          cover_url: it.cover || undefined,
          opis_67664: it.description || undefined
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
    const p = l.split('—').map(x => x.trim());
    return {
      tytul: p[0] || '',
      autor: p[1] || '',
      kilkist_storinyok: parseInt(p[2] || '0', 10) || 200,
      status: (p[3] || 'PLANUYU').toUpperCase().includes('ПРОЧ') ? 'PROCHYTANA' : 'PLANUYU'
    };
  });
  try {
    await apiFetch(`${API}/bulk`, {
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
    const r = await apiFetch(u.toString(), { cache: 'no-store' });
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
        await apiFetch(`${API}/${b.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tytul: b.tytul, autor: b.autor, kilkist_storinyok: b.kilkist_storinyok,
            status: b.status, isbn: b.isbn || undefined, cover_url: url
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
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeAdd(); closeImport(); closeModal();
 } });

 // -------------------- Authors modal ---------------------
function openAuthorsModal() {
  const authorsMap = {};
  BOOKS.forEach((b) => {
    const name = (b.autor || '—').trim();
    if (!name) return;
    authorsMap[name] = (authorsMap[name] || 0) + 1;
  });

  const names = Object.keys(authorsMap).sort((a, b) =>
    a.localeCompare(b, currentLang === 'pl' ? 'pl' : 'uk')
  );

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'authorsBackdrop';

  const modal = document.createElement('div');
  modal.className = 'modal authors-modal';
  modal.id = 'authorsModal';

  let inner = `
    <div class="modal-card modal-card--authors">
      <button class="modal-close" type="button" id="authorsClose" aria-label="Close">✕</button>
      <div class="modal-content">
        <h3>${t ? t('authors.title', 'Автори') : 'Автори'}</h3>
        <p class="muted">
          ${t ? t('authors.subtitle', 'Список унікальних авторів та кількість книжок у твоїй бібліотеці.') :
               'Список унікальних авторів та кількість книжок у твоїй бібліотеці.'}
        </p>
        <div class="authors-grid">
  `;

  if (names.length) {
    names.forEach((name) => {
      inner += `
          <div class="authors-grid__row">
            <span class="authors-grid__name">${name}</span>
            <span class="authors-grid__count">${authorsMap[name]}</span>
          </div>`;
    });
  } else {
    inner += `
          <div class="muted" style="padding-top:8px;">
            ${t ? t('authors.empty', 'Ще немає жодної книги, щоб показати авторів.') :
                 'Ще немає жодної книги, щоб показати авторів.'}
          </div>`;
  }

  inner += `
        </div>
      </div>
    </div>
  `;

  modal.innerHTML = inner;

  function closeAuthors() {
    backdrop.remove();
    modal.remove();
    document.body.classList.remove('modal-open');
  }

  backdrop.addEventListener('click', closeAuthors);
  modal.querySelector('#authorsClose')?.addEventListener('click', closeAuthors);
  document.addEventListener('keydown', function escHandler(e) {
    if (e.key === 'Escape') {
      closeAuthors();
      document.removeEventListener('keydown', escHandler);
    }
  });

  document.body.appendChild(backdrop);
  document.body.appendChild(modal);
  document.body.classList.add('modal-open');
}


// Навігація в топбарі
document.querySelectorAll('.nav .nav__link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav .nav__link').forEach(x => x.classList.remove('active'));
    link.classList.add('active');

    const view = link.dataset.view || 'catalog';

    if (view === 'catalog') {
      document.getElementById('searchInput').value = '';
      document.getElementById('statusSelect').value = '';
      applyFilters();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'authors') {
      openAuthorsModal();
    }
    // view === 'favorites' ми вже обробляємо нижче в IIFE «Улюблене як окремий фільтр»
  });
});


// «Улюблене» як окремий фільтр
(function () {
  const links = document.querySelectorAll('.nav .nav__link');
  links.forEach((link) => {
    if (link.dataset.view === 'favorites') {
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
        await apiFetch(`${API}/${b.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tytul: b.tytul, autor: b.autor, kilkist_storinyok: b.kilkist_storinyok,
            status: b.status, cover_url: b.cover_url, isbn: b.isbn || undefined
          })
        });
      } catch {}
    }
  }
})();

// ========= Зовнішній пошук (через бекенд-проксі) =========
async function extSearch() {
  const qEl = document.getElementById('extQuery');
  const q = qEl?.value.trim();
  if (!q) return;

  const box = document.getElementById('extResults');
  const grid = document.getElementById('booksGrid');
  if (!box) return;

  // очищаємо власні карточки, щоб показати тільки пропозиції
  if (grid) {
    grid.innerHTML = '';
  }

  box.innerHTML = `<div class="muted">${t('ext.searching', 'Шукаю…')}</div>`;

  let data = { items: [] };
  try {
    const r = await fetch(`/api/ext/search?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
    if (r.ok) data = await r.json();
  } catch (e) {
    console.error('[extSearch] request failed', e);
  }

  const uniq = new Map();
  for (const it of (data.items || [])) {
    const key = `${(it.title || '').toLowerCase()}|${(it.author || '').toLowerCase()}`;
    if (!uniq.has(key)) uniq.set(key, it);
  }

  let items = [...uniq.values()];

  // 1) Перевага назвам кирилицею (ймовірно українські / російські видання, напр. Yakaboo)
  const cyr = items.filter((it) =>
    /[А-Яа-яЁёЇїІіЄєҐґ]/.test(it.title || '')
  );
  if (cyr.length) {
    items = cyr;
  }

  // 2) Викидаємо очевидні "плакати" / "poster"
  items = items.filter((it) => {
    const t = (it.title || '').toLowerCase();
    return !t.includes('плакат') && !t.includes('poster');
  });

  // 3) Не більше 20 результатів
  items = items.slice(0, 20);


  if (!items.length) {
    box.innerHTML = `<div class="muted">${t('ext.nothing', 'Нічого не знайдено.')}</div>`;
    return;
  }

  box.innerHTML = ''; // якщо хочеш — можеш додати заголовок тут

  items.forEach((it, idx) => {
    const fallback = genCoverSVG(it.title, it.author);
    const card = document.createElement('div');
    card.className = 'ext-card';

    const srcLabel =
      it.src === 'YB'
        ? 'Yakaboo'
        : it.src === 'OL'
        ? 'OpenLibrary'
        : it.src === 'GB'
        ? 'Google Books'
        : '';
    const url = it.url ? esc(it.url) : '';
    const label = srcLabel ? esc(srcLabel) : '';
    const linkHtml = url
      ? `<a href="${url}" class="ext-link" target="_blank" rel="noopener noreferrer">${label}</a>`
      : '';

    const priceText = it.price ? esc(it.price) : '';

    card.innerHTML = `
      <div class="ext-cover">
        <div class="cover-fallback" style="background-image:url('${esc(fallback)}')"></div>
      </div>
      <div class="ext-body">
        <div class="ext-title">${esc(it.title || '—')}</div>
        <div class="ext-meta">${esc(it.author || '')}</div>
        <div class="ext-meta">
          ${it.pages || 0} ${t('books.pages_short', 'стор.')}
          ${priceText ? ` • ${priceText}` : ''}
        </div>
        <div class="ext-meta">${linkHtml}</div>
        <button class="btn small" data-ext="${idx}">
          ${t('ext.add_btn', 'Додати')}
        </button>
      </div>
    `;

    if (it.cover) {
      card.querySelector('.ext-cover')?.appendChild(createCoverImg(it.cover));
    }

    box.appendChild(card);
  });

  // додати в свою бібліотеку
  box.querySelectorAll('button[data-ext]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const it = items[Number(btn.getAttribute('data-ext'))];
      try {
        await apiFetch('/api/books', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tytul: it.title,
            autor: it.author,
            kilkist_storinyok: it.pages || 0,
            status: 'PLANUYU',
            isbn: it.isbn,
            cover_url: it.cover,
            opis_67664: it.description
          })
        });
        toast(t('toast.book_added', 'Книгу додано'), 'ok');
        await load();
      } catch {
        toast(t('toast.book_add_failed', 'Не вдалося додати'), 'err');
      }
    });
  });
}

// підключення подій до поля/кнопки
document.getElementById('extSearchBtn')?.addEventListener('click', extSearch);
document.getElementById('extQuery')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') extSearch();
});
