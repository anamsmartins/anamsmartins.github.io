import type { ProjectEntry, ProjectImage } from '../types'

export function getProjectImages(project: ProjectEntry): ProjectImage[] {
  if (project.images?.length) return project.images
  if (project.imageUrl) return [{ url: project.imageUrl, legend: '' }]
  return []
}

function findImageLegend(project: ProjectEntry, url: string | null | undefined): string {
  if (!url) return ''
  return project.images?.find((image) => image.url === url)?.legend ?? ''
}

export function getProjectThumbnail(project: ProjectEntry): string | null {
  if (project.imageUrl) return project.imageUrl
  return getProjectImages(project)[0]?.url ?? null
}

export function getProjectThumbnailLegend(project: ProjectEntry): string {
  const thumbnailUrl = getProjectThumbnail(project)
  return findImageLegend(project, thumbnailUrl)
}

export function getProjectThumbnailIndex(project: ProjectEntry): number {
  const thumbnailUrl = getProjectThumbnail(project)
  if (!thumbnailUrl) return 0

  const images = getProjectImages(project)
  const index = images.findIndex((image) => image.url === thumbnailUrl)
  return index >= 0 ? index : 0
}
