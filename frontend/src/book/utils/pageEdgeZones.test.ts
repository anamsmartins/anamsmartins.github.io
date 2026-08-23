import { describe, expect, it } from 'vitest'

import {
  clampBookPosForCornerFold,
  getEdgeFlipAction,
  isInCornerHoverZone,
  isInPageEdgeStripe,
  PAGE_EDGE_ZONE_FRACTION,
} from './pageEdgeZones'

const rect = { width: 1000, height: 800, pageWidth: 500 }

describe('isInPageEdgeStripe', () => {
  it('detects left and right edge stripes', () => {
    const edge = rect.pageWidth * PAGE_EDGE_ZONE_FRACTION
    expect(isInPageEdgeStripe({ x: edge - 1, y: 400 }, rect)).toBe(true)
    expect(isInPageEdgeStripe({ x: rect.width - edge + 1, y: 400 }, rect)).toBe(true)
    expect(isInPageEdgeStripe({ x: rect.width / 2, y: 400 }, rect)).toBe(false)
  })
})

describe('isInCornerHoverZone', () => {
  it('requires both edge stripe and corner height', () => {
    const edge = rect.pageWidth * PAGE_EDGE_ZONE_FRACTION
    const corner = rect.height * PAGE_EDGE_ZONE_FRACTION
    expect(isInCornerHoverZone({ x: edge - 1, y: corner - 1 }, rect)).toBe(true)
    expect(isInCornerHoverZone({ x: edge - 1, y: rect.height / 2 }, rect)).toBe(false)
  })
})

describe('clampBookPosForCornerFold', () => {
  it('clamps toward the spine on the left page', () => {
    const clamped = clampBookPosForCornerFold({ x: 200, y: 100 }, rect)
    expect(clamped.x).toBe(75)
  })
})

describe('getEdgeFlipAction', () => {
  it('returns prev on the left half and next on the right half', () => {
    const bookRect = new DOMRect(0, 0, rect.width, rect.height)
    expect(getEdgeFlipAction(10, 400, bookRect, 'spread')).toBe('prev')
    expect(getEdgeFlipAction(bookRect.width - 10, 400, bookRect, 'spread')).toBe('next')
    expect(getEdgeFlipAction(bookRect.width / 2, 400, bookRect, 'spread')).toBe(null)
  })
})
