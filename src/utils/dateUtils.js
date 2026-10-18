// Comprehensive Date Utilities for My Love Website
// Features: EXIF Date Extraction, Consistent Formatting (DD MMM YYYY), Chronological Sorting, and Calendar-Day Counter

import { RELATIONSHIP_CONFIG } from '../config/relationship.js';

export { RELATIONSHIP_CONFIG };

export const MONTHS_SHORT = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

/**
 * Format any date input into canonical readable format: "DD MMM YYYY" with uppercase month.
 * Example: "2023-12-09" -> "09 DEC 2023"
 * Returns "Date Not Set" if missing or unparseable.
 */
export function formatReadableDate(dateInput) {
  if (!dateInput) return 'Date Not Set';

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed) return 'Date Not Set';

    // If already in DD MMM YYYY format (e.g. "09 DEC 2023")
    if (/^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/\s+/);
      return `${parts[0]} ${parts[1].toUpperCase()} ${parts[2]}`;
    }

    // Check YYYY-MM-DD (ISO)
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      const year = isoMatch[1];
      const monthIdx = parseInt(isoMatch[2], 10) - 1;
      const day = String(parseInt(isoMatch[3], 10)).padStart(2, '0');
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${MONTHS_SHORT[monthIdx]} ${year}`;
      }
    }

    // Check MM.DD.YYYY (Legacy project format, e.g. "04.12.2024")
    const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (dotMatch) {
      const monthIdx = parseInt(dotMatch[1], 10) - 1;
      const day = String(parseInt(dotMatch[2], 10)).padStart(2, '0');
      const year = dotMatch[3];
      if (monthIdx >= 0 && monthIdx < 12) {
        return `${day} ${MONTHS_SHORT[monthIdx]} ${year}`;
      }
    }

    // Check standard JS Date string (e.g. "April 12, 2024")
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      const day = String(parsed.getDate()).padStart(2, '0');
      const monthIdx = parsed.getMonth();
      const year = parsed.getFullYear();
      return `${day} ${MONTHS_SHORT[monthIdx]} ${year}`;
    }
  } else if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    const day = String(dateInput.getDate()).padStart(2, '0');
    const monthIdx = dateInput.getMonth();
    const year = dateInput.getFullYear();
    return `${day} ${MONTHS_SHORT[monthIdx]} ${year}`;
  }

  return 'Date Not Set';
}

/**
 * Parse a date string/value into UTC millisecond timestamp for deterministic chronological sorting.
 * Returns null if missing, unparseable, or invalid.
 */
export function parseDateToTimestamp(dateInput) {
  if (!dateInput) return null;
  if (typeof dateInput === 'number' && !isNaN(dateInput)) return dateInput;

  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    if (!trimmed || trimmed === 'Date Not Set') return null;

    // YYYY-MM-DD
    const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (isoMatch) {
      return Date.UTC(parseInt(isoMatch[1], 10), parseInt(isoMatch[2], 10) - 1, parseInt(isoMatch[3], 10));
    }

    // MM.DD.YYYY
    const dotMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/);
    if (dotMatch) {
      return Date.UTC(parseInt(dotMatch[3], 10), parseInt(dotMatch[1], 10) - 1, parseInt(dotMatch[2], 10));
    }

    // DD MMM YYYY (e.g. "09 DEC 2023")
    const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})/);
    if (ddmmyyyyMatch) {
      const monthIdx = MONTHS_SHORT.indexOf(ddmmyyyyMatch[2].toUpperCase());
      if (monthIdx !== -1) {
        return Date.UTC(parseInt(ddmmyyyyMatch[3], 10), monthIdx, parseInt(ddmmyyyyMatch[1], 10));
      }
    }

    const t = new Date(trimmed).getTime();
    return isNaN(t) ? null : t;
  }

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput.getTime();
  }

  return null;
}

/**
 * Pure calendar-date arithmetic between relationship start date and target date.
 * Avoids off-by-one errors from local timezone shifts, DST, or simple millisecond division.
 * Uses the user's local calendar date consistently.
 */
export function calculateDaysTogether(startDateStr = RELATIONSHIP_CONFIG.startDate, targetDate = new Date()) {
  try {
    const parts = (startDateStr || RELATIONSHIP_CONFIG.startDate).split('-').map(Number);
    const startYear = parts[0];
    const startMonthIndex = parts[1] - 1; // 0-indexed
    const startDay = parts[2];

    // Local calendar date components for target date
    const currentYear = targetDate.getFullYear();
    const currentMonthIndex = targetDate.getMonth();
    const currentDay = targetDate.getDate();

    // Pure UTC calendar day representation
    const startUtc = Date.UTC(startYear, startMonthIndex, startDay);
    const currentUtc = Date.UTC(currentYear, currentMonthIndex, currentDay);

    if (currentUtc < startUtc) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isBefore: true,
        formattedStart: RELATIONSHIP_CONFIG.startDateDisplay
      };
    }

    const diffDays = Math.round((currentUtc - startUtc) / 86400000);
    return {
      days: diffDays,
      hours: targetDate.getHours(),
      minutes: targetDate.getMinutes(),
      seconds: targetDate.getSeconds(),
      isBefore: false,
      formattedStart: RELATIONSHIP_CONFIG.startDateDisplay
    };
  } catch (err) {
    console.error('Days calculation error:', err);
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isBefore: false,
      formattedStart: RELATIONSHIP_CONFIG.startDateDisplay
    };
  }
}

/**
 * Safely extracts EXIF capture date from an image File.
 * Reads the first 128 KB of the file.
 * Returns { dateISO, time, displayDate, hasExif: true, raw } or null if absent/invalid.
 */
export async function extractExifDate(file) {
  if (!file) return null;

  try {
    // Read first 128 KB of the image file
    const slice = file.slice(0, 131072);
    const arrayBuffer = await slice.arrayBuffer();
    const view = new DataView(arrayBuffer);
    const maxLen = view.byteLength;

    if (maxLen < 4 || view.getUint16(0, false) !== 0xFFD8) {
      return null; // Not a valid JPEG
    }

    let offset = 2;
    while (offset < maxLen - 4) {
      if (view.getUint8(offset) !== 0xFF) break;
      const marker = view.getUint8(offset + 1);
      if (marker === 0xDA || marker === 0xD9) break; // SOS or EOI
      const len = view.getUint16(offset + 2, false);
      if (len < 2 || offset + 2 + len > maxLen) break;

      if (marker === 0xE1) {
        // APP1 Marker: check for "Exif\0\0"
        if (offset + 10 <= maxLen) {
          const isExif =
            view.getUint8(offset + 4) === 0x45 && // 'E'
            view.getUint8(offset + 5) === 0x78 && // 'x'
            view.getUint8(offset + 6) === 0x69 && // 'i'
            view.getUint8(offset + 7) === 0x66 && // 'f'
            view.getUint8(offset + 8) === 0x00 &&
            view.getUint8(offset + 9) === 0x00;

          if (isExif) {
            const tiffStart = offset + 10;
            if (tiffStart + 8 > maxLen) return null;

            const endian = view.getUint16(tiffStart, false);
            const isLittle = endian === 0x4949; // 'II'
            if (!isLittle && endian !== 0x4D4D) return null; // 'MM'
            if (view.getUint16(tiffStart + 2, isLittle) !== 0x002A) return null;

            const ifd0Offset = view.getUint32(tiffStart + 4, isLittle);
            let bestDateStr = null;

            function readIFD(ifdOffset) {
              if (tiffStart + ifdOffset + 2 > maxLen) return null;
              const count = view.getUint16(tiffStart + ifdOffset, isLittle);
              let subExifOffset = null;

              for (let i = 0; i < count; i++) {
                const entryOffset = tiffStart + ifdOffset + 2 + i * 12;
                if (entryOffset + 12 > maxLen) break;
                const tag = view.getUint16(entryOffset, isLittle);

                if (tag === 0x8769) {
                  // Exif SubIFD Pointer
                  subExifOffset = view.getUint32(entryOffset + 8, isLittle);
                } else if (tag === 0x9003 || tag === 0x9004 || tag === 0x0132) {
                  // DateTimeOriginal (0x9003), DateTimeDigitized (0x9004), DateTime (0x0132)
                  const valOffset = view.getUint32(entryOffset + 8, isLittle);
                  let s = '';
                  for (let j = 0; j < 20; j++) {
                    if (tiffStart + valOffset + j >= maxLen) break;
                    const ch = view.getUint8(tiffStart + valOffset + j);
                    if (!ch) break;
                    s += String.fromCharCode(ch);
                  }
                  if (tag === 0x9003 && s) return s;
                  if (!bestDateStr && s) bestDateStr = s;
                }
              }

              if (subExifOffset) {
                const subRes = readIFD(subExifOffset);
                if (subRes) return subRes;
              }
              return bestDateStr;
            }

            const rawDate = readIFD(ifd0Offset);
            if (rawDate && /^\d{4}:\d{2}:\d{2}\s+\d{2}:\d{2}/.test(rawDate.trim())) {
              const parts = rawDate.trim().split(/\s+/);
              const datePart = parts[0].replace(/:/g, '-');
              const timePart = parts[1].substring(0, 5);

              // Validate date numbers
              const [y, m, d] = datePart.split('-').map(Number);
              if (y >= 1990 && y <= 2100 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                return {
                  dateISO: datePart,
                  time: timePart,
                  displayDate: formatReadableDate(datePart),
                  hasExif: true,
                  raw: rawDate
                };
              }
            }
          }
        }
      }
      offset += 2 + len;
    }
  } catch (err) {
    console.warn('EXIF parse notice (fallback to upload date):', err);
  }

  return null;
}

/**
 * Sensible fallback photo date using file.lastModified or current upload time.
 */
export function getFallbackPhotoDate(file = null) {
  let dateObj = new Date();
  if (
    file &&
    typeof file.lastModified === 'number' &&
    file.lastModified > 946684800000 && // After Year 2000
    file.lastModified <= Date.now() + 86400000 // Not future
  ) {
    dateObj = new Date(file.lastModified);
  }

  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const dateISO = `${yyyy}-${mm}-${dd}`;
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  const time = `${hh}:${min}`;

  return {
    dateISO,
    time,
    displayDate: formatReadableDate(dateISO),
    hasExif: false
  };
}
