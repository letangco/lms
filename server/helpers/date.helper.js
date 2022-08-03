import momentTimezone from 'moment-timezone';
import logger from '../util/logger';
import { DEFAULT_LANGUAGE } from '../constants';

const months = {
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  vi: [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]
};

/**
 * Input a date 02/18/2020
 * Output February 18, 2020
 * @param date
 * @param language
 * @returns {string|*}
 */
export function getFullDate(date, language = DEFAULT_LANGUAGE) {
  try {
    const month = months[language][date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch (error) {
    logger.error(`getFullDate from date: ${date} error:`, error);
    return date;
  }
}

export function getTime(date) {
  try {
    return date.toLocaleTimeString();
  } catch (error) {
    logger.error(`getTime from date: ${date} error:`, error);
    return date;
  }
}

/**
 * Get full date time string
 * @param timezone
 * @param date
 * @param language
 * @returns {{timeString: *, timezone: *, dateString: *}|{timeString: *, timezone: string, dateString: *}}
 */
export function getFullTimeString(timezone, date, language = DEFAULT_LANGUAGE) {
  try {
    if (timezone && momentTimezone.tz.zone(timezone)) {
      const momentDate = momentTimezone(date).tz(timezone);
      // const momentDate = momentTimezone(date, 'MM/DD/YYYY hh:mm:ss A', language).tz(timezone);
      return {
        dateString: momentDate.format('MMMM DD, YYYY'),
        timeString: momentDate.format('h:mm:ss A'),
        timezone: timezone,
      };
    }
    const dateString = getFullDate(date, language);
    const timeString = getTime(date);
    return {
      dateString: dateString,
      timeString: timeString,
      timezone: 'GMT +00:00'
    };
  } catch (error) {
    logger.error('Date helper getFullTimeString error:', error);
    throw error;
  }
}
