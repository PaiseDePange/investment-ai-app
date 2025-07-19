from fastapi import APIRouter
from pydantic import BaseModel
from fastapi.responses import JSONResponse
import yfinance as yf

router = APIRouter()

class DCFInput(BaseModel):
    base_revenue: float
    net_debt: float
    shares_outstanding: float
    ebit_margin: float
    depreciation_pct: float
    capex_pct: float
    wc_change_pct: float
    tax_rate: float
    interest_pct: float
    x_years: int
    growth_x: float
    y_years: int
    growth_y: float
    growth_terminal: float

@router.get("/api/yfinance")
def get_stock_data(ticker: str):
    print(f"📡 Request received for: {ticker}")
    try:
        stock = yf.Ticker(ticker)

        info = stock.info
        fin = stock.financials
        bs = stock.balance_sheet
        
        revenue = fin.loc["Total Revenue"][0] if "Total Revenue" in fin.index else 0
        ebit = fin.loc["EBIT"][0] if "EBIT" in fin.index else 0
        depreciation = (
            fin.loc["Depreciation"][0]  # try exact key seen in .index
            if "Depreciation" in fin.index else
            fin.loc["Depreciation Income Statement"][0]
            if "Depreciation Income Statement" in fin.index else 0
        )
    
        capex = fin.loc["Capital Expenditures"][0] if "Capital Expenditures" in fin.index else 0

        debt = bs.loc["Long Term Debt"][0] if "Long Term Debt" in bs.index else 0
        cash = bs.loc["Cash And Cash Equivalents"][0] if "Cash And Cash Equivalents" in bs.index else 0
        net_debt = debt - cash
        current_price = info.get("currentPrice", None)
        shares = info.get("sharesOutstanding", 1000000000) / 1e7

        # Smart assumption calculations
        ebit_margin = (ebit / revenue * 100) if revenue > 0 else 20
        depreciation_pct = (depreciation / revenue * 100) if revenue > 0 else 5
        capex_pct = (abs(capex) / revenue * 100) if revenue > 0 else 6  # capex often negative
        wc_change_pct = 2  # placeholder, optional logic
        tax_rate = 25  # placeholder, or smart guess later
        
        #print("🧾 stock.financials:\n", fin)

        return {
            "current_price": round(current_price, 2) if current_price else None,
            "base_revenue": round(revenue / 1e7, 0),
            "net_debt": round(net_debt / 1e7, 0),
            "shares_outstanding": round(shares, 2),
            "ebit_margin": round(ebit_margin, 2),
            "depreciation_pct": round(depreciation_pct, 2),
            "capex_pct": round(capex_pct, 2),
            "wc_change_pct": wc_change_pct,
            "tax_rate": tax_rate,
            "interest_pct": 10,
            "growth_x": 15,
            "growth_y": 10,
            "growth_terminal": 5
        }

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@router.post("/api/dcf")
def calculate_dcf(input: DCFInput):
    fcf_table = []
    revenue = input.base_revenue
    fcf_results = []

    for year in range(1, input.y_years + 1):
        if year <= input.x_years:
            growth = input.growth_x / 100
        elif year < input.y_years:
            growth = input.growth_y / 100
        else:
            growth = input.growth_terminal / 100

        revenue *= (1 + growth)
        ebit = revenue * (input.ebit_margin / 100)
        tax = ebit * (input.tax_rate / 100)
        nopat = ebit - tax
        depreciation = revenue * (input.depreciation_pct / 100)
        capex = revenue * (input.capex_pct / 100)
        wc_change = revenue * (input.wc_change_pct / 100)
        fcf = nopat + depreciation - capex - wc_change
        discount_factor = (1 + input.interest_pct / 100) ** year
        pv_fcf = fcf / discount_factor
        fcf_results.append(pv_fcf)

        fcf_table.append({
            "Year": year,
            "Revenue": round(revenue, 2),
            "EBIT": round(ebit, 2),
            "Tax": round(tax, 2),
            "NOPAT": round(nopat, 2),
            "Depreciation": round(depreciation, 2),
            "CapEx": round(capex, 2),
            "WC Change": round(wc_change, 2),
            "FCF": round(fcf, 2),
            "PV of FCF": round(pv_fcf, 2)
        })

    terminal_value = (fcf * (1 + input.growth_terminal / 100)) / ((input.interest_pct - input.growth_terminal) / 100)
    pv_terminal = terminal_value / ((1 + input.interest_pct / 100) ** input.y_years)

    enterprise_value = sum(fcf_results) + pv_terminal
    equity_value = enterprise_value - input.net_debt
    fair_value_per_share = equity_value / input.shares_outstanding

    terminal_weight = (pv_terminal / enterprise_value) * 100
    phase1_pv = sum(fcf_results[:input.x_years])
    phase2_pv = sum(fcf_results[input.x_years:])

    return {
        "fcf_table": fcf_table,
        "fair_value_per_share": round(fair_value_per_share, 2),
        "enterprise_value": round(enterprise_value, 2),
        "equity_value": round(equity_value, 2),
        "net_debt": round(input.net_debt, 2),
        "shares_outstanding": round(input.shares_outstanding, 2),
        "terminal_value_pv": round(pv_terminal, 2),
        "terminal_weight": round(terminal_weight, 2),
        "phase1_pv": round(phase1_pv, 2),
        "phase2_pv": round(phase2_pv, 2)
    }

