import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Lang, MESSAGES, MessageKey } from "./messages";

const STORAGE_KEY = "kk-lang";
const LOCALES: Record<Lang, string> = { en: "en-US", km: "km-KH" };
const KG_TO_LB = 2.20462;

type Vars = Record<string, string | number>;

// Khmer dates are formatted by hand: many browsers (older Android WebViews, Electron) ship without
// Khmer locale data and would silently fall back to English.
export const KM_MONTHS = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
const KM_WEEKDAYS = ["អាទិត្យ", "ច័ន្ទ", "អង្គារ", "ពុធ", "ព្រហស្បតិ៍", "សុក្រ", "សៅរ៍"];
const KM_DIGITS = "០១២៣៤៥៦៧៨៩";
const toKhmerDigits = (n: number | string) => String(n).replace(/\d/g, (d) => KM_DIGITS[Number(d)]);

function formatKhmerDate(d: Date, style: "short" | "long" | "weekday"): string {
  const day = toKhmerDigits(d.getUTCDate());
  const month = KM_MONTHS[d.getUTCMonth()];
  const year = toKhmerDigits(d.getUTCFullYear());
  const weekday = KM_WEEKDAYS[d.getUTCDay()];
  if (style === "long") return `ថ្ងៃ${weekday} ទី${day} ខែ${month} ឆ្នាំ${year}`;
  if (style === "weekday") return `${weekday} ${day} ${month} ${year}`;
  return `${day} ${month} ${year}`;
}

interface I18n {
  lang: Lang;
  locale: string;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Translate a key, filling {placeholders}. */
  t: (key: MessageKey, vars?: Vars) => string;
  /** Translate a pluralised key (`<base>_one` / `<base>_other`) and fill {n}. */
  tn: (base: string, n: number, vars?: Vars) => string;
  formatDate: (date?: string | Date | null, style?: "short" | "long" | "weekday") => string;
  formatNumber: (n: number) => string;
  /** "60 kg (132 lb)" in English, "60 គីឡូ" in Khmer. */
  formatWeight: (kg?: number | string | null) => string;
  /** Pick the Khmer or English variant of a name when both exist. */
  localName: (en?: string | null, km?: string | null) => string;
}

function fill(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

function initialLang(): Lang {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "km" || fromUrl === "en") return fromUrl;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "km" || stored === "en") return stored;
  } catch {
    // Storage can be unavailable (private mode); fall through to the browser language.
  }
  return navigator.language?.toLowerCase().startsWith("km") ? "km" : "en";
}

const LanguageContext = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore: the choice just won't persist.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<I18n>(() => {
    const messages = MESSAGES[lang];
    const locale = LOCALES[lang];
    const numberFmt = new Intl.NumberFormat(locale);

    const t = (key: MessageKey, vars?: Vars) => fill(messages[key] ?? MESSAGES.en[key] ?? key, vars);

    return {
      lang,
      locale,
      setLang,
      toggleLang: () => setLang(lang === "en" ? "km" : "en"),
      t,
      tn: (base, n, vars) => {
        const key = `${base}_${n === 1 ? "one" : "other"}` as MessageKey;
        return t(key, { n: numberFmt.format(n), ...vars });
      },
      formatDate: (date, style: "short" | "long" | "weekday" = "short") => {
        if (!date) return "";
        const d = typeof date === "string" ? new Date(date) : date;
        if (isNaN(d.getTime())) return "";
        if (lang === "km") return formatKhmerDate(d, style);
        const opts: Intl.DateTimeFormatOptions =
          style === "long" ? { weekday: "long", month: "long", day: "numeric", year: "numeric" }
          : style === "weekday" ? { weekday: "short", month: "short", day: "numeric", year: "numeric" }
          : { month: "short", day: "numeric", year: "numeric" };
        // Event dates are stored as calendar days (midnight UTC); render them in UTC so a
        // visitor in the Americas doesn't see the previous day.
        return d.toLocaleDateString(locale, { ...opts, timeZone: "UTC" });
      },
      formatNumber: (n) => numberFmt.format(n),
      formatWeight: (kg) => {
        const n = typeof kg === "string" ? parseFloat(kg) : kg ?? NaN;
        if (!n || isNaN(n)) return "";
        if (lang === "km") return `${numberFmt.format(n)} គីឡូ`;
        return `${numberFmt.format(n)} kg (${Math.round(n * KG_TO_LB)} lb)`;
      },
      localName: (enName, kmName) => (lang === "km" && kmName ? kmName : enName || kmName || ""),
    };
  }, [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}
