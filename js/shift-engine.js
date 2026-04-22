/**
 * Calculate shifts for a date range.
 * @param {Object} config
 * @param {number} config.workDays - consecutive working days per block
 * @param {number} config.offDays - consecutive off days per block
 * @param {Date} config.startDate - first day of first shift block
 * @param {'day'|'night'} config.firstShift - type of the first work block
 * @param {'day'|'night'|'alternating'} config.mode - shift mode
 * @param {Date} config.rangeStart - first date to calculate
 * @param {Date} config.rangeEnd - last date to calculate
 * @returns {Map<string, 'day'|'night'|null>}
 */
export function calculateShifts(config) {
  const { workDays, offDays, startDate, firstShift, mode, rangeStart, rangeEnd } = config;
  const shifts = new Map();
  const cycleLength = workDays + offDays;

  if (cycleLength === 0) return shifts;

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);

  const current = new Date(rangeStart);
  current.setHours(0, 0, 0, 0);

  const end = new Date(rangeEnd);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    const dateStr = formatDate(current);
    const daysSinceStart = Math.floor((current - start) / 86400000);

    if (daysSinceStart < 0) {
      shifts.set(dateStr, null);
    } else {
      const positionInCycle = daysSinceStart % cycleLength;
      if (positionInCycle < workDays) {
        const rotationIndex = Math.floor(daysSinceStart / cycleLength);
        shifts.set(dateStr, getShiftType(mode, firstShift, rotationIndex));
      } else {
        shifts.set(dateStr, null);
      }
    }

    current.setDate(current.getDate() + 1);
  }

  return shifts;
}

function getShiftType(mode, firstShift, rotationIndex) {
  if (mode === 'day') return 'day';
  if (mode === 'night') return 'night';
  // alternating
  const opposite = firstShift === 'day' ? 'night' : 'day';
  return rotationIndex % 2 === 0 ? firstShift : opposite;
}

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
