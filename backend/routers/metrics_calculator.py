# metrics_calculator.py
import pandas as pd
def safe_divide(numerator, denominator):
    try:
        return round(numerator / denominator, 2) if denominator != 0 else 0.0
    except:
        return 0.0

def calculate_metrics(pnl, bs, cf, years):
    def get_values(table, label):
        return table.get(label, [0] * len(years))[:len(years)]

    revenue = get_values(pnl, "Sales")
    net_profit = get_values(pnl, "Net profit")
    interest = get_values(pnl, "Interest")
    depreciation = get_values(pnl, "Depreciation")
    reserves = get_values(bs, "Reserves")
    equity_capital = get_values(bs, "Equity Share Capital")
    debt = get_values(bs, "Borrowings")
    cash = get_values(bs, "Cash & Bank")
    investments = get_values(bs, "Investments")
    capex = get_values(bs, "Capital Work in Progress")
    net_block = get_values(bs, "Net Block")

    equity = [e + r for e, r in zip(equity_capital, reserves)]
    cash_and_investments = [(c or 0) + (i or 0) for c, i in zip(cash, investments)]

    min_len = min(len(revenue), len(net_profit), len(depreciation))

    ebit = [r - i for r, i in zip(revenue[:min_len], interest[:min_len])]
    ebitda = [e + d for e, d in zip(ebit, depreciation[:min_len])]

    ebitda_margin = [safe_divide(e, r) * 100 for e, r in zip(ebitda, revenue[:min_len])]
    net_profit_margin = [safe_divide(n, r) * 100 for n, r in zip(net_profit[:min_len], revenue[:min_len])]
    roce = [safe_divide(e, (eq + d - c)) * 100 for e, eq, d, c in zip(ebit, equity[:min_len], debt[:min_len], cash_and_investments[:min_len])]
    roe = [safe_divide(n, eq) * 100 for n, eq in zip(net_profit[:min_len], equity[:min_len])]
    interest_coverage = [safe_divide(e, i) for e, i in zip(ebit, interest[:min_len])]
    debt_to_equity = [safe_divide(d, eq) for d, eq in zip(debt[:min_len], equity[:min_len])]
    fcf = [safe_divide(n + d - c, 1) for n, d, c in zip(net_profit[:min_len], depreciation[:min_len], capex[:min_len])]
    fcf_margin = [safe_divide(f, r) * 100 for f, r in zip(fcf, revenue[:min_len])]

    # ✅ New: calculate growth rates
    def calculate_growth(series):
        return [
            round(((curr / prev) - 1) * 100, 2) if prev not in (0, None) else 0.0
            for prev, curr in zip(series[:-1], series[1:])
        ]

    revenue_growth = calculate_growth(revenue)
    ebitda_growth = calculate_growth(ebitda)
    net_profit_growth = calculate_growth(net_profit)

    tax_rate = safe_divide(get_values(pnl, "Tax")[-1], ebit[-1]) * 100 if ebit else 0
    capex_pct = safe_divide(capex[-1], revenue[-1]) * 100 if capex and revenue else 2.0

    calculated_metrics = {
        # Absolute values
        "revenue": revenue,
        "net_profit": net_profit,
        "ebit": ebit,
        "ebitda": ebitda,
        "net_block": net_block,
        "cwip": capex,
        "equity": equity,
        "debt": debt,
        "cash_and_bank": cash_and_investments,
        # Growth
        "revenue_growth": revenue_growth,
        "ebitda_growth": ebitda_growth,
        "net_profit_growth": net_profit_growth,

        # Ratios
        "ebitda_margin": ebitda_margin,
        "net_profit_margin": net_profit_margin,
        "roce": roce,
        "roe": roe,
        "interest_coverage": interest_coverage,
        "debt_to_equity": debt_to_equity,
        "fcf": fcf,
        "fcf_margin": fcf_margin,

        # Static assumptions
        "tax_rate": tax_rate,
        "wacc": 12.0,
        "terminal_growth_rate": 5.0,
        

    }

    assumptions = {
        "ebit_margin": round(safe_divide(ebit[-1], revenue[-1]) * 100, 2) if ebit and revenue else 0,
        "depreciation_pct": round(safe_divide(depreciation[-1], revenue[-1]) * 100, 2) if depreciation and revenue else 0,
        "tax_rate": round(tax_rate, 2),
        "capex_pct": round(capex_pct, 2),
        "wc_change_pct": 2.0,
        "interest_pct": 11.0,
    }
    calculated_metrics["years"] = years

    return calculated_metrics, assumptions


def make_json_safe(obj):
    import datetime
    if isinstance(obj, dict):
        return {k: make_json_safe(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_json_safe(v) for v in obj]
    elif isinstance(obj, (pd.Timestamp, datetime.datetime)):
        return str(obj)
    return obj
