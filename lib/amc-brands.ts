export interface AmcBrand {
  key: string;
  fullName: string;
  shortName: string;
  initials: string;
  domain: string | null;
  color: string;
  patterns: RegExp[];
}

export const AMC_BRANDS: AmcBrand[] = [
  brand("abl", "ABL Asset Management Company Limited", "ABL", "ABL", "ablfunds.com.pk", "#0f4c8a", [
    /\babl\b/i,
    /allied/i,
  ]),
  brand("akd", "AKD Investment Management Limited", "AKD", "AKD", "akdinvestment.com", "#123a62", [
    /\bakd\b/i,
  ]),
  brand("al-habib", "AL Habib Asset Management Limited", "AL Habib", "AH", "alhabibasset.com", "#168044", [
    /\bal\s+habib\b/i,
    /first\s+habib/i,
  ]),
  brand("al-meezan", "Al Meezan Investment Management Limited", "Meezan", "AM", "almeezangroup.com", "#285c3b", [
    /al\s+meezan/i,
    /\bmeezan\b/i,
    /kse\s+meezan/i,
  ]),
  brand("alfalah", "Alfalah Investments Limited", "Alfalah", "AF", "alfalahinvestments.com", "#db2735", [
    /\balfalah\b/i,
  ]),
  brand("askari", "Askari Investment Management Limited", "Askari", "AK", "askarifunds.com", "#1b4f7a", [
    /\baskari\b/i,
  ]),
  brand("atlas", "Atlas Asset Management Limited", "Atlas", "AT", "atlasfunds.com.pk", "#8c1d2c", [
    /\batlas\b/i,
  ]),
  brand("awt", "AWT Investments Limited", "AWT", "AWT", "awtinvestments.com", "#314c22", [
    /\bawt\b/i,
  ]),
  brand("bma", "BMA Asset Management Company Limited", "BMA", "BMA", "bmafunds.com", "#812f2c", [
    /\bbma\b/i,
  ]),
  brand("faysal", "Faysal Asset Management Limited", "Faysal", "FY", "faysalfunds.com", "#006b8f", [
    /\bfaysal\b/i,
  ]),
  brand("golden-arrow", "Golden Arrow Asset Management Limited", "Golden Arrow", "GA", "goldenarrow.com.pk", "#c4962f", [
    /golden\s+arrow/i,
  ]),
  brand("hbl", "HBL Asset Management Limited", "HBL", "HBL", "hblasset.com", "#008b4a", [
    /\bhbl\b/i,
  ]),
  brand("js", "JS Investments Limited", "JS", "JS", "jsil.com", "#1556a4", [
    /\bjs\b/i,
  ]),
  brand("lakson", "Lakson Investments Limited", "Lakson", "LK", "laksoninvestments.com", "#3b2f7f", [
    /\blakson\b/i,
  ]),
  brand("lucky", "Lucky Investments Limited", "Lucky", "LU", "luckyinvestments.com.pk", "#2f7d45", [
    /\blucky\b/i,
  ]),
  brand("mahaana", "Mahaana Wealth Limited", "Mahaana", "MH", "mahaana.com", "#5b46d8", [
    /\bmahaana\b/i,
  ]),
  brand("mcb", "MCB Investment Management Limited", "MCB", "MCB", "mcbfunds.com", "#007445", [
    /\bmcb\b/i,
    /\balhamra\b/i,
    /pakistan\s+(capital|income|cash|stock|asset|sovereign)/i,
  ]),
  brand("nbp", "NBP Fund Management Limited", "NBP Funds", "NBP", "nbpfunds.com", "#23743a", [
    /\bnbp\b/i,
    /\bnafa\b/i,
    /sarmaya/i,
  ]),
  brand("nit", "National Investment Trust Limited", "NIT", "NIT", "nit.com.pk", "#255f9e", [
    /\bnit\b/i,
    /national\s+investment/i,
  ]),
  brand("pak-qatar", "Pak Qatar Asset Management Company Limited", "Pak Qatar", "PQ", "pqfunds.com.pk", "#317164", [
    /pak\s+qatar/i,
  ]),
  brand("ubl", "UBL Fund Managers Limited", "UBL", "UBL", "ublfunds.com", "#0a5dba", [
    /\bubl\b/i,
    /al\s+ameen/i,
    /unit\s+trust\s+of\s+pakistan/i,
  ]),
  brand("786", "786 Investments Limited", "786", "786", "786investments.com", "#0b6b5f", [
    /\b786\b/i,
  ]),
];

const UNKNOWN_BRAND: AmcBrand = {
  key: "unknown",
  fullName: "Other AMC",
  shortName: "Other",
  initials: "AMC",
  domain: null,
  color: "#0f766e",
  patterns: [],
};

export function identifyAmcBrand(value: string | null | undefined): AmcBrand {
  const text = clean(value ?? "");
  if (!text) return UNKNOWN_BRAND;

  const exact = AMC_BRANDS.find(
    (brandItem) =>
      brandItem.fullName.localeCompare(text, undefined, { sensitivity: "base" }) === 0 ||
      brandItem.shortName.localeCompare(text, undefined, { sensitivity: "base" }) === 0
  );
  if (exact) return exact;

  return AMC_BRANDS.find((brandItem) => brandItem.patterns.some((pattern) => pattern.test(text))) ??
    fallbackBrand(text);
}

export function amcIconUrl(brandItem: AmcBrand) {
  return brandItem.domain
    ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(brandItem.domain)}&sz=64`
    : null;
}

export function shortAmcName(value: string | null | undefined) {
  return identifyAmcBrand(value).shortName;
}

function brand(
  key: string,
  fullName: string,
  shortName: string,
  initials: string,
  domain: string,
  color: string,
  patterns: RegExp[]
): AmcBrand {
  return { key, fullName, shortName, initials, domain, color, patterns };
}

function fallbackBrand(value: string): AmcBrand {
  const shortName = value
    .replace(/Asset Management Company Limited|Asset Management Limited|Investment Management Limited|Investments Limited|Fund Management Limited|Fund Managers Limited|Limited/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  const initials = shortName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "AMC";

  return {
    ...UNKNOWN_BRAND,
    key: shortName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "unknown",
    fullName: value,
    shortName: shortName || value,
    initials,
  };
}

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}
