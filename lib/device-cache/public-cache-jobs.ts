export type PublicDeviceCacheJob = {
  cacheKey: string;
  url: string;
};

export const PUBLIC_DEVICE_CACHE_JOBS: PublicDeviceCacheJob[] = [
  {
    cacheKey: "public:stock-fundamentals:companies:ready:v1",
    url: "/api/public/stock-fundamentals/companies?ready=1",
  },
  { cacheKey: "public:psx-market", url: "/api/public/market" },
  { cacheKey: "public:market-strategy", url: "/api/public/market-strategy" },
  { cacheKey: "public:mufap:mutual", url: "/api/public/mufap?kind=mutual" },
  { cacheKey: "public:mufap:etfs", url: "/api/public/mufap?kind=etfs" },
  { cacheKey: "public:global-market:us", url: "/api/public/global-market/us" },
  { cacheKey: "public:global-market:india", url: "/api/public/global-market/india" },
  { cacheKey: "public:global-market:world", url: "/api/public/global-market/world" },
  { cacheKey: "public:global-market:commodities", url: "/api/public/global-market/commodities" },
  { cacheKey: "public:global-market:crypto", url: "/api/public/global-market/crypto" },
  { cacheKey: "public:global-market:oil", url: "/api/public/global-market/oil" },
  { cacheKey: "public:youtubers", url: "/api/public/youtubers" },
  { cacheKey: "public:useful-links:v2", url: "/api/public/useful-links" },
  { cacheKey: "public:board-meetings", url: "/api/public/board-meetings" },
  { cacheKey: "public:book-closures", url: "/api/public/book-closures" },
  { cacheKey: "public:dividend-history", url: "/api/public/dividend-history" },
  { cacheKey: "public:pivot-points", url: "/api/public/pivot-points" },
];
