export interface AboutSocialLink {
  id: 'github' | 'linkedin' | 'gmail'
  url: string
  iconUrl?: string | null
  label: string
}

export interface AboutIntroData {
  name?: string
  title?: string
  photoUrl?: string | null
  cvPhotoUrl?: string | null
  cvDownloadUrl?: string | null
  cvDownloadLabel?: string
  paragraph?: string
  socialLinks?: AboutSocialLink[]
  interests?: AboutInterest[]
  spokenLanguages?: SpokenLanguage[]
}

export interface AboutInterest {
  name: string
  iconUrl?: string | null
}

export interface SpokenLanguage {
  name: string
  level: string
}

export interface TechnicalSkillSubgroup {
  group: string
  skills: string[]
}

export interface TechnicalSkillGroup {
  group: string
  skills?: string[]
  subgroups?: TechnicalSkillSubgroup[]
}

export interface ProfessionalSkill {
  name: string
  iconUrl?: string | null
}

export interface SkillsData {
  technical: TechnicalSkillGroup[]
  professional: ProfessionalSkill[]
}
