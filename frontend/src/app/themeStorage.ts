export type ThemeId = 'fantasy' | 'professional'

const STORAGE_KEY = 'portfolio-theme'

export function getStoredTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'fantasy' ? 'fantasy' : 'professional'
}

export function storeTheme(theme: ThemeId): void {
  localStorage.setItem(STORAGE_KEY, theme)
}
