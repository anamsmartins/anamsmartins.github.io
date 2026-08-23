export interface AcademicEntry {
  degree: string
  institution: string
  period: string
  grade?: number | null
  description: string
  iconUrl?: string | null
}

export interface AcademicHonor {
  title: string
  institution: string
  description: string
  url?: string | null
}

export interface AcademicListData {
  academics?: AcademicEntry[]
  honors?: AcademicHonor[]
}
