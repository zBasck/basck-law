// backend/middleware/validacoes.js
const { HttpError } = require('./erros');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_RE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$/;

function isNonEmptyString(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function isEmail(v) {
  return typeof v === 'string' && EMAIL_RE.test(v.trim());
}

function isDate(v) {
  return typeof v === 'string' && DATE_RE.test(v) && !Number.isNaN(Date.parse(v));
}

function isDateTime(v) {
  return typeof v === 'string' && DATETIME_RE.test(v) && !Number.isNaN(Date.parse(v));
}

function isNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function isPositiveInt(v) {
  return typeof v === 'number' && Number.isInteger(v) && v > 0;
}

function isOneOf(v, list) {
  return list.includes(v);
}

function validateRequired(body, fields) {
  for (const f of fields) {
    if (!isNonEmptyString(body[f]) && !(f in body)) {
      throw new HttpError(400, `Campo obrigatório: ${f}`);
    }
  }
}

function validateEmail(value) {
  if (!isEmail(value)) throw new HttpError(400, 'E-mail inválido');
}

function validateDate(value, field = 'data') {
  if (!isDate(value)) throw new HttpError(400, `${field} inválida (use YYYY-MM-DD)`);
}

function validateEnum(value, list, field) {
  if (!isOneOf(value, list)) {
    throw new HttpError(400, `${field} deve ser um de: ${list.join(', ')}`);
  }
}

module.exports = {
  isNonEmptyString,
  isEmail,
  isDate,
  isDateTime,
  isNumber,
  isPositiveInt,
  isOneOf,
  validateRequired,
  validateEmail,
  validateDate,
  validateEnum
};
