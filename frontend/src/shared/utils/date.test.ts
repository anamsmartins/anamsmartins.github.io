import { describe, expect, it } from 'vitest'

import { getLatestYearFromPeriod, sortByPeriodDesc } from './date'

describe('getLatestYearFromPeriod', () => {
  it('returns the year from a single-year period', () => {
    expect(getLatestYearFromPeriod('2023')).toBe(2023)
  })

  it('returns the latest year from a range', () => {
    expect(getLatestYearFromPeriod('2020 - 2023')).toBe(2023)
  })

  it('returns 0 when no year is present', () => {
    expect(getLatestYearFromPeriod('Present')).toBe(0)
  })
})

describe('sortByPeriodDesc', () => {
  it('sorts items by latest year descending', () => {
    const items = [
      { period: '2018 - 2019', label: 'older' },
      { period: '2022 - Present', label: 'newer' },
      { period: '2020 - 2021', label: 'middle' },
    ]

    expect(sortByPeriodDesc(items).map((item) => item.label)).toEqual(['newer', 'middle', 'older'])
  })
})
