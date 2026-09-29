/**
 * Fighter nationality and fighting style are stored as the admin form's English values
 * ("Cambodian", "aggressive, boxing"); these show them in the site's language. A value the
 * site doesn't know yet is shown as stored.
 */
import { MESSAGES, type MessageKey } from "../i18n/messages";

type T = (key: MessageKey) => string;

const known = (key: string): key is MessageKey => key in MESSAGES.en;

export function nationalityLabel(t: T, value: string): string {
  const key = `nationality.${value}`;
  return known(key) ? t(key) : value;
}

export function styleLabel(t: T, value: string): string {
  const key = `style.${value.trim().toLowerCase()}`;
  return known(key) ? t(key) : value;
}
