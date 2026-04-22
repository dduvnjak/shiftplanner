import { calculateShifts } from './shift-engine.js';
import { renderCalendar } from './calendar-renderer.js';
import { setLanguage, getLanguage, getCalendarLocale, translateUI } from './i18n.js';

const MONTH_COUNT = 6;
const STORAGE_KEY = 'shiftplanner-settings';

// DOM elements
const workDaysInput = document.getElementById('workDays');
const offDaysInput = document.getElementById('offDays');
const startDateInput = document.getElementById('startDate');
const modeInputs = document.querySelectorAll('input[name="mode"]');
const firstShiftInputs = document.querySelectorAll('input[name="firstShift"]');
const firstShiftField = document.getElementById('firstShiftField');
const calendarContainer = document.getElementById('calendar');
const langBtns = document.querySelectorAll('.lang-btn');
const printBtn = document.getElementById('printBtn');

// --- Settings persistence ---
function saveSettings() {
  const settings = {
    workDays: workDaysInput.value,
    offDays: offDaysInput.value,
    startDate: startDateInput.value,
    mode: getMode(),
    firstShift: getFirstShift()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function init() {
  const saved = loadSettings();

  if (saved) {
    workDaysInput.value = saved.workDays || 4;
    offDaysInput.value = saved.offDays || 4;
    startDateInput.value = saved.startDate || formatDate(new Date());
    if (saved.mode) {
      const modeRadio = document.querySelector(`input[name="mode"][value="${saved.mode}"]`);
      if (modeRadio) modeRadio.checked = true;
    }
    if (saved.firstShift) {
      const fsRadio = document.querySelector(`input[name="firstShift"][value="${saved.firstShift}"]`);
      if (fsRadio) fsRadio.checked = true;
    }
  } else {
    startDateInput.value = formatDate(new Date());
  }

  // Restore language
  const lang = getLanguage();
  langBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Wire events
  workDaysInput.addEventListener('input', update);
  offDaysInput.addEventListener('input', update);
  startDateInput.addEventListener('input', update);
  modeInputs.forEach(r => r.addEventListener('change', onModeChange));
  firstShiftInputs.forEach(r => r.addEventListener('change', update));
  printBtn.addEventListener('click', () => window.print());

  // Language buttons
  langBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onLangChange(btn.dataset.lang);
    });
  });

  // Number stepper buttons
  document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const min = parseInt(target.min) || 0;
      const max = parseInt(target.max) || 60;
      let val = parseInt(target.value) || 0;

      if (btn.classList.contains('num-inc')) {
        val = Math.min(val + 1, max);
      } else {
        val = Math.max(val - 1, min);
      }

      target.value = val;
      target.dispatchEvent(new Event('input'));
    });
  });

  onModeChange();
  translateUI().then(update);
}

function onModeChange() {
  const mode = getMode();
  firstShiftField.style.display = mode === 'alternating' ? '' : 'none';
  update();
}

async function onLangChange(lang) {
  setLanguage(lang);
  await translateUI();
  update();
}

function update() {
  const workDays = parseInt(workDaysInput.value) || 0;
  const offDays = parseInt(offDaysInput.value) || 0;
  const startDate = startDateInput.value;
  const mode = getMode();
  const firstShift = getFirstShift();

  // Save on every update
  saveSettings();

  if (!startDate || workDays < 1) {
    calendarContainer.innerHTML = '';
    return;
  }

  const start = new Date(startDate + 'T00:00:00');
  const rangeStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const rangeEnd = new Date(start.getFullYear(), start.getMonth() + MONTH_COUNT, 0);

  const shifts = calculateShifts({
    workDays,
    offDays,
    startDate: start,
    firstShift,
    mode,
    rangeStart,
    rangeEnd
  });

  const locale = getCalendarLocale(getLanguage());
  calendarContainer.innerHTML = renderCalendar(shifts, rangeStart, MONTH_COUNT, locale);
}

function getMode() {
  const checked = document.querySelector('input[name="mode"]:checked');
  return checked ? checked.value : 'alternating';
}

function getFirstShift() {
  const checked = document.querySelector('input[name="firstShift"]:checked');
  return checked ? checked.value : 'day';
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

init();
