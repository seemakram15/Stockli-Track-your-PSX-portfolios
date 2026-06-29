#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";

loadEnvFile(".env.local");

const requiredTabs = ["overview", "latest", "income", "balance", "cashflow", "ratios"];
const keyPrefix = "stock-fundamentals:v4:";
const incompleteKeyPrefix = "stock-fundamentals:incomplete:v1:";
const shouldPurge = process.argv.includes("--purge-incomplete");
const fundamentalsBase = (
  process.env.STOCK_FUNDAMENTALS_API_BASE_URL || "https://api.askanalyst.com.pk/api"
).replace(/\/+$/, "");

const redisConfigs = [
  {
    name: "primary",
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
  {
    name: "fallback",
    url: process.env.UPSTASH_REDIS_FALLBACK_REST_URL,
    token: process.env.UPSTASH_REDIS_FALLBACK_REST_TOKEN,
  },
].filter((config) => looksReal(config.url) && looksReal(config.token));

if (!redisConfigs.length) {
  console.error("No Redis cache is configured.");
  process.exit(1);
}

let totalKeys = 0;
let totalComplete = 0;
let totalIncomplete = 0;
let totalPurged = 0;

for (const config of redisConfigs) {
  const redis = new Redis({ url: config.url, token: config.token });
  const sourceSymbols = await fetchSourceSymbols();
  const keys = await scanKeys(redis, `${keyPrefix}*`);
  const cachedSymbols = new Set(keys.map((key) => key.replace(keyPrefix, "").toUpperCase()));
  const report = {
    sourceCompanies: sourceSymbols.length,
    keys: keys.length,
    complete: 0,
    incomplete: 0,
    notArchived: sourceSymbols.filter((symbol) => !cachedSymbols.has(symbol)).length,
    purged: 0,
    samples: [],
    queued: 0,
    queueSamples: [],
  };

  for (const key of keys) {
    const envelope = await redis.get(key);
    const value = envelope?.value;
    const missingTabs = getMissingTabs(value);
    if (!value || missingTabs.length > 0) {
      report.incomplete += 1;
      if (report.samples.length < 20) {
        report.samples.push({
          symbol: key.replace(keyPrefix, ""),
          missingTabs: missingTabs.length ? missingTabs : requiredTabs,
        });
      }
      if (shouldPurge) {
        await redis.del(key);
        report.purged += 1;
      }
    } else {
      report.complete += 1;
    }
  }

  const queueKeys = await scanKeys(redis, `${incompleteKeyPrefix}*`);
  report.queued = queueKeys.length;
  for (const key of queueKeys.slice(0, 20)) {
    const record = await redis.get(key);
    report.queueSamples.push({
      symbol: record?.symbol ?? key.replace(incompleteKeyPrefix, ""),
      missingTabs: record?.missingTabs ?? requiredTabs,
      attempts: record?.attempts ?? 0,
    });
  }

  totalKeys += report.keys;
  totalComplete += report.complete;
  totalIncomplete += report.incomplete;
  totalPurged += report.purged;

  console.log(
    `[${config.name}] source=${report.sourceCompanies} keys=${report.keys} complete=${report.complete} incomplete=${report.incomplete} notArchived=${report.notArchived} queued=${report.queued} purged=${report.purged}`
  );
  if (report.samples.length) {
    console.log(`[${config.name}] incomplete samples:`);
    for (const sample of report.samples) {
      console.log(`  ${sample.symbol}: missing ${sample.missingTabs.join(", ")}`);
    }
  }
  if (report.queueSamples.length) {
    console.log(`[${config.name}] queued incomplete samples:`);
    for (const sample of report.queueSamples) {
      console.log(
        `  ${sample.symbol}: missing ${sample.missingTabs.join(", ")} attempts=${sample.attempts}`
      );
    }
  }
}

console.log(
  `Totals: keys=${totalKeys} complete=${totalComplete} incomplete=${totalIncomplete} purged=${totalPurged}`
);

function getMissingTabs(value) {
  if (!value?.company || !value?.tabs) return requiredTabs;
  return requiredTabs.filter((tabId) => !tabIsCachedSection(value.tabs[tabId]));
}

function tabIsCachedSection(tab) {
  return tabHasUsableContent(tab);
}

function tabHasUsableContent(tab) {
  if (!tab || tab.status === "error") return false;
  return Boolean(tab.highlights?.length) || Boolean(tab.tables?.some((table) => table.rows?.length));
}

async function scanKeys(redis, match) {
  let cursor = 0;
  const keys = [];
  do {
    const result = await redis.scan(cursor, { match, count: 500 });
    cursor = Number(result[0]);
    keys.push(...result[1]);
  } while (cursor !== 0);
  return keys;
}

async function fetchSourceSymbols() {
  try {
    const response = await fetch(`${fundamentalsBase}/companylistwithids`, {
      headers: {
        accept: "application/json",
        "user-agent": "Stockli fundamentals cache audit",
      },
    });
    const companies = await response.json();
    if (!Array.isArray(companies)) return [];
    return [
      ...new Set(
        companies
          .map((company) => String(company?.symbol || company?.label2 || "").toUpperCase())
          .filter(Boolean)
      ),
    ].sort();
  } catch (error) {
    console.warn("Could not read fundamentals source company list:", error);
    return [];
  }
}

function looksReal(value) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return Boolean(normalized) && !normalized.includes("your-") && !normalized.includes("demo");
}

function loadEnvFile(filename) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;
    const key = trimmed.slice(0, equalsIndex).trim();
    const value = trimmed.slice(equalsIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
