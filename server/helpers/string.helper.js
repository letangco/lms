import mongoose from 'mongoose';
import crypto from 'crypto';
import slug from 'limax';

export function generateRandom6Digits() {
  return Math.floor(100000 + Math.random() * 100000);
}

export function generateRandom8Digits() {
  return Math.floor(10000000 + Math.random() * 10000000);
}

export function isObjectId(string) {
  return mongoose.Types.ObjectId.isValid(string);
}

export function getObjectId(objectId) {
  try {
    if (typeof objectId === 'string') {
      return mongoose.Types.ObjectId(objectId);
    }
    return objectId;
  } catch (error) {
    throw error;
  }
}

export function getObjectIds(objectIds) {
  try {
    return objectIds.map(objectId => getObjectId(objectId));
  } catch (error) {
    throw error;
  }
}

/**
 * Get current date by format dd-mm-yyyy
 * @returns {string}
 */
export function getCurrentDateString() {
  const currentDate = new Date();
  return `${currentDate.getDate()}-${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
}

/**
 * Return sha1 string
 * @param {String} data
 * @returns {string}
 */
export function getSha1(data) {
  return crypto.createHash('sha1')
  .update(data)
  .digest('hex');
}

export function makeId(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz1234567890';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function makeSlugId() {
  const result = makeId(10);
  return `${result.slice(0, 3)}-${result.slice(3, 7)}-${result.slice(7, 10)}`;
}

/**
 * Check the slug is valid?
 * Example 2zv-3rma-ii5 is valid
 * @param _slug
 * @returns {boolean}
 */
export function isSlugValid(_slug) {
  return typeof _slug === 'string' && _slug.length === 12 && !!_slug.match(/([a-z0-9]{3})-([a-z0-9]{4})-([a-z0-9]{3})/);
}

export function buildSlug(text, options) {
  return slug(text, options);
}

/**
 * Valid text string for search
 * @param text
 * @returns {null|RegExp}
 */
export function validSearchString(text) {
  if (typeof text === 'string') {
    text = text.replace(/\\/g, String.raw`\\`).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");

    return new RegExp(text, 'i');
  }
  return null;
}

export function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
export function formatNumber2Length(d) {
  return (d < 10) ? `0${d.toString()}` : d.toString();
}
export function checkExtensionFileViewBrowser(path) {
  return path.match(/[^/]+(jpg|png|gif|mp3|mp4|ogg|mpeg|wav|webm)$/);
}

export function replaceString(string, oldString, newString) {
  return string.replace(/{site_url}/g, newString);
}

export function buildUriByQuery(uri, params) {
  const qs = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    .join('&');

  return `${uri}?${qs}`;
}

