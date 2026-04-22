/**
 * Render calendar HTML for a range of months.
 * @param {Map<string, 'day'|'night'|null>} shifts
 * @param {Date} rangeStart - first month to render
 * @param {number} monthCount - number of months
 * @param {Object} locale - { monthNames: string[], dayNamesShort: string[] }
 * @returns {string} HTML string
 */
export function renderCalendar(shifts, rangeStart, monthCount, locale) {
  const today = formatDate(new Date());
  let html = '<div class="calendar-grid">';

  for (let i = 0; i < monthCount; i++) {
    const year = rangeStart.getFullYear();
    const month = rangeStart.getMonth() + i;
    const date = new Date(year, month, 1);
    html += renderMonth(date, shifts, locale, today);
  }

  html += '</div>';
  return html;
}

function renderMonth(firstOfMonth, shifts, locale, today) {
  const year = firstOfMonth.getFullYear();
  const month = firstOfMonth.getMonth();
  const monthName = locale.monthNames[month];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monday = 0, Sunday = 6
  let startDow = firstOfMonth.getDay() - 1;
  if (startDow < 0) startDow = 6;

  let html = `<div class="month-block">`;
  html += `<h3 class="month-title">${monthName} <span class="year">${year}</span></h3>`;
  html += `<div class="weekday-header">`;
  for (const day of locale.dayNamesShort) {
    html += `<span>${day}</span>`;
  }
  html += `</div>`;
  html += `<div class="day-grid">`;

  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    html += `<span class="day-cell empty"></span>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const shift = shifts.get(dateStr);
    const isToday = dateStr === today;

    let cls = 'day-cell';
    let badge = '';

    if (shift === 'day') {
      cls += ' shift-day';
      badge = '<span class="shift-badge">D</span>';
    } else if (shift === 'night') {
      cls += ' shift-night';
      badge = '<span class="shift-badge">N</span>';
    }

    if (isToday) {
      cls += ' today';
    }

    html += `<span class="${cls}"><span class="day-number">${d}</span>${badge}</span>`;
  }

  html += `</div></div>`;
  return html;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
