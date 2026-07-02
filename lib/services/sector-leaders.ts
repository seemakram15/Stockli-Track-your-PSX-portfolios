import "server-only";

import { buildSectorLeadersDataset } from "@/lib/analysis/sector-ranking";
import { getStaleCached } from "@/lib/cache/stale";
import { getMarketRows } from "@/lib/services/prices";
import { getArchivedStockFinancialsBatch } from "@/lib/services/stock-fundamentals";

const SECTOR_LEADERS_TTL_SECONDS = 30 * 60;
const SECTOR_LEADERS_STALE_SECONDS = 24 * 60 * 60;

export async function getSectorLeadersData() {
  return getStaleCached({
    key: "public:sector-leaders:v2",
    ttlSeconds: SECTOR_LEADERS_TTL_SECONDS,
    staleSeconds: SECTOR_LEADERS_STALE_SECONDS,
    load: async () => {
      const [records, marketRows] = await Promise.all([
        getAllArchivedFinancials(),
        getMarketRows(),
      ]);
      return buildSectorLeadersDataset({ records, marketRows });
    },
    isUsable: (value) => Boolean(value?.leaderboards?.length),
  });
}

async function getAllArchivedFinancials() {
  const records: Awaited<ReturnType<typeof getArchivedStockFinancialsBatch>>["records"] = [];
  let offset = 0;

  while (true) {
    const batch = await getArchivedStockFinancialsBatch({ offset, limit: 100 });
    records.push(...batch.records);
    if (batch.nextOffset == null) break;
    offset = batch.nextOffset;
  }

  return records;
}
