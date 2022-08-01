import inflection from 'inflection'
import lpad from "./lpad";

export function formatDate (date: Date) {
  return [
    date.getUTCFullYear(),
    lpad(`${date.getUTCMonth() + 1}`, '0', 2),
    lpad(date.getUTCDate().toString(), '0', 2),
    lpad(date.getUTCHours().toString(), '0', 2),
    lpad(date.getUTCMinutes().toString(), '0', 2),
    lpad(date.getUTCSeconds().toString(), '0', 2)
  ].join('');
}

export function formatName (title: string, date: Date) {
  return formatDate(date) + '-' + formatTitle(title);
}

export function formatTitle (title: string) {
  return inflection.dasherize(title);
}

export function parseDate (name: string) {
  let date = new Date();
  let match = name.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})-[^.]+/);
  if (match) {
    date.setUTCFullYear(parseInt(match[1], 10));
    date.setUTCDate(parseInt(match[3], 10));
    date.setUTCMonth(parseInt(match[2],10) - 1);
    date.setUTCHours(parseInt(match[4], 10));
    date.setUTCMinutes(parseInt(match[5], 10));
    date.setUTCSeconds(parseInt(match[6], 10));
  }
  return date;
}

export function parseTitle (name: string) {
  var match = name.match(/\d{14}-([^.]+)/);
  let dashed = '';
  if (match) {
    dashed = match[1];
  }
  return inflection.humanize(dashed, true);
}