import type { AboutIntroData, SkillsData } from '../../features/about/types'
import type { AcademicListData } from '../../features/academic/types'
import type { JobEntry } from '../../features/experience/types'
import type { ProjectCategory, ProjectEntry, ProjectsPageSettings } from '../../features/projects/types'

function contentUrl(path: string): string {
  const normalized = path.replace(/^\//, '')
  return `${import.meta.env.BASE_URL}${normalized}`
}

export async function loadJson<T>(path: string): Promise<T> {
  const res = await fetch(contentUrl(path))
  if (!res.ok) {
    throw new Error(`Failed to load ${path} (${res.status})`)
  }
  return res.json() as Promise<T>
}

export function loadProfile(): Promise<AboutIntroData> {
  return loadJson<AboutIntroData>('/data/profile.json')
}

export function loadSkills(): Promise<SkillsData> {
  return loadJson<SkillsData>('/data/skills.json')
}

export function loadJobs(): Promise<JobEntry[]> {
  return loadJson<JobEntry[]>('/data/jobs.json')
}

export function loadAcademics(): Promise<AcademicListData> {
  return loadJson<AcademicListData>('/data/academics.json')
}

export interface ProjectsData {
  settings: ProjectsPageSettings
  categories: ProjectCategory[]
  projects: ProjectEntry[]
}

export function loadProjectsData(): Promise<ProjectsData> {
  return loadJson<ProjectsData>('/data/projects.json')
}

export function loadVisitedCountries(): Promise<string[]> {
  return loadJson<{ visitedCountries: string[] }>('/data/visited-countries.json').then(
    (data) => data.visitedCountries ?? [],
  )
}
