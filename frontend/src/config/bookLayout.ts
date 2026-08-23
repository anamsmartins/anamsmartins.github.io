import { PAGE_LAYOUT } from '../shared/types/layouts'
import type { BookPageConfig } from '../shared/types/layouts'

export type { BookPageConfig }

export const BOOK_LAYOUT: BookPageConfig[] = [
  {
    id: 'about-intro',
    layout: PAGE_LAYOUT.ABOUT_INTRO,
    title: 'About Me',
    markerLabel: 'About',
    backgroundImageUrl: '/assets/book/book-page-background-left.png',
  },
  {
    id: 'about-skills',
    layout: PAGE_LAYOUT.ABOUT_SKILLS,
    backgroundImageUrl: '/assets/book/book-page-background-right.png',
  },
  {
    id: 'experience',
    layout: PAGE_LAYOUT.EXPERIENCE_LIST,
    title: 'Professional Experience',
    markerLabel: 'Experience',
    backgroundImageUrl: '/assets/book/book-page-background-left.png',
  },
  {
    id: 'academic',
    layout: PAGE_LAYOUT.ACADEMIC_LIST,
    title: 'Academic Background',
    backgroundImageUrl: '/assets/book/book-page-background-right.png',
  },
  {
    id: 'projects-left',
    layout: PAGE_LAYOUT.PROJECTS_LIST,
    title: 'Projects',
    markerLabel: 'Projects',
    backgroundImageUrl: '/assets/book/book-page-background-left.png',
    config: { projectsSide: 'left' },
  },
  {
    id: 'projects-right',
    layout: PAGE_LAYOUT.PROJECTS_LIST,
    backgroundImageUrl: '/assets/book/book-page-background-right.png',
    config: { projectsSide: 'right' },
  },
  {
    id: 'map-left',
    layout: PAGE_LAYOUT.MAP,
    title: 'Map',
    markerLabel: 'Map',
    backgroundImageUrl: '/assets/book/map-left.png',
    config: { mapSide: 'left' },
  },
  {
    id: 'map-right',
    layout: PAGE_LAYOUT.MAP,
    backgroundImageUrl: '/assets/book/map-right.png',
    config: {
      mapSide: 'right',
      buttonLabel: 'See Map',
      buttonImageUrl: '/assets/book/see-map-button.png',
    },
  },
]
