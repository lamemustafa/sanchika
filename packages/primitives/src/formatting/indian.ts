export type IndianNumericInput = number | bigint | string;
type ExactNumeric = number | bigint | string;

export type IndianNumberFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "currency" | "unit" | "notation" | "compactDisplay"> & { display?: "exact" | "compact" };
export type IndianCurrencyFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "currency" | "unit" | "notation" | "compactDisplay"> & { currency?: string; display?: "exact" | "compact" };
export type IndianDateFormatOptions = { format?: "dd-mm-yyyy" | "long"; timeZone?: string };
export type IndianDateTimeFormatOptions = Intl.DateTimeFormatOptions & { timeZone?: string };
export type PercentageFormatOptions = Omit<Intl.NumberFormatOptions, "style" | "currency" | "unit" | "notation" | "compactDisplay"> & { input?: "fraction" | "percent" };

export class IndianFormatError extends TypeError {
  readonly code = "ERR_SANCHIKA_FORMAT";
  constructor(message: string) {
    super(message);
    this.name = "IndianFormatError";
  }
}

const locale = "en-IN";
const defaultTimeZone = "Asia/Kolkata";

export function formatIndianNumber(value: IndianNumericInput, options: IndianNumberFormatOptions = {}): string {
  const numeric = toFiniteNumeric(value, "number");
  const { display = "exact", ...intlOptions } = options;
  const compactNumeric = display === "compact" ? toFiniteNumber(value, "number") : 0;
  if (display === "compact" && Math.abs(compactNumeric) >= 100_000) {
    const divisor = Math.abs(compactNumeric) >= 10_000_000 ? 10_000_000 : 100_000;
    const unit = divisor === 10_000_000 ? "crore" : "lakh";
    const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 0, ...intlOptions, style: "decimal", notation: "standard" }).format(compactNumeric / divisor);
    return `${formatted} ${unit}`;
  }
  if (requiresManualExact(value)) {
    if (Object.keys(intlOptions).length > 0) throw new IndianFormatError("number options require input within the Intl numeric range");
    return groupExactDecimal(numeric as string);
  }
  return formatExact(
    new Intl.NumberFormat(locale, { ...exactFractionOptions(value, intlOptions), style: "decimal", notation: "standard" }),
    numeric,
  );
}

export function formatIndianCurrency(value: IndianNumericInput, options: IndianCurrencyFormatOptions = {}): string {
  const numeric = toFiniteNumeric(value, "currency");
  const { currency = "INR", display = "exact", ...intlOptions } = options;
  if (display === "compact") {
    const compactNumeric = toFiniteNumber(value, "currency");
    if (Math.abs(compactNumeric) >= 100_000) {
      const divisor = Math.abs(compactNumeric) >= 10_000_000 ? 10_000_000 : 100_000;
      const unit = divisor === 10_000_000 ? "crore" : "lakh";
      const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: 2, minimumFractionDigits: 0, ...intlOptions, style: "currency", currency, notation: "standard" }).format(compactNumeric / divisor);
      return `${formatted} ${unit}`;
    }
  }
  if (requiresManualExact(value)) {
    if (currency !== "INR" || Object.keys(intlOptions).length > 0) {
      throw new IndianFormatError("currency options and non-INR currencies require input within the Intl numeric range");
    }
    const grouped = groupExactDecimal(numeric as string, currencyFractionDigits(currency));
    return grouped.startsWith("-") ? `-₹${grouped.slice(1)}` : `₹${grouped}`;
  }
  return formatExact(
    new Intl.NumberFormat(locale, {
      ...exactFractionOptions(value, intlOptions, currencyFractionDigits(currency)),
      style: "currency",
      currency,
      notation: "standard",
    }),
    numeric,
  );
}

export function formatIndianDate(value: Date | string | number, options: IndianDateFormatOptions = {}): string {
  const { format = "dd-mm-yyyy", timeZone = defaultTimeZone } = options;
  const dateOnly = typeof value === "string" ? parseIsoDateOnly(value) : null;
  if (dateOnly) {
    if (format === "dd-mm-yyyy") return `${pad(dateOnly.day)}-${pad(dateOnly.month)}-${dateOnly.year}`;
    return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(dateOnly.date);
  }
  const date = toValidDate(value);
  if (format === "dd-mm-yyyy") {
    const parts = dateParts(date, timeZone);
    return `${parts.day}-${parts.month}-${parts.year}`;
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone }).format(date);
}

export function formatIndianDateTime(value: Date | string | number, options: IndianDateTimeFormatOptions = {}): string {
  const date = toValidDate(value);
  const { timeZone = defaultTimeZone, ...intlOptions } = options;
  const hasRequestedShape = Object.keys(intlOptions).length > 0;
  return new Intl.DateTimeFormat(locale, { ...(hasRequestedShape ? intlOptions : { dateStyle: "medium", timeStyle: "short" }), timeZone }).format(date);
}

export function formatGSTINDisplay(value: string): string {
  const normalized = normalizeIdentifier(value, "GSTIN");
  if (normalized.length !== 15) return normalized;
  return `${normalized.slice(0, 2)} ${normalized.slice(2, 7)} ${normalized.slice(7, 11)} ${normalized.slice(11, 12)} ${normalized.slice(12, 13)} ${normalized.slice(13, 14)} ${normalized.slice(14)}`;
}

