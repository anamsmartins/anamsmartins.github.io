export interface JobEntry {
  role: string
  company: string
  period: string
  description: string
  iconUrl?: string | null
}

export interface ExperienceListData {
  jobs?: JobEntry[]
}
