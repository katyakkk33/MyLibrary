const translations = {
  UA: {
    "library-title": "Моя бібліотека",
    "search-placeholder": "Шукати книгу або автора...",
    "filter-label": "Фільтри",
    "add-book": "Додати книгу",
    "favorite": "Улюблене",
    "authors": "Автори",
    "login": "Вхід",
    "logout": "Вихід",
  },
  PL: {
    "library-title": "Moja biblioteka",
    "search-placeholder": "Szukaj książki lub autora...",
    "filter-label": "Filtry",
    "add-book": "Dodaj książkę",
    "favorite": "Ulubione",
    "authors": "Autorzy",
    "login": "Zaloguj",
    "logout": "Wyloguj",
  }
};

function changeLanguage(language) {
  const elements = document.querySelectorAll('[data-translate]');
  elements.forEach(element => {
    const key = element.getAttribute('data-translate');
    if (translations[language] && translations[language][key]) {
      element.textContent = translations[language][key];
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const langToggle = document.getElementById('languageToggle');
  const langLabel = document.getElementById('langLabel');
  const savedLanguage = localStorage.getItem('language') || 'UA';
  changeLanguage(savedLanguage);
  langLabel.textContent = savedLanguage === 'PL' ? 'PL' : 'UA';

  langToggle.addEventListener('change', () => {
    const newLanguage = langToggle.checked ? 'PL' : 'UA';
    localStorage.setItem('language', newLanguage);
    langLabel.textContent = newLanguage;
    changeLanguage(newLanguage);
  });
});
