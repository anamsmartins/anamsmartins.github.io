import React from 'react'

import AboutIntroPage from '../features/about/pages/AboutIntroPage'
import AboutSkillsPage from '../features/about/pages/AboutSkillsPage'
import AcademicListPage from '../features/academic/pages/AcademicListPage'
import ExperienceListPage from '../features/experience/pages/ExperienceListPage'
import MapPage from '../features/map/pages/MapPage'
import type { MapData } from '../features/map/types'
import ProjectsDetailPage from '../features/projects/pages/ProjectsDetailPage'
import ProjectsListPage from '../features/projects/pages/ProjectsListPage'
import type { ProjectsListData } from '../features/projects/types'
import PlainPage from '../shared/components/PlainPage'
import { PAGE_LAYOUT, type BookPageConfig } from '../shared/types/layouts'
import { assetUrl } from '../shared/utils/assetUrl'
import '../shared/styles/page-shell.css'

interface PageRendererProps {
  page: BookPageConfig
  pageIndex: number
}

function renderLayoutContent(page: BookPageConfig, pageIndex: number) {
  switch (page.layout) {
    case PAGE_LAYOUT.ABOUT_INTRO:
      return <AboutIntroPage title={page.title} />
    case PAGE_LAYOUT.ABOUT_SKILLS:
      return <AboutSkillsPage />
    case PAGE_LAYOUT.EXPERIENCE_LIST:
      return <ExperienceListPage title={page.title} />
    case PAGE_LAYOUT.ACADEMIC_LIST:
      return <AcademicListPage title={page.title} />
    case PAGE_LAYOUT.PROJECTS_LIST: {
      const projectsConfig = page.config as Pick<ProjectsListData, 'projectsSide'> | undefined
      if (projectsConfig?.projectsSide === 'right') {
        return <ProjectsDetailPage />
      }
      return <ProjectsListPage title={page.title} />
    }
    case PAGE_LAYOUT.MAP:
      return <MapPage title={page.title} data={(page.config ?? {}) as MapData} />
    default:
      return (
        <PlainPage
          pageNumber={pageIndex}
          title={page.title ?? null}
          content={null}
          imageUrl={null}
        />
      )
  }
}

function getBackgroundStyle(page: BookPageConfig): React.CSSProperties | undefined {
  if (!page.backgroundImageUrl) return undefined

  return {
    backgroundImage: `url(${assetUrl(page.backgroundImageUrl)})`,
    backgroundSize: '100% 100%',
  }
}

const PageRenderer = React.forwardRef<HTMLDivElement, PageRendererProps>(
  ({ page, pageIndex }, ref) => {
    const backgroundStyle = getBackgroundStyle(page)

    return (
      <div className="page" ref={ref}>
        {backgroundStyle && <div className="page-background" style={backgroundStyle} />}
        <div className="page-content">{renderLayoutContent(page, pageIndex)}</div>
      </div>
    )
  },
)

PageRenderer.displayName = 'PageRenderer'

export default PageRenderer
