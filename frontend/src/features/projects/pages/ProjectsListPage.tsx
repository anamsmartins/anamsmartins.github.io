import type { ProjectCategory } from '../types'
import PageError from '../../../shared/components/PageError'
import PageLoading from '../../../shared/components/PageLoading'
import { ALL_CATEGORY_ID, useProjectsSelection } from '../context/ProjectsSelectionContext'
import { assetUrl } from '../../../shared/utils/assetUrl'
import '../projects.css'

interface ProjectsListPageProps {
  title?: string | null
}

function categoryShortLabels(
  categoryIds: string[] | undefined,
  categories: ProjectCategory[],
): string {
  if (!categoryIds?.length) return ''
  return categoryIds
    .map((categoryId) => {
      const match = categories.find((category) => category.id === categoryId)
      return match?.shortLabel ?? match?.label ?? categoryId
    })
    .join(' · ')
}

function CategoryLabel({ label }: { label: string }) {
  if (label.includes(' & ')) {
    const [before, after] = label.split(' & ')
    return (
      <span className="projects-category-label">
        {before} &<br />
        {after}
      </span>
    )
  }

  const words = label.split(' ')
  if (words.length > 1 && label.length > 10) {
    return (
      <span className="projects-category-label">
        {words.slice(0, -1).join(' ')}
        <br />
        {words[words.length - 1]}
      </span>
    )
  }

  return <span className="projects-category-label">{label}</span>
}

function CategoryCard({
  category,
  count,
  isSelected,
  onSelect,
}: {
  category: { id: string; label: string }
  count: number
  isSelected: boolean
  onSelect: (categoryId: string) => void
}) {
  return (
    <button
      type="button"
      className={`projects-category-card${isSelected ? ' projects-category-card--selected' : ''}`}
      onClick={() => onSelect(category.id)}
      aria-pressed={isSelected}
    >
      <CategoryLabel label={category.label} />
      <span className="projects-category-count">
        {count} {count === 1 ? 'project' : 'projects'}
      </span>
    </button>
  )
}

export default function ProjectsListPage({ title }: ProjectsListPageProps) {
  const {
    categories,
    intro,
    githubIconUrl,
    selectedCategoryId,
    selectedProjectId,
    filteredProjects,
    setSelectedCategoryId,
    setSelectedProjectId,
    projectCountForCategory,
    status,
    errorMessage,
  } = useProjectsSelection()

  if (status === 'loading') {
    return <PageLoading label="Loading projects…" />
  }

  if (status === 'error') {
    return <PageError message={errorMessage} />
  }

  const browseCategories = [
    {
      id: ALL_CATEGORY_ID,
      label: 'All',
    },
    ...categories,
  ]

  return (
    <div className="projects-archive">
      <header className="projects-archive-header">
        <div className="book-page-title">{title || 'Projects'}</div>
        {intro ? <p className="projects-archive-intro">{intro}</p> : null}
      </header>

      <section className="projects-archive-categories" aria-label="Browse by category">
        <h3 className="projects-archive-section-title">Browse by Category</h3>
        <div className="projects-category-grid">
          <div className="projects-category-row">
            {browseCategories.slice(0, 4).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={projectCountForCategory(category.id)}
                isSelected={selectedCategoryId === category.id}
                onSelect={setSelectedCategoryId}
              />
            ))}
          </div>
          <div className="projects-category-row">
            {browseCategories.slice(4).map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                count={projectCountForCategory(category.id)}
                isSelected={selectedCategoryId === category.id}
                onSelect={setSelectedCategoryId}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="projects-archive-list-section" aria-label="Project list">
        <ul className="projects-archive-list">
          {filteredProjects.map((project) => {
            const isSelected = selectedProjectId === project.id
            return (
              <li
                key={project.id}
                className={isSelected ? 'projects-archive-row--selected' : undefined}
              >
                <button
                  type="button"
                  className="projects-archive-row"
                  onClick={() => setSelectedProjectId(project.id!)}
                >
                  <span className="projects-archive-row-bullet" aria-hidden="true" />
                  <span className="projects-archive-row-name">{project.name}</span>
                  <span className="projects-archive-row-type">
                    {categoryShortLabels(project.categoryIds, categories)}
                  </span>
                </button>
                {project.githubUrl ? (
                  <a
                    className={`projects-archive-row-github${githubIconUrl ? ' projects-archive-row-github--image' : ''}`}
                    href={project.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${project.name} on GitHub`}
                    onClick={(event) => event.stopPropagation()}
                    style={
                      githubIconUrl
                        ? { backgroundImage: `url(${assetUrl(githubIconUrl)})` }
                        : undefined
                    }
                  >
                    {githubIconUrl ? null : '↗'}
                  </a>
                ) : (
                  <span className="projects-archive-row-github projects-archive-row-github--empty" />
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
