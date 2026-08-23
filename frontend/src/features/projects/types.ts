export interface ProjectCategory {
  id: string
  label: string
  shortLabel?: string
}

export interface ProjectLink {
  label: string
  url: string
  type?: 'github' | 'demo' | 'report' | 'article' | 'play' | string
  iconUrl?: string | null
}

export interface ProjectImage {
  url: string
  legend: string
}

export interface ProjectEntry {
  id?: string
  name: string
  categoryIds?: string[]
  importance?: number
  description: string
  techStack?: string[]
  features?: string[]
  links?: ProjectLink[]
  impact?: string
  githubUrl?: string
  /** Primary thumbnail — usually the project home screen. Falls back to images[0]. */
  imageUrl?: string | null
  /** Gallery images; home screen should be first. */
  images?: ProjectImage[]
}

export interface ProjectsListData {
  projectsSide?: 'left' | 'right'
  intro?: string
  githubIconUrl?: string | null
  linkIcons?: {
    github?: string | null
    demo?: string | null
    report?: string | null
    article?: string | null
    play?: string | null
  }
  categories?: ProjectCategory[]
  projects?: ProjectEntry[]
}

export type ProjectsPageSettings = Pick<
  ProjectsListData,
  'intro' | 'githubIconUrl' | 'linkIcons'
>
