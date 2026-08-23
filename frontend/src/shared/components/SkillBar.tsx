interface SkillBarProps {
  label: string
  percent: number
  displayValue?: string
}

export default function SkillBar({ label, percent, displayValue }: SkillBarProps) {
  const clamped = Math.max(0, Math.min(100, percent))

  return (
    <div className="skill-bar">
      <span className="skill-bar-label">{label}</span>
      <div className="skill-bar-track">
        <div className="skill-bar-fill" style={{ width: `${clamped}%` }} />
      </div>
      <span className="skill-bar-value">{displayValue ?? `${clamped}%`}</span>
    </div>
  )
}
