/** Latest year in strings like "2023", "2020 - 2023", or "2024 - Present". */
export function getLatestYearFromPeriod(period: string): number {
  const years = period.match(/\d{4}/g)
  if (!years?.length) return 0
  return Math.max(...years.map(Number))
}

export function sortByPeriodDesc<T extends { period: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => getLatestYearFromPeriod(b.period) - getLatestYearFromPeriod(a.period),
  )
}