export function formatPANDisplay(value: string): string {
  const normalized = normalizeIdentifier(value, "PAN");
  if (normalized.length !== 10) return normalized;
  return `${normalized.slice(0, 5)} ${normalized.slice(5, 9)} ${normalized.slice(9)}`;
}

export function formatPercentage(value: IndianNumericInput, options: PercentageFormatOptions = {}): string {
  const numeric = toFiniteNumber(value, "percentage");
  const { input = "fraction", ...intlOptions } = options;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2, ...intlOptions, style: "percent", notation: "standard" }).format(input === "percent" ? numeric / 100 : numeric);
}

function toFiniteNumber(value: IndianNumericInput, label: string): number {
  if (typeof value === "string" && value.trim() === "") throw new IndianFormatError(`${label} must not be empty`);
  const numeric = typeof value === "bigint" ? Number(value) : typeof value === "string" ? Number(assertDecimalString(value, label)) : value;
  if (!Number.isFinite(numeric)) throw new IndianFormatError(`${label} must be a finite number`);
  return numeric;
}

function toFiniteNumeric(value: IndianNumericInput, label: string): ExactNumeric {
  if (typeof value === "bigint") return value;
  if (typeof value === "string") {
    return assertDecimalString(value, label);
  }
  return toFiniteNumber(value, label);
}

function formatExact(formatter: Intl.NumberFormat, value: ExactNumeric): string {
  // Intl accepts decimal strings as exact mathematical values at runtime; the
  // TypeScript lib signature remains narrower than ECMA-402's input coercion.
  return formatter.format(value as number | bigint);
}

function requiresManualExact(value: IndianNumericInput): value is string {
  return typeof value === "string" && !Number.isFinite(Number(value));
}

function groupExactDecimal(value: string, minimumFractionDigits = 0): string {
  const sign = value.startsWith("-") ? "-" : "";
  const unsigned = value.replace(/^[+-]/, "");
  const [integerSource = "0", fractionSource = ""] = unsigned.split(".");
  const integer = integerSource.replace(/^0+(?=\d)/, "");
  const tail = integer.slice(-3);
  let head = integer.slice(0, -3);
  const groups = [];
  while (head.length > 2) {
    groups.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  if (head) groups.unshift(head);
  groups.push(tail);
  const fraction = fractionSource.padEnd(minimumFractionDigits, "0");
  return `${sign}${groups.join(",")}${fraction ? `.${fraction}` : ""}`;
}

function exactFractionOptions(
  value: IndianNumericInput,
  options: Omit<Intl.NumberFormatOptions, "style" | "currency" | "unit" | "notation" | "compactDisplay">,
  minimumDefault = 0,
): Intl.NumberFormatOptions {
  if (options.maximumFractionDigits !== undefined) return options;
  const exactDigits = fractionDigitCount(value);
  if (exactDigits > 100) throw new IndianFormatError("exact numeric input must contain at most 100 fractional digits");
  const minimumFractionDigits = options.minimumFractionDigits ?? Math.max(minimumDefault, exactDigits);
  return {
    ...options,
    minimumFractionDigits,
    maximumFractionDigits: Math.max(minimumFractionDigits, exactDigits),
  };
}

function currencyFractionDigits(currency: string): number {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).resolvedOptions().minimumFractionDigits ?? 0;
}

function fractionDigitCount(value: IndianNumericInput): number {
  if (typeof value === "bigint") return 0;
  const source = typeof value === "string" ? value.trim() : expandExponential(String(value));
  return source.split(".")[1]?.length ?? 0;
}

function assertDecimalString(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) throw new IndianFormatError(`${label} must not be empty`);
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new IndianFormatError(`${label} must be a decimal number`);
  }
  return normalized;
}

function expandExponential(value: string): string {
  const match = /^([+-]?)(\d+)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(value);
  if (!match) return value;
  const sign = match[1] ?? "";
  const integer = match[2] ?? "";
  const fraction = match[3] ?? "";
  const exponentSource = match[4] ?? "0";
  const exponent = Number(exponentSource);
  const digits = `${integer}${fraction}`;
  const decimalIndex = integer.length + exponent;
  if (decimalIndex <= 0) return `${sign}0.${"0".repeat(-decimalIndex)}${digits}`;
  if (decimalIndex >= digits.length) return `${sign}${digits}${"0".repeat(decimalIndex - digits.length)}`;
  return `${sign}${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
}

function toValidDate(value: Date | string | number): Date {
  if (typeof value === "string" && value.trim() === "") throw new IndianFormatError("date must not be empty");
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
  if (!Number.isFinite(date.getTime())) throw new IndianFormatError("date must be valid");
  return date;
}

function parseIsoDateOnly(value: string): { year: number; month: number; day: number; date: Date } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new IndianFormatError("date must be a valid ISO date-only value");
  return { year, month, day, date };
}

function dateParts(date: Date, timeZone: string): { day: string; month: string; year: string } {
  const parts = new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric", timeZone }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  const day = get("day");
  const month = get("month");
  const year = get("year");
  if (!day || !month || !year) throw new IndianFormatError("date could not be formatted");
  return { day, month, year };
}

function normalizeIdentifier(value: string, label: string): string {
  if (typeof value !== "string") throw new IndianFormatError(`${label} must be a string`);
  const normalized = value.replace(/\s+/g, "").toUpperCase();
  if (!normalized) throw new IndianFormatError(`${label} must not be empty`);
  return normalized;
}

function pad(value: number): string { return String(value).padStart(2, "0"); }
