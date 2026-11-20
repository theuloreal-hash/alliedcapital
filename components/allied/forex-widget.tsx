const CURRENCIES = [
  { code: "USD", name: "United States dollar" },
  { code: "EUR", name: "Euro" },
  { code: "CHF", name: "Swiss franc" },
  { code: "AED", name: "United Arab Emirates dirham" },
  { code: "AFN", name: "Afghan afghani" },
  { code: "ALL", name: "Albanian lek" },
  { code: "AMD", name: "Armenian dram" },
  { code: "GHS", name: "Ghanaian cedi" },
]

type ForexData = {
  rates: Record<string, number> | null
  updated: string | null
}

async function loadForex(): Promise<ForexData> {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    })
    if (!response.ok) return { rates: null, updated: null }

    const payload = (await response.json()) as {
      result?: string
      rates?: Record<string, number>
      time_last_update_utc?: string
    }

    if (payload.result !== "success" || !payload.rates) return { rates: null, updated: null }

    return {
      rates: payload.rates,
      updated: payload.time_last_update_utc ?? null,
    }
  } catch {
    return { rates: null, updated: null }
  }
}

function formatRate(rate: number | undefined) {
  if (typeof rate !== "number" || !Number.isFinite(rate)) return "—"
  return rate.toFixed(4)
}

export async function ForexWidget() {
  const { rates, updated } = await loadForex()

  const updatedLabel = updated
    ? new Date(updated).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      })
    : null

  return (
    <aside className="border border-[#d4d4d4] bg-white">
      <div className="border-b border-[#d4d4d4] px-3 py-2.5 text-center">
        <h2 className="text-[12px] font-bold text-[#333333]">Live Forex</h2>
        <p className="mt-0.5 text-[9.5px] text-[#777777]">{updatedLabel ?? "Rate date unavailable"}</p>
      </div>

      <div className="px-3 py-2.5">
        <p className="text-[10px] text-[#555555]">Base currency: United States dollar</p>
        <p className="mt-1 text-[9px] text-[#888888]">Rate per 1 USD</p>

        <table className="mt-2 w-full border-collapse text-left">
          <thead>
            <tr>
              <th className="border border-[#d4d4d4] bg-[#fafafa] px-2 py-1 text-[9px] font-medium text-[#777777]">
                Currency
              </th>
              <th className="border border-[#d4d4d4] bg-[#fafafa] px-2 py-1 text-right text-[9px] font-medium text-[#777777]">
                Rate
              </th>
            </tr>
          </thead>
          <tbody>
            {CURRENCIES.map((currency) => (
              <tr key={currency.code}>
                <td className="border border-[#d4d4d4] px-2 py-[5px] text-[9.5px] leading-[1.4] text-[#555555]">
                  {currency.name} ({currency.code})
                </td>
                <td className="border border-[#d4d4d4] px-2 py-[5px] text-right text-[9.5px] text-[#333333]">
                  {rates ? formatRate(currency.code === "USD" ? 1 : rates[currency.code]) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!rates && (
          <p className="mt-2 border border-[#f0e1cd] bg-[#fdf8f0] px-2 py-1.5 text-[9px] leading-[1.5] text-[#8a6a3a]">
            Live exchange rates are temporarily unavailable. Please try again later.
          </p>
        )}

        <p className="mt-2 text-[8.5px] text-[#999999]">
          Rates supplied by open.er-api.com. Indicative only.
        </p>
      </div>
    </aside>
  )
}
