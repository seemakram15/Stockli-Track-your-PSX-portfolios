import type { CdcParsedData } from "@/lib/types";

function parsePkrNumber(raw: string): number {
  return parseFloat(raw.replace(/,/g, "").trim()) || 0;
}

function normalizeDateStr(d: string): string {
  const match = d.match(/^(\d{1,2})-(\d{2})-(\d{4})$/);
  if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
  return d;
}

function afterLabel(text: string, label: string): string {
  const idx = text.indexOf(label);
  if (idx === -1) return "";
  return text.slice(idx + label.length).trimStart();
}

function firstToken(s: string): string {
  return s.match(/^[\S]+/)?.[0] ?? "";
}

export function parseCdcText(rawText: string): Omit<CdcParsedData, "symbol" | "symbolConfidence"> | null {
  const text = rawText.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Company name: first all-caps heading before "DIVIDEND / ZAKAT"
  const companyMatch = text.match(/^([A-Z][A-Z\s\(\)&\-\.,]+?)\s*\nDIVIDEND\s*[\/\\]\s*ZAKAT/m);
  if (!companyMatch) return null;
  const companyName = companyMatch[1].trim();

  // Date of Issue & Financial Year — values are on the line after the column header row
  const dateHeaderMatch = text.match(/Date of Issue\s+Financial Year[^\n]*\n([^\n]+)/);
  let issueDate = "";
  let financialYear = "";
  if (dateHeaderMatch) {
    const parts = dateHeaderMatch[1].trim().split(/\s+/);
    issueDate = normalizeDateStr(parts[0] ?? "");
    financialYear = parts[1] ?? "";
  }

  // Rate Per Security — Rs. X.XXXX appears on the same value row
  const rateMatch = text.match(/Date of Issue\s+Financial Year[^\n]*\n[^\n]*Rs\.\s*([\d,]+\.?\d*)/);
  const ratePerSecurity = rateMatch ? parsePkrNumber(rateMatch[1]) : 0;

  // Warrant No. & No. of Securities
  const warrantMatch = text.match(/Warrant No\.\s+No\. of Securities[^\n]*\n([^\n]+)/);
  let warrantNo = "";
  let noOfSecurities = 0;
  if (warrantMatch) {
    const parts = warrantMatch[1].trim().split(/\s+/);
    warrantNo = parts[0] ?? "";
    noOfSecurities = parseInt(parts[1] ?? "0", 10) || 0;
  }

  // Gross amount — last number on the "Securities not Liable to Zakat … Amount of Dividend" value row
  const grossMatch = text.match(/Amount of Dividend \(Rs\.\)\s*\n([^\n]+)/);
  let grossAmount = 0;
  if (grossMatch) {
    const parts = grossMatch[1].trim().split(/\s+/);
    grossAmount = parsePkrNumber(parts[parts.length - 1] ?? "0");
  }

  // Zakat & Tax Deducted
  const zakatTaxMatch = text.match(/Zakat Deducted \(Rs\.\)\s+Tax Deducted \(Rs\.\)\s*\n([^\n]+)/);
  let zakatDeducted = 0;
  let taxDeducted = 0;
  if (zakatTaxMatch) {
    const parts = zakatTaxMatch[1].trim().split(/\s+/);
    zakatDeducted = parsePkrNumber(parts[0] ?? "0");
    taxDeducted = parsePkrNumber(parts[1] ?? "0");
  }

  // Amount Paid (Net)
  const netMatch = text.match(/Amount Paid \(Rs\.\)\s*\n([^\n]+)/);
  const netAmount = netMatch ? parsePkrNumber(firstToken(netMatch[1])) : 0;

  // Payment Status & Payment Date
  const paymentMatch = text.match(/Payment Status\s+Payment Date\s*\n([^\n]+)/);
  let paymentStatus = "Paid";
  let paymentDate = "";
  if (paymentMatch) {
    const parts = paymentMatch[1].trim().split(/\s+/);
    paymentStatus = parts[0] ?? "Paid";
    paymentDate = normalizeDateStr(parts[1] ?? "");
  }

  // Fallback: if payment date still empty try "Payment Date\n<date>"
  if (!paymentDate) {
    const fallback = afterLabel(text, "Payment Date\n");
    paymentDate = normalizeDateStr(firstToken(fallback));
  }

  if (!paymentDate || !companyName) return null;

  return {
    companyName,
    warrantNo,
    issueDate,
    paymentDate,
    financialYear,
    ratePerSecurity,
    noOfSecurities,
    grossAmount,
    zakatDeducted,
    taxDeducted,
    netAmount,
    paymentStatus,
  };
}
