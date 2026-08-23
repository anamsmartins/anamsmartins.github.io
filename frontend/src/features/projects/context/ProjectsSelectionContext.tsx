import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { loadProjectsData } from '../../../shared/data/loadContent'
import type { ProjectCategory, ProjectEntry, ProjectsListData } from '../types'

const ALL_CATEGORY_ID = 'all'

interface ProjectsSelectionContextValue {
  categories: ProjectCategory[]
  projects: ProjectEntry[]
  githubIconUrl?: string | null
  linkIcons?: ProjectsListData['linkIcons']
  intro?: string
  selectedCategoryId: string
  selectedProjectId: string | null
  selectedProject: ProjectEntry | null
  filteredProjects: ProjectEntry[]
  setSelectedCategoryId: (categoryId: string) => void
  setSelectedProjectId: (projectId: string) => void
  projectCountForCategory: (categoryId: string) => number
  status: 'loading' | 'ready' | 'error'
  errorMessage: string
}

const ProjectsSelectionContext = createContext<ProjectsSelectionContextValue | null>(null)

function getProjectId(project: ProjectEntry, index: number): string {
  return project.id ?? `${project.name}-${index}`
}

function getProjectCategoryIds(project: ProjectEntry): string[] {
  return project.categoryIds ?? []
}

function categorySortIndex(categoryId: string, categories: ProjectCategory[]): number {
  const index = categories.findIndex((category) => category.id === categoryId)
  return index === -1 ? categories.length : index
}

function primaryCategoryIndex(project: ProjectEntry, categories: ProjectCategory[]): number {
  const [primary] = getProjectCategoryIds(project)
  if (!primary) return categories.length
  return categorySortIndex(primary, categories)
}

function projectHasCategory(project: ProjectEntry, categoryId: string): boolean {
  return getProjectCategoryIds(project).includes(categoryId)
}

function sortProjectsByCategoryThenImportance(
  projects: ProjectEntry[],
  categories: ProjectCategory[],
): ProjectEntry[] {
  return [...projects].sort((a, b) => {
    const byCategory = primaryCategoryIndex(a, categories) - primaryCategoryIndex(b, categories)
    if (byCategory !== 0) return byCategory
    return (b.importance ?? 0) - (a.importance ?? 0)
  })
}

export function ProjectsSelectionProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<ProjectCategory[]>([])
  const [projects, setProjects] = useState<ProjectEntry[]>([])
  const [settings, setSettings] = useState<ProjectsListData>({})
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  const [selectedCategoryId, setSelectedCategoryIdState] = useState(ALL_CATEGORY_ID)
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      try {
        const { categories: categoryList, projects: projectList, settings: pageSettings } =
          await loadProjectsData()

        if (cancelled) return

        setCategories(categoryList)
        setProjects(
          projectList.map((project, index) => ({
            ...project,
            id: getProjectId(project, index),
          })),
        )
        setSettings({
          intro: pageSettings.intro,
          githubIconUrl: pageSettings.githubIconUrl,
          linkIcons: pageSettings.linkIcons,
        })
        setStatus('ready')
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to load projects.')
          setStatus('error')
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  const normalizedProjects = useMemo(
    () =>
      sortProjectsByCategoryThenImportance(
        projects.map((project, index) => ({
          ...project,
          id: getProjectId(project, index),
        })),
        categories,
      ),
    [projects, categories],
  )

  const filteredProjects = useMemo(() => {
    if (selectedCategoryId === ALL_CATEGORY_ID) return normalizedProjects
    return normalizedProjects.filter((project) => projectHasCategory(project, selectedCategoryId))
  }, [normalizedProjects, selectedCategoryId])

  const resolvedSelectedProjectId =
    selectedProjectId && filteredProjects.some((project) => project.id === selectedProjectId)
      ? selectedProjectId
      : (filteredProjects[0]?.id ?? null)

  const selectedProject =
    normalizedProjects.find((project) => project.id === resolvedSelectedProjectId) ?? null

  const projectCountForCategory = useCallback(
    (categoryId: string) => {
      if (categoryId === ALL_CATEGORY_ID) return normalizedProjects.length
      return normalizedProjects.filter((project) => projectHasCategory(project, categoryId)).length
    },
    [normalizedProjects],
  )

  const setSelectedCategoryId = useCallback(
    (categoryId: string) => {
      setSelectedCategoryIdState(categoryId)
      const nextProjects =
        categoryId === ALL_CATEGORY_ID
          ? normalizedProjects
          : normalizedProjects.filter((project) => projectHasCategory(project, categoryId))
      setSelectedProjectIdState(nextProjects[0]?.id ?? null)
    },
    [normalizedProjects],
  )

  const setSelectedProjectId = useCallback((projectId: string) => {
    setSelectedProjectIdState(projectId)
  }, [])

  const value = useMemo(
    () => ({
      categories,
      projects: normalizedProjects,
      githubIconUrl: settings.githubIconUrl,
      linkIcons: settings.linkIcons,
      intro: settings.intro,
      selectedCategoryId,
      selectedProjectId: resolvedSelectedProjectId,
      selectedProject,
      filteredProjects,
      setSelectedCategoryId,
      setSelectedProjectId,
      projectCountForCategory,
      status,
      errorMessage,
    }),
    [
      categories,
      normalizedProjects,
      settings.githubIconUrl,
      settings.linkIcons,
      settings.intro,
      selectedCategoryId,
      resolvedSelectedProjectId,
      selectedProject,
      filteredProjects,
      setSelectedCategoryId,
      setSelectedProjectId,
      projectCountForCategory,
      status,
      errorMessage,
    ],
  )

  return (
    <ProjectsSelectionContext.Provider value={value}>{children}</ProjectsSelectionContext.Provider>
  )
}

export function useProjectsSelection() {
  const context = useContext(ProjectsSelectionContext)
  if (!context) {
    throw new Error('useProjectsSelection must be used within ProjectsSelectionProvider')
  }
  return context
}

export { ALL_CATEGORY_ID }
