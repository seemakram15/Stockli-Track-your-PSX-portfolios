"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CdcParsedData } from "@/lib/types";

export interface SaveDividendsResult {
  saved: number;
  skipped: number;
  errors: string[];
}

export async function saveCdcDividends(
  portfolioId: string,
  records: CdcParsedData[]
): Promise<SaveDividendsResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id")
    .eq("id", portfolioId)
    .eq("user_id", user.id)
    .single();

  if (!portfolio) throw new Error("Portfolio not found");

  let saved = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const r of records) {
    if (!r.symbol || !r.paymentDate) {
      errors.push(`${r.companyName}: missing symbol or payment date.`);
      continue;
    }

    const { error } = await supabase.from("cdc_dividends").insert({
      portfolio_id: portfolioId,
      symbol: r.symbol.toUpperCase(),
      company_name: r.companyName,
      warrant_no: r.warrantNo || null,
      issue_date: r.issueDate || null,
      payment_date: r.paymentDate,
      financial_year: r.financialYear || null,
      rate_per_security: r.ratePerSecurity,
      no_of_securities: r.noOfSecurities,
      gross_amount: r.grossAmount,
      zakat_deducted: r.zakatDeducted,
      tax_deducted: r.taxDeducted,
      net_amount: r.netAmount,
      payment_status: r.paymentStatus,
    });

    if (error) {
      if (error.code === "23505") {
        skipped++;
      } else {
        errors.push(`${r.companyName}: couldn’t save this dividend.`);
      }
    } else {
      saved++;
    }
  }

  revalidatePath(`/portfolios/${portfolioId}`);
  return { saved, skipped, errors };
}

export async function deleteCdcDividend(id: string, portfolioId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  await supabase
    .from("cdc_dividends")
    .delete()
    .eq("id", id)
    .eq("portfolio_id", portfolioId);

  revalidatePath(`/portfolios/${portfolioId}`);
}
