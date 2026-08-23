import { useCallback } from 'react'

import SkillBar from '../../../shared/components/SkillBar'
import PageError from '../../../shared/components/PageError'
import PageLoading from '../../../shared/components/PageLoading'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { loadProfile, loadSkills } from '../../../shared/data/loadContent'
import type { ProfessionalSkill, SkillsData, SpokenLanguage, TechnicalSkillGroup } from '../types'
import { assetUrl } from '../../../shared/utils/assetUrl'
import '../about.css'

const SPOKEN_LEVEL_PERCENT: Record<string, number> = {
  A1: 15,
  A2: 30,
  B1: 50,
  B2: 65,
  C1: 80,
  C2: 92,
  NATIVE: 100,
}

function spokenLevelToPercent(level: string): number {
  return SPOKEN_LEVEL_PERCENT[level.trim().toUpperCase()] ?? 50
}

function groupHasSkills(group: TechnicalSkillGroup): boolean {
  if (group.subgroups?.some((subgroup) => subgroup.skills.length > 0)) return true
  return (group.skills?.length ?? 0) > 0
}

function SkillGroupItems({ group }: { group: TechnicalSkillGroup }) {
  const subgroups = (group.subgroups ?? []).filter((subgroup) => subgroup.skills.length > 0)

  if (subgroups.length > 0) {
    return (
      <span>
        {subgroups.map((subgroup, index) => (
          <span key={subgroup.group}>
            {index > 0 && <span className="skills-subgroup-sep" aria-hidden="true"> | </span>}
            {subgroup.skills.join(', ')}
          </span>
        ))}
      </span>
    )
  }

  return <span>{(group.skills ?? []).join(', ')}</span>
}

function SkillTagList({ skills }: { skills: ProfessionalSkill[] }) {
  if (skills.length === 0) return null

  return (
    <ul className="skills-tag-list">
      {skills.map((skill) => (
        <li key={skill.name} className="skills-tag">
          <span
            className={`skills-tag-icon${skill.iconUrl ? '' : ' skills-tag-icon--empty'}`}
            style={
              skill.iconUrl
                ? { ['--skill-icon' as string]: `url("${assetUrl(skill.iconUrl)}")` }
                : undefined
            }
            aria-hidden="true"
          />
          <span className="skills-tag-label">{skill.name}</span>
        </li>
      ))}
    </ul>
  )
}

function SketchCheck() {
  return (
    <svg
      className="skills-check"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M7.2 12.6 L10.5 15.7 L16.8 8.6" />
    </svg>
  )
}

export default function AboutSkillsPage() {
  const load = useCallback(async () => {
    const [profile, skills] = await Promise.all([loadProfile(), loadSkills()])
    return { spokenLanguages: profile.spokenLanguages ?? [], skills }
  }, [])
  const { data, status, errorMessage } = useAsyncData(load)

  if (status === 'loading') {
    return <PageLoading />
  }

  if (status === 'error') {
    return <PageError message={errorMessage} />
  }

  const spokenLanguages: SpokenLanguage[] = data?.spokenLanguages ?? []
  const skills: SkillsData = data?.skills ?? { technical: [], professional: [] }
  const technicalGroups = skills.technical.filter(groupHasSkills)

  const sortedLanguages = spokenLanguages
    .slice()
    .sort((a, b) => spokenLevelToPercent(b.level) - spokenLevelToPercent(a.level))

  return (
    <div className="about-skills">
      {sortedLanguages.length > 0 && (
        <section className="skills-section skills-section--languages">
          <h3 className="skills-section-title">Languages</h3>

          {sortedLanguages.map((lang) => (
            <SkillBar
              key={lang.name}
              label={lang.name}
              percent={spokenLevelToPercent(lang.level)}
              displayValue={lang.level}
            />
          ))}
        </section>
      )}

      {technicalGroups.length > 0 && (
        <section className="skills-section">
          <h3 className="skills-section-title">Technical Skills</h3>
          <ul className="skills-feature-list">
            {technicalGroups.map((group) => (
              <li key={group.group}>
                <SketchCheck />
                <span>
                  <strong>{group.group}:</strong> <SkillGroupItems group={group} />
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {skills.professional.length > 0 && (
        <section className="skills-section">
          <h3 className="skills-section-title">Professional Skills</h3>
          <SkillTagList skills={skills.professional} />
        </section>
      )}
    </div>
  )
}
