import { TREASURY_YIELD_CURVE_ORIGIN } from '../consts';

/**
 * Fetches and parses the US Treasury Daily Treasury Rate XML feed.
 * Feed: https://home.treasury.gov/treasury-daily-interest-rate-xml-feed
 * Returns daily 10-year CMT rate for the given time range (for comparison with vault APY).
 */

export type TreasuryChartPoint = {
  timestampMs: number;
  rate: number;
};

const NS = {
  atom: 'http://www.w3.org/2005/Atom',
  d: 'http://schemas.microsoft.com/ado/2007/08/dataservices',
  m: 'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
};

/**
 * Fetches a single calendar month from the Treasury API (field_tdr_date_value_month=YYYYMM).
 * Returns sorted array of { timestampMs, rate } for each trading day in that month.
 */
const fetchMonthXml = async (yyyymm: string): Promise<TreasuryChartPoint[]> => {
  const url = `${TREASURY_YIELD_CURVE_ORIGIN}?data=daily_treasury_yield_curve&field_tdr_date_value_month=${yyyymm}`;
  const res = await fetch(url, { headers: { Accept: 'application/xml' } });
  if (!res.ok) throw new Error(`Treasury API error: ${res.status}`);
  const xml = await res.text();
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  const entries = doc.getElementsByTagNameNS(NS.atom, 'entry');
  const points: TreasuryChartPoint[] = [];

  for (const entry of entries) {
    const props = entry.getElementsByTagNameNS(NS.m, 'properties')[0];
    if (!props) continue;

    const dateEl = props.getElementsByTagNameNS(NS.d, 'NEW_DATE')[0];
    const rateEl = props.getElementsByTagNameNS(NS.d, 'BC_10YEAR')[0];
    if (!dateEl?.textContent || !rateEl?.textContent) continue;

    const dateStr = dateEl.textContent.trim();
    const rate = Number.parseFloat(rateEl.textContent.trim());
    if (Number.isNaN(rate)) continue;

    const timestampMs = new Date(dateStr).getTime();
    points.push({ timestampMs, rate });
  }

  return points.sort((a, b) => a.timestampMs - b.timestampMs);
};

/** Returns all YYYYMM strings for months between fromDate and toDate (inclusive). */
export const getMonthRange = (fromDate: Date, toDate: Date): string[] => {
  const months: string[] = [];
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);
  const last = new Date(toDate.getFullYear(), toDate.getMonth(), 1);
  while (cursor <= last) {
    const mm = String(cursor.getMonth() + 1).padStart(2, '0');
    months.push(`${cursor.getFullYear()}${mm}`);
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return months;
};

/**
 * Fetches Treasury data for the same period as the vault chart:
 * from fromTimestampSeconds (inclusive) to end of current day (inclusive).
 * Requests only the months that overlap the range (1–4 requests for 1M/3M views)
 * instead of fetching entire years.
 */
export const fetchTreasuryChartData = async (
  fromTimestampSeconds: number,
): Promise<TreasuryChartPoint[] | null> => {
  try {
    const fromMs = fromTimestampSeconds * 1000;
    const fromDate = new Date(fromMs);
    const toDate = new Date();
    const toMs = toDate.setHours(23, 59, 59, 999); // end of today

    const months = getMonthRange(fromDate, toDate);

    // Fetch only the needed months in parallel; months are in ascending order so flat() is sorted.
    const allPoints = (await Promise.all(months.map(fetchMonthXml))).flat();

    return allPoints.filter(
      (p) => p.timestampMs >= fromMs && p.timestampMs <= toMs,
    );
  } catch (error) {
    console.error('Error fetching Treasury chart data:', error);
    return null;
  }
};
