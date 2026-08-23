import {
  clampBookPosForCornerFold,
  getFlipInteractionRect,
  isInCornerHoverZone,
  type BookMode,
  type PageFlipInstance,
} from '../utils/pageEdgeZones'

export function attachCornerFoldControl(flip: PageFlipInstance, mode: BookMode): () => void {
  const originalUserMove = flip.userMove.bind(flip)

  flip.userMove = (pos, isTouch) => {
    const settings = flip.getSettings()
    const flipRect = getFlipInteractionRect(flip, mode)
    if (!flipRect) return

    const state = flip.getState()
    const inCornerZone = isInCornerHoverZone(pos, flipRect)
    let effectivePos = pos

    if (settings.showPageCorners) {
      if (inCornerZone) {
        effectivePos = clampBookPosForCornerFold(pos, flipRect)
      } else if (state === 'fold_corner') {
        effectivePos = { x: flipRect.width / 2, y: flipRect.height / 2 }
      } else {
        return
      }
    }

    originalUserMove(effectivePos, isTouch)
  }

  return () => {
    flip.userMove = originalUserMove
  }
}
