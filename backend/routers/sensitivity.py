from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()

class SensitivityInput(BaseModel):
    base_revenue: float
    net_debt: float
    shares_outstanding: float
    depreciation_pct: float
    capex_pct: float
    wc_change_pct: float
    tax_rate: float
    interest_pct: float
    x_years: int
    y_years: int
    growth_y: float  # base growth rate
    ebit_margin: float  # base EBIT margin
    growth_terminal: float

@router.post("/api/dcf/sensitivity")
def dcf_sensitivity(input: SensitivityInput):
    def calculate_dcf(ebit_margin: float, growth_y: float):
        revenue = input.base_revenue
        fcf_results = []
        for year in range(1, input.y_years + 1):
            if year <= input.x_years:
                growth = growth_y / 100
            elif year < input.y_years:
                growth = growth_y / 100  # for simplicity, use growth_y throughout
            else:
                growth = input.growth_terminal / 100

            revenue *= (1 + growth)
            ebit = revenue * (ebit_margin / 100)
            tax = ebit * (input.tax_rate / 100)
            nopat = ebit - tax
            depreciation = revenue * (input.depreciation_pct / 100)
            capex = revenue * (input.capex_pct / 100)
            wc_change = revenue * (input.wc_change_pct / 100)
            fcf = nopat + depreciation - capex - wc_change
            discount_factor = (1 + input.interest_pct / 100) ** year
            pv_fcf = fcf / discount_factor
            fcf_results.append(pv_fcf)

        terminal_value = (fcf * (1 + input.growth_terminal / 100)) / ((input.interest_pct - input.growth_terminal) / 100)
        pv_terminal = terminal_value / ((1 + input.interest_pct / 100) ** input.y_years)
        enterprise_value = sum(fcf_results) + pv_terminal
        equity_value = enterprise_value - input.net_debt
        fair_value = equity_value / input.shares_outstanding
        return round(fair_value, 2)

    # Generate ranges centered on user's EBIT and Growth inputs
    ebit_values = [input.ebit_margin + i * 2 for i in range(-5, 6)]
    growth_values = [input.growth_y + i * 2 for i in range(-5, 6)]

    fair_values = []
    for ebit in ebit_values:
        row = []
        for growth in growth_values:
            row.append(calculate_dcf(ebit, growth))
        fair_values.append(row)

    return {
        "ebit_values": ebit_values,
        "growth_values": growth_values,
        "fair_values": fair_values
    }
