import type { MapData } from '../../features/map/types'
import type { ProjectsListData } from '../../features/projects/types'

export const PAGE_LAYOUT = {
  ABOUT_INTRO: 'ABOUT_INTRO',
  ABOUT_SKILLS: 'ABOUT_SKILLS',
  EXPERIENCE_LIST: 'EXPERIENCE_LIST',
  ACADEMIC_LIST: 'ACADEMIC_LIST',
  PROJECTS_LIST: 'PROJECTS_LIST',
  MAP: 'MAP',
  PLAIN: 'PLAIN',
} as const

export type PageLayout = (typeof PAGE_LAYOUT)[keyof typeof PAGE_LAYOUT]

export type BookPageLayoutConfig = MapData | Pick<ProjectsListData, 'projectsSide'>

export interface BookPageConfig {
  id: string
  layout: PageLayout
  title?: string
  markerLabel?: string
  backgroundImageUrl?: string
  config?: BookPageLayoutConfig
}
