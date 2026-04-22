const locales = {};

const MONTH_NAMES = {
  en: ['January', 'February', 'March', 'April', 'May', 'June',
       'July', 'August', 'September', 'October', 'November', 'December'],
  bs: ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Juni',
       'Juli', 'August', 'Septembar', 'Oktobar', 'Novembar', 'Decembar']
};

const DAY_NAMES_SHORT = {
  en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  bs: ['Pon', 'Uto', 'Sri', 'Čet', 'Pet', 'Sub', 'Ned']
};

let currentLang = localStorage.getItem('shiftplanner-lang') || 'bs';

export async function loadLocale(lang) {
  if (!locales[lang]) {
    const resp = await fetch(`locales/${lang}.json`);
    locales[lang] = await resp.json();
  }
  return locales[lang];
}

export function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('shiftplanner-lang', lang);
}

export function getLanguage() {
  return currentLang;
}

export function getCalendarLocale(lang) {
  const l = lang || currentLang;
  return {
    monthNames: MONTH_NAMES[l] || MONTH_NAMES.en,
    dayNamesShort: DAY_NAMES_SHORT[l] || DAY_NAMES_SHORT.en
  };
}

export async function t(key) {
  const strings = await loadLocale(currentLang);
  return strings[key] || key;
}

export async function translateUI() {
  const strings = await loadLocale(currentLang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (strings[key]) {
      if (el.tagName === 'OPTION') {
        el.textContent = strings[key];
      } else if (el.hasAttribute('placeholder')) {
        el.placeholder = strings[key];
      } else {
        el.textContent = strings[key];
      }
    }
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (strings[key]) el.title = strings[key];
  });
}
