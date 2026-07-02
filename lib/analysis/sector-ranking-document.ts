export type SectorDocumentDirection = "higher" | "lower";

export type SectorDocumentParameter = {
  rank: number;
  category: string;
  label: string;
  formula: string;
  direction: SectorDocumentDirection;
  guidance: string;
};

export type SectorDocumentRule = {
  name: string;
  parameters: SectorDocumentParameter[];
};

export const SECTOR_DOCUMENT_RULES: SectorDocumentRule[] = [
  {
    "name": "Automobile Assembler",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Liquidity",
        "label": "Current Ratio",
        "formula": "Current Assets / Current Liabilities",
        "direction": "higher",
        "guidance": "Higher is safer; usually > 1.0x"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Automobile Parts & Accessories",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Cable & Electrical Goods",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Cement",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 7,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "EV / EBITDA",
        "formula": "(Market Cap + Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better if EBITDA is positive"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Chemical",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "EV / EBITDA",
        "formula": "(Market Cap + Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better if EBITDA is positive"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Close-End Mutual Fund",
    "parameters": [
      {
        "rank": 1,
        "category": "NAV valuation",
        "label": "Discount / Premium to NAV",
        "formula": "(NAV per Share - Market Price) / NAV per Share",
        "direction": "higher",
        "guidance": "Higher discount is cheaper; check quality"
      },
      {
        "rank": 2,
        "category": "NAV valuation",
        "label": "Price / NAV",
        "formula": "Market Price / NAV per Share",
        "direction": "lower",
        "guidance": "Lower is cheaper"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROE on NAV",
        "formula": "Net Income / Net Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Efficiency",
        "label": "Expense Ratio",
        "formula": "Total Expenses / Net Assets",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 5,
        "category": "Income quality",
        "label": "Investment Income Yield",
        "formula": "Investment Income / Net Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 6,
        "category": "Debt/Risk",
        "label": "Debt / Assets",
        "formula": "Total Debt / Total Assets",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Balance sheet",
        "label": "Cash + Investments / Total Assets",
        "formula": "(Cash + ST Investments + LT Investments) / Total Assets",
        "direction": "higher",
        "guidance": "Higher is better for funds/holding companies"
      },
      {
        "rank": 8,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Dividend",
        "label": "Distribution Yield",
        "formula": "Distribution per Unit / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Distribution Cover",
        "formula": "Net Investment Income or AFFO / Distribution Paid",
        "direction": "higher",
        "guidance": "Above 1.0x is better"
      }
    ]
  },
  {
    "name": "Commercial Banks",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "ROE",
        "formula": "PAT / Total Equity",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "ROA",
        "formula": "PAT / Total Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Bank profitability",
        "label": "Net Interest Margin",
        "formula": "Net Interest Income / Earning Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Efficiency",
        "label": "Cost-to-Income Ratio",
        "formula": "Operating Expenses / Total Income",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 5,
        "category": "Asset quality",
        "label": "NPL / Infection Ratio",
        "formula": "Non-performing Loans / Gross Advances",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 6,
        "category": "Asset quality",
        "label": "Coverage Ratio",
        "formula": "Loan Loss Provisions / Non-performing Loans",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 7,
        "category": "Capital strength",
        "label": "Capital Adequacy Ratio",
        "formula": "Regulatory Capital / Risk Weighted Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 8,
        "category": "Valuation",
        "label": "P/B",
        "formula": "Market Price / BVPS",
        "direction": "lower",
        "guidance": "Lower is cheaper if equity is positive"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "60% Dividend Yield score + 40% Payout Safety score; penalize weak capital",
        "direction": "higher",
        "guidance": "Higher and sustainable is better"
      }
    ]
  },
  {
    "name": "Engineering",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Liquidity",
        "label": "Current Ratio",
        "formula": "Current Assets / Current Liabilities",
        "direction": "higher",
        "guidance": "Higher is safer; usually > 1.0x"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Exchange Traded Funds",
    "parameters": [
      {
        "rank": 1,
        "category": "NAV valuation",
        "label": "Discount / Premium to NAV",
        "formula": "(NAV per Share - Market Price) / NAV per Share",
        "direction": "higher",
        "guidance": "Higher discount is cheaper; check quality"
      },
      {
        "rank": 2,
        "category": "NAV valuation",
        "label": "Price / NAV",
        "formula": "Market Price / NAV per Share",
        "direction": "lower",
        "guidance": "Lower is cheaper"
      },
      {
        "rank": 3,
        "category": "ETF quality",
        "label": "Tracking Difference",
        "formula": "Absolute value of ETF Return - Benchmark Return",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 4,
        "category": "Efficiency",
        "label": "Expense Ratio",
        "formula": "Total Expenses / Net Assets",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 5,
        "category": "Scale",
        "label": "AUM / Net Assets",
        "formula": "Net Assets or AUM of the fund",
        "direction": "higher",
        "guidance": "Higher is generally better"
      },
      {
        "rank": 6,
        "category": "ETF quality",
        "label": "Cash Drag",
        "formula": "Cash / Net Assets",
        "direction": "lower",
        "guidance": "Lower is better unless strategy requires cash"
      },
      {
        "rank": 7,
        "category": "Liquidity",
        "label": "Trading Liquidity",
        "formula": "Average Daily Value Traded",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 8,
        "category": "Dividend",
        "label": "Distribution Yield",
        "formula": "Distribution per Unit / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Dividend",
        "label": "Distribution Cover",
        "formula": "Net Investment Income or AFFO / Distribution Paid",
        "direction": "higher",
        "guidance": "Above 1.0x is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Portfolio Dividend Yield",
        "formula": "Portfolio Dividends / NAV",
        "direction": "higher",
        "guidance": "Higher is better"
      }
    ]
  },
  {
    "name": "Fertilizer",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Food & Personal Care Products",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Liquidity",
        "label": "Current Ratio",
        "formula": "Current Assets / Current Liabilities",
        "direction": "higher",
        "guidance": "Higher is safer; usually > 1.0x"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Glass & Ceramics",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "EV / EBITDA",
        "formula": "(Market Cap + Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better if EBITDA is positive"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Holding Companies",
    "parameters": [
      {
        "rank": 1,
        "category": "NAV valuation",
        "label": "Discount / Premium to NAV",
        "formula": "(NAV per Share - Market Price) / NAV per Share",
        "direction": "higher",
        "guidance": "Higher discount is cheaper; check quality"
      },
      {
        "rank": 2,
        "category": "Valuation",
        "label": "P/B",
        "formula": "Market Price / BVPS",
        "direction": "lower",
        "guidance": "Lower is cheaper if equity is positive"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROE",
        "formula": "PAT / Total Equity",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Income quality",
        "label": "Investment Income Yield",
        "formula": "Investment Income / Net Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Income quality",
        "label": "Cash Income Ratio",
        "formula": "(Cash Dividends Received + Interest Received) / Investment Income",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 6,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 8,
        "category": "Balance sheet",
        "label": "Cash + Investments / Total Assets",
        "formula": "(Cash + ST Investments + LT Investments) / Total Assets",
        "direction": "higher",
        "guidance": "Higher is better for funds/holding companies"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Insurance",
    "parameters": [
      {
        "rank": 1,
        "category": "Insurance underwriting",
        "label": "Combined Ratio",
        "formula": "Loss Ratio + Expense Ratio",
        "direction": "higher",
        "guidance": "Below 100% is strong"
      },
      {
        "rank": 2,
        "category": "Insurance underwriting",
        "label": "Loss Ratio",
        "formula": "Claims / Net Premium Earned",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 3,
        "category": "Insurance underwriting",
        "label": "Insurance Expense Ratio",
        "formula": "Underwriting Expenses / Net Premium Earned",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 4,
        "category": "Insurance underwriting",
        "label": "Underwriting Margin",
        "formula": "Underwriting Profit / Net Premium Earned",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Insurance income",
        "label": "Investment Income / Net Premium",
        "formula": "Investment Income / Net Premium Earned",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 6,
        "category": "Profitability",
        "label": "ROE",
        "formula": "PAT / Total Equity",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 7,
        "category": "Solvency",
        "label": "Equity / Total Assets",
        "formula": "Total Equity / Total Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 8,
        "category": "Valuation",
        "label": "P/B",
        "formula": "Market Price / BVPS",
        "direction": "lower",
        "guidance": "Lower is cheaper if equity is positive"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "Dividend Yield score + Payout Safety score; penalize weak solvency",
        "direction": "higher",
        "guidance": "Higher and sustainable is better"
      }
    ]
  },
  {
    "name": "Leather & Tanneries",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Miscellaneous",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "ROE",
        "formula": "PAT / Total Equity",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Modarabas",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "ROE",
        "formula": "PAT / Total Equity",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "ROA",
        "formula": "PAT / Total Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Valuation",
        "label": "P/B",
        "formula": "Market Price / BVPS",
        "direction": "lower",
        "guidance": "Lower is cheaper if equity is positive"
      },
      {
        "rank": 4,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 6,
        "category": "Income quality",
        "label": "Financing / Investment Income Yield",
        "formula": "Financing or Investment Income / Total Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 7,
        "category": "Efficiency",
        "label": "Cost-to-Income Ratio",
        "formula": "Operating Expenses / Total Income",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Asset quality",
        "label": "Asset Quality / NPL Ratio",
        "formula": "Non-performing Assets / Financing Portfolio",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Oil & Gas Exploration Companies",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 7,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Oil & Gas Marketing Companies",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Liquidity",
        "label": "Current Ratio",
        "formula": "Current Assets / Current Liabilities",
        "direction": "higher",
        "guidance": "Higher is safer; usually > 1.0x"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Paper, Board & Packaging",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Pharmaceuticals",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Power Generation & Distribution",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "ROE",
        "formula": "PAT / Total Equity",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Real Estate Investment Trust",
    "parameters": [
      {
        "rank": 1,
        "category": "NAV valuation",
        "label": "Discount / Premium to NAV",
        "formula": "(NAV per Share - Market Price) / NAV per Share",
        "direction": "higher",
        "guidance": "Higher discount is cheaper; check quality"
      },
      {
        "rank": 2,
        "category": "REIT cash earnings",
        "label": "FFO Yield",
        "formula": "Funds From Operations / Market Cap",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "REIT valuation",
        "label": "P / FFO",
        "formula": "Market Price / FFO per Share",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 4,
        "category": "REIT dividend safety",
        "label": "AFFO Distribution Cover",
        "formula": "AFFO / Distribution Paid",
        "direction": "higher",
        "guidance": "Above 1.0x is better"
      },
      {
        "rank": 5,
        "category": "Dividend",
        "label": "Distribution Yield",
        "formula": "Distribution per Unit / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 6,
        "category": "Debt/Risk",
        "label": "Debt / Assets",
        "formula": "Total Debt / Total Assets",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 8,
        "category": "REIT profitability",
        "label": "Rental Income Margin",
        "formula": "Rental Profit / Rental Income",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Cash quality",
        "label": "CFO / Net Income",
        "formula": "Operating Cash Flow / Net Income",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 10,
        "category": "REIT operating quality",
        "label": "Occupancy Rate",
        "formula": "Rented Area / Total Rentable Area",
        "direction": "higher",
        "guidance": "Higher is better"
      }
    ]
  },
  {
    "name": "Refinery",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Sugar & Allied Industries",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Liquidity",
        "label": "Current Ratio",
        "formula": "Current Assets / Current Liabilities",
        "direction": "higher",
        "guidance": "Higher is safer; usually > 1.0x"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Synthetic & Rayon",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Technology & Communication",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 8,
        "category": "Balance sheet",
        "label": "Net Cash / Share",
        "formula": "(Cash + ST Investments - Total Debt) / Shares Outstanding",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "EV / Sales",
        "formula": "Enterprise Value / Net Sales",
        "direction": "lower",
        "guidance": "Lower is better if margins are good"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Textile Composite",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Receivable Days",
        "formula": "Trade Debts / Net Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Textile Spinning",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Gross Margin",
        "formula": "Gross Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 5,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 6,
        "category": "Activity",
        "label": "Inventory Days",
        "formula": "Stock in Trade / Cost of Sales * 365",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 7,
        "category": "Liquidity",
        "label": "Current Ratio",
        "formula": "Current Assets / Current Liabilities",
        "direction": "higher",
        "guidance": "Higher is safer; usually > 1.0x"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Debt to Equity",
        "formula": "Total Debt / Total Equity",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Tobacco",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Net Margin",
        "formula": "PAT / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Profitability",
        "label": "ROE",
        "formula": "PAT / Total Equity",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 8,
        "category": "Valuation",
        "label": "Earnings Yield",
        "formula": "EPS / Market Price",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 9,
        "category": "Valuation",
        "label": "EV / EBITDA",
        "formula": "(Market Cap + Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better if EBITDA is positive"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  },
  {
    "name": "Transport",
    "parameters": [
      {
        "rank": 1,
        "category": "Profitability",
        "label": "EBITDA Margin",
        "formula": "EBITDA / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 2,
        "category": "Profitability",
        "label": "Operating Margin",
        "formula": "Operating Profit / Net Sales",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 3,
        "category": "Profitability",
        "label": "ROCE",
        "formula": "EBIT / (Total Equity + Total Debt - Cash - ST Investments)",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 4,
        "category": "Efficiency",
        "label": "Asset Turnover",
        "formula": "Net Sales / Total Assets",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 5,
        "category": "Pure earnings",
        "label": "Core Earnings Quality",
        "formula": "Operating Profit / (Operating Profit + Other Income)",
        "direction": "higher",
        "guidance": "Higher is better; shows less dependence on other income"
      },
      {
        "rank": 6,
        "category": "Cash quality",
        "label": "CFO / PAT",
        "formula": "Operating Cash Flow / PAT",
        "direction": "higher",
        "guidance": "Around or above 1.0x is strong"
      },
      {
        "rank": 7,
        "category": "Cash quality",
        "label": "FCF Yield",
        "formula": "(Operating Cash Flow - CAPEX) / Market Cap",
        "direction": "higher",
        "guidance": "Higher and positive is better"
      },
      {
        "rank": 8,
        "category": "Debt/Risk",
        "label": "Net Debt / EBITDA",
        "formula": "(Total Debt - Cash - ST Investments) / EBITDA",
        "direction": "lower",
        "guidance": "Lower is better"
      },
      {
        "rank": 9,
        "category": "Debt/Risk",
        "label": "Interest Coverage",
        "formula": "EBIT / Financial Charges",
        "direction": "higher",
        "guidance": "Higher is better"
      },
      {
        "rank": 10,
        "category": "Dividend",
        "label": "Dividend Score",
        "formula": "40% Dividend Yield score + 30% Payout Safety score + 30% Cash Cover score",
        "direction": "higher",
        "guidance": "Higher is better; dividend should be sustainable"
      }
    ]
  }
] as const;
