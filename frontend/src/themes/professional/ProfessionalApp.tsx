import { useState, useCallback, useEffect, useRef, type ReactNode } from 'react'

import { useAsyncData } from '../../shared/hooks/useAsyncData'
import {
  loadProfile,
  loadSkills,
  loadJobs,
  loadAcademics,
  loadProjectsData,
} from '../../shared/data/loadContent'
import { assetUrl } from '../../shared/utils/assetUrl'
import { renderInlineBold } from '../../shared/utils/renderInlineBold'
import { sortByPeriodDesc } from '../../shared/utils/date'
import type { AboutIntroData } from '../../features/about/types'
import type { ProjectEntry, ProjectCategory } from '../../features/projects/types'
import ProjectMockupLightbox from '../../features/projects/components/ProjectMockupLightbox'
import { renderProjectLinkIcon } from '../../features/projects/components/ProjectLinkIcon'
import {
  getProjectImages,
  getProjectThumbnail,
  getProjectThumbnailIndex,
} from '../../features/projects/utils/projectImages'
import './professional.css'

/* ============================================================
   Scroll-reveal hook — fires once when element enters viewport
   ============================================================ */
function useInView<T extends HTMLElement>(threshold = 0.08) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.unobserve(el)
        }
      },
      { threshold },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])
  return [ref, inView] as const
}

/* Per-item version: each timeline item observes itself */
function AnimatedTimelineItem({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  const [ref, visible] = useInView<HTMLDivElement>(0.05)
  return (
    <div
      ref={ref}
      className={`pro-timeline-item${visible ? ' pro-timeline-item--visible' : ''}`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

/* ============================================================
   Icons — react-bootstrap-icons
   ============================================================ */
import {
  Github,
  Linkedin,
  Envelope,
  Download,
  BoxArrowUpRight,
  XLg,
  CheckCircle,
  People,
  Lightning,
  Lightbulb,
  ChatDots,
  ArrowRepeat,
  Bullseye,
  Star,
  CodeSlash,
  Layers,
  Phone,
  Database,
  Cloud,
  ThreeDots,
  ZoomIn,
  Image,
  type Icon,
} from 'react-bootstrap-icons'

function SocialIcon({ id }: { id: string }) {
  if (id === 'github') return <Github aria-hidden="true" />
  if (id === 'linkedin') return <Linkedin aria-hidden="true" />
  return <Envelope aria-hidden="true" />
}

const SOFT_SKILL_ICON_MAP: Record<string, Icon> = {
  Teamwork: People,
  Motivation: Lightning,
  'Problem Solving': Lightbulb,
  Communication: ChatDots,
  Adaptability: ArrowRepeat,
  Tenacity: Bullseye,
}

const TECH_GROUP_ICON_MAP: Record<string, Icon> = {
  Programming: CodeSlash,
  Frameworks: Layers,
  Mobile: Phone,
  Database: Database,
  Cloud: Cloud,
  Others: ThreeDots,
}

/* ============================================================
   Navigation
   ============================================================ */
const NAV_LINKS = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
]

function ProNav({ name }: { name: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToSection(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`pro-nav${scrolled ? ' pro-nav--scrolled' : ''}`} aria-label="Site navigation">
      <button
        className="pro-nav-logo"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        {name}
      </button>
      <ul className="pro-nav-links" role="list">
        {NAV_LINKS.map((link) => (
          <li key={link.id}>
            <button className="pro-nav-link" onClick={() => scrollToSection(link.id)}>
              {link.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ============================================================
   Hero / About section
   ============================================================ */
function ProHeroSection() {
  const load = useCallback(() => loadProfile(), [])
  const { data, status } = useAsyncData(load)

  if (status === 'loading' || !data) {
    return (
      <section id="about" className="pro-section pro-hero">
        <div className="pro-container pro-hero-inner">
          <div className="pro-skeleton pro-skeleton--hero" />
        </div>
      </section>
    )
  }

  return (
    <section id="about" className="pro-section pro-hero">
      <div className="pro-container pro-hero-inner">
        <div className="pro-hero-content">
          <span className="pro-hero-eyebrow">{data.title ?? 'Software Engineer'}</span>
          <h1 className="pro-hero-name">{data.name ?? 'Portfolio'}</h1>
          {data.paragraph && (
            <p className="pro-hero-bio">{renderInlineBold(data.paragraph)}</p>
          )}

          <div className="pro-hero-actions">
            {data.socialLinks?.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="pro-social-btn"
                aria-label={link.label}
              >
                <SocialIcon id={link.id} />
                <span>{link.label}</span>
              </a>
            ))}
            {data.cvDownloadUrl && (
              <a
                href={assetUrl(data.cvDownloadUrl)}
                target="_blank"
                rel="noreferrer"
                className="pro-cv-btn"
              >
                <Download aria-hidden="true" />
                <span>{data.cvDownloadLabel ?? 'Download CV'}</span>
              </a>
            )}
          </div>

          {data.interests && data.interests.length > 0 && (
            <div className="pro-hero-interests" aria-label="Interests">
              <span className="pro-hero-interests-label">Interests</span>
              {data.interests.map((interest) => (
                <span key={interest.name} className="pro-interest-chip">
                  {interest.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {data.photoUrl && (
          <div className="pro-hero-photo-wrap">
            <div
              className="pro-hero-photo"
              style={{ backgroundImage: `url(${assetUrl(data.photoUrl)})` }}
              role="img"
              aria-label={data.name ?? 'Profile photo'}
            />
          </div>
        )}
      </div>
    </section>
  )
}

/* ============================================================
   Skills section
   ============================================================ */
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

function ProSkillsSection() {
  const load = useCallback(async () => {
    const [profile, skills] = await Promise.all([loadProfile(), loadSkills()])
    return { spokenLanguages: profile.spokenLanguages ?? [], skills }
  }, [])
  const { data, status } = useAsyncData(load)

  if (status === 'loading' || !data) {
    return (
      <section id="skills" className="pro-section pro-section--alt">
        <div className="pro-container">
          <div className="pro-skeleton" />
        </div>
      </section>
    )
  }

  const sortedLanguages = [...data.spokenLanguages].sort(
    (a, b) => spokenLevelToPercent(b.level) - spokenLevelToPercent(a.level),
  )

  const techGroups = data.skills.technical.filter(
    (g) => (g.skills?.length ?? 0) > 0 || g.subgroups?.some((s) => s.skills.length > 0),
  )

  return (
    <section id="skills" className="pro-section pro-section--alt">
      <div className="pro-container">
        <h2 className="pro-section-title">Skills</h2>

        <div className="pro-skills-stack">
          {/* Languages */}
          <div>
            <h3 className="pro-label-heading">Languages</h3>
            <div className="pro-lang-list">
              {sortedLanguages.map((lang) => (
                <div key={lang.name} className="pro-lang-row">
                  <div className="pro-lang-meta">
                    <span className="pro-lang-name">{lang.name}</span>
                    <span className="pro-lang-level">{lang.level}</span>
                  </div>
                  <div className="pro-lang-track">
                    <div
                      className="pro-lang-fill"
                      style={{ width: `${spokenLevelToPercent(lang.level)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Technical skills */}
          <div>
            <h3 className="pro-label-heading">Technical Skills</h3>
            <div className="pro-tech-list">
              {techGroups.map((group) => {
                const items = group.subgroups
                  ? group.subgroups.flatMap((s) => s.skills)
                  : (group.skills ?? [])
                return (
                  <div key={group.group} className="pro-tech-row">
                    <span className="pro-tech-group-name">
                      {(() => { const I = TECH_GROUP_ICON_MAP[group.group]; return I ? <span className="pro-tech-group-icon"><I /></span> : null })()}
                      {group.group}
                    </span>
                    <div className="pro-tech-tags">
                      {items.map((skill) => (
                        <span key={skill} className="pro-tech-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Soft skills — inline SVG icons, no asset files */}
        {data.skills.professional.length > 0 && (
          <div className="pro-soft-skills">
            <h3 className="pro-label-heading">Professional Skills</h3>
            <div className="pro-soft-grid">
              {data.skills.professional.map((skill) => {
                const IconComponent = SOFT_SKILL_ICON_MAP[skill.name] ?? Star
                return (
                  <div key={skill.name} className="pro-soft-item">
                    <span className="pro-soft-icon-wrap">
                      <IconComponent />
                    </span>
                    <span className="pro-soft-label">{skill.name}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ============================================================
   Experience section
   ============================================================ */
function ProExperienceSection() {
  const load = useCallback(() => loadJobs(), [])
  const { data: jobs, status } = useAsyncData(load)

  if (status === 'loading') {
    return (
      <section id="experience" className="pro-section pro-section--alt">
        <div className="pro-container">
          <div className="pro-skeleton" />
        </div>
      </section>
    )
  }

  const sortedJobs = sortByPeriodDesc(jobs ?? [])

  return (
    <section id="experience" className="pro-section pro-section--alt">
      <div className="pro-container">
        <h2 className="pro-section-title">Experience</h2>
        <div className="pro-timeline">
          {sortedJobs.map((job, i) => (
            <AnimatedTimelineItem key={`${job.company}-${i}`} delay={i * 80}>
              <div className="pro-timeline-rail">
                <div className="pro-timeline-dot" />
                <div className="pro-timeline-line" aria-hidden="true" />
              </div>
              <div className="pro-timeline-content">
                <span className="pro-timeline-period">{job.period}</span>
                <div className="pro-timeline-body">
                  <h3 className="pro-timeline-role">{job.role}</h3>
                  <span className="pro-timeline-company">{job.company}</span>
                  <p className="pro-timeline-desc">{job.description}</p>
                </div>
              </div>
            </AnimatedTimelineItem>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   Education section
   ============================================================ */
function ProEducationSection() {
  const load = useCallback(() => loadAcademics(), [])
  const { data, status } = useAsyncData(load)

  if (status === 'loading') {
    return (
      <section id="education" className="pro-section">
        <div className="pro-container">
          <div className="pro-skeleton" />
        </div>
      </section>
    )
  }

  const sortedAcademics = sortByPeriodDesc(data?.academics ?? [])
  const honors = data?.honors ?? []

  return (
    <section id="education" className="pro-section">
      <div className="pro-container">
        <h2 className="pro-section-title">Education</h2>
        <div className="pro-timeline">
          {sortedAcademics.map((academic, i) => (
            <AnimatedTimelineItem key={`${academic.degree}-${i}`} delay={i * 80}>
              <div className="pro-timeline-rail">
                <div className="pro-timeline-dot" />
                <div className="pro-timeline-line" aria-hidden="true" />
              </div>
              <div className="pro-timeline-content">
                <span className="pro-timeline-period">{academic.period}</span>
                <div className="pro-timeline-body">
                  <h3 className="pro-timeline-role">{academic.degree}</h3>
                  <div className="pro-timeline-sub-row">
                    <span className="pro-timeline-company">{academic.institution}</span>
                    {academic.grade != null && (
                      <span className="pro-grade-chip">{academic.grade}/20</span>
                    )}
                  </div>
                  <p className="pro-timeline-desc">{academic.description}</p>
                </div>
              </div>
            </AnimatedTimelineItem>
          ))}
        </div>

        {honors.length > 0 && (
          <div className="pro-honors">
            <h3 className="pro-label-heading">Honors &amp; Awards</h3>
            <div className="pro-honors-list">
              {honors.map((honor, i) => (
                <div key={`${honor.title}-${i}`} className="pro-honor-card">
                  <h4 className="pro-honor-name">
                    {honor.url ? (
                      <a href={honor.url} target="_blank" rel="noopener noreferrer">
                        {honor.title}
                        <BoxArrowUpRight aria-hidden="true" />
                      </a>
                    ) : (
                      honor.title
                    )}
                  </h4>
                  <span className="pro-honor-institution">{honor.institution}</span>
                  <p className="pro-honor-desc">
                    {honor.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/* ============================================================
   Projects section
   ============================================================ */
function sortProjects(projects: ProjectEntry[], categories: ProjectCategory[]): ProjectEntry[] {
  return [...projects].sort((a, b) => {
    const ia = categories.findIndex((c) => c.id === a.categoryIds?.[0])
    const ib = categories.findIndex((c) => c.id === b.categoryIds?.[0])
    if (ia !== ib) return ia - ib
    return (b.importance ?? 0) - (a.importance ?? 0)
  })
}

function ProjectModal({
  project,
  categories,
  onClose,
}: {
  project: ProjectEntry
  categories: ProjectCategory[]
  onClose: () => void
}) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [showCompactTitle, setShowCompactTitle] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const catLabels = (project.categoryIds ?? []).map((id) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.shortLabel ?? cat?.label ?? id
  })
  const thumbnail = getProjectThumbnail(project)
  const projectImages = getProjectImages(project)
  const thumbnailIndex = getProjectThumbnailIndex(project)

  useEffect(() => {
    setGalleryOpen(false)
    setShowCompactTitle(false)
  }, [project.id])

  useEffect(() => {
    const scrollRoot = scrollRef.current
    const titleEl = titleRef.current
    if (!scrollRoot || !titleEl) return

    const observer = new IntersectionObserver(
      ([entry]) => setShowCompactTitle(!entry.isIntersecting),
      { root: scrollRoot, threshold: 0 },
    )

    observer.observe(titleEl)
    return () => observer.disconnect()
  }, [project.id])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  return (
    <div
      className="pro-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.name} details`}
    >
      <div className="pro-modal">
        <div
          className={`pro-modal-topbar${showCompactTitle ? ' pro-modal-topbar--with-title' : ''}`}
        >
          {showCompactTitle ? (
            <h2 className="pro-modal-topbar-name">{project.name}</h2>
          ) : null}
          <button className="pro-modal-close" onClick={onClose} aria-label="Close">
            <XLg aria-hidden="true" />
          </button>
        </div>

        <div ref={scrollRef} className="pro-modal-scroll">
          <div className="pro-modal-header">
            {catLabels.length > 0 && (
              <div className="pro-modal-cats">
                {catLabels.map((label) => (
                  <span key={label} className="pro-cat-badge">
                    {label}
                  </span>
                ))}
              </div>
            )}
            <h2 ref={titleRef} className="pro-modal-name">
              {project.name}
            </h2>
            {(project.techStack?.length ?? 0) > 0 && (
              <p className="pro-modal-tech">{project.techStack?.join(' · ')}</p>
            )}
          </div>

          {thumbnail && projectImages.length > 0 ? (
            <button
              type="button"
              className="pro-modal-image pro-modal-image--interactive"
              style={{ backgroundImage: `url(${assetUrl(thumbnail)})` }}
              onClick={() => setGalleryOpen(true)}
              aria-label={`View ${project.name} screenshots${projectImages.length > 1 ? ` (${projectImages.length} images)` : ''}`}
            >
              <span className="pro-modal-image-hint" aria-hidden="true">
                <ZoomIn />
                <span>
                  {projectImages.length > 1
                    ? `View all ${projectImages.length} screenshots`
                    : 'View full size'}
                </span>
              </span>
            </button>
          ) : thumbnail ? (
            <div
              className="pro-modal-image"
              style={{ backgroundImage: `url(${assetUrl(thumbnail)})` }}
              role="img"
              aria-label={`${project.name} preview`}
            />
          ) : null}

          <div className="pro-modal-body">
            <section className="pro-modal-section">
              <h3>About</h3>
              <p>{project.description}</p>
            </section>

            {(project.features?.length ?? 0) > 0 && (
              <section className="pro-modal-section">
                <h3>Key Features</h3>
                <ul className="pro-modal-features">
                  {project.features!.map((feature) => (
                    <li key={feature}>
                      <CheckCircle aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.impact && (
              <section className="pro-modal-section">
                <h3>Impact</h3>
                <p>{project.impact}</p>
              </section>
            )}
          </div>
        </div>

        {((project.links?.length ?? 0) > 0 || project.githubUrl) && (
          <div className="pro-modal-footer">
            <div className="pro-modal-links">
              {project.links?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="pro-modal-link"
                >
                  {renderProjectLinkIcon(link.type) ?? (
                    <BoxArrowUpRight aria-hidden="true" />
                  )}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {galleryOpen && projectImages.length > 0 ? (
        <ProjectMockupLightbox
          variant="professional"
          images={projectImages}
          alt={project.name}
          initialIndex={thumbnailIndex}
          onClose={() => setGalleryOpen(false)}
        />
      ) : null}
    </div>
  )
}

function ProjectCard({
  project,
  categories,
  onClick,
}: {
  project: ProjectEntry
  categories: ProjectCategory[]
  onClick: () => void
}) {
  const catLabels = (project.categoryIds ?? []).map((id) => {
    const cat = categories.find((c) => c.id === id)
    return cat?.shortLabel ?? cat?.label ?? id
  })
  const techPreview = (project.techStack ?? []).slice(0, 3)
  const extra = (project.techStack?.length ?? 0) - techPreview.length
  const desc =
    project.description.length > 110
      ? project.description.slice(0, 110).replace(/\s\S*$/, '') + '…'
      : project.description
  const thumbnail = getProjectThumbnail(project)
  const thumbnailUrl = thumbnail ? assetUrl(thumbnail) : null

  return (
    <button className="pro-project-card" onClick={onClick} type="button">
      <div
        className={`pro-project-card-media${thumbnailUrl ? '' : ' pro-project-card-media--empty'}`}
      >
        {thumbnailUrl ? (
          <img
            className="pro-project-card-img"
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <Image aria-hidden="true" className="pro-project-card-placeholder-icon" />
        )}
      </div>
      <div className="pro-project-card-body">
        {catLabels.length > 0 && (
          <div className="pro-project-card-cats" aria-hidden="true">
            {catLabels.map((label) => (
              <span key={label} className="pro-cat-badge">
                {label}
              </span>
            ))}
          </div>
        )}
        <h3 className="pro-project-name">{project.name}</h3>
        <p className="pro-project-desc">{desc}</p>
        {techPreview.length > 0 && (
          <div className="pro-project-tech">
            {techPreview.map((t) => (
              <span key={t} className="pro-tech-chip">
                {t}
              </span>
            ))}
            {extra > 0 && <span className="pro-tech-chip pro-tech-chip--more">+{extra}</span>}
          </div>
        )}
      </div>
    </button>
  )
}

function ProProjectsSection() {
  const load = useCallback(() => loadProjectsData(), [])
  const { data, status } = useAsyncData(load)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProject, setSelectedProject] = useState<ProjectEntry | null>(null)

  if (status === 'loading' || !data) {
    return (
      <section id="projects" className="pro-section">
        <div className="pro-container">
          <div className="pro-skeleton" />
        </div>
      </section>
    )
  }

  const { categories, projects, settings } = data
  const filterOptions = [{ id: 'all', label: 'All' }, ...categories]

  const sorted = sortProjects(
    projects.map((p, i) => ({ ...p, id: p.id ?? `${p.name}-${i}` })),
    categories,
  )

  const filtered =
    selectedCategory === 'all'
      ? sorted
      : sorted.filter((p) => p.categoryIds?.includes(selectedCategory))

  return (
    <section id="projects" className="pro-section">
      <div className="pro-container">
        <h2 className="pro-section-title">Projects</h2>
        {settings.intro && <p className="pro-projects-intro">{settings.intro}</p>}

        <div className="pro-cat-filters" role="group" aria-label="Filter by category">
          {filterOptions.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`pro-cat-filter${selectedCategory === cat.id ? ' pro-cat-filter--active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="pro-projects-grid">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              categories={categories}
              onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          categories={categories}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  )
}

/* ============================================================
   Footer
   ============================================================ */
function ProFooter({
  name,
  socialLinks,
}: {
  name: string
  socialLinks?: AboutIntroData['socialLinks']
}) {
  return (
    <footer className="pro-footer">
      <div className="pro-container pro-footer-inner">
        <span className="pro-footer-name">{name}</span>
        {socialLinks && socialLinks.length > 0 && (
          <nav className="pro-footer-socials" aria-label="Social links">
            {socialLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="pro-footer-social"
                aria-label={link.label}
                title={link.label}
              >
                <SocialIcon id={link.id} />
              </a>
            ))}
          </nav>
        )}
      </div>
    </footer>
  )
}

/* ============================================================
   Root
   ============================================================ */
export default function ProfessionalApp() {
  const load = useCallback(() => loadProfile(), [])
  const { data: profile } = useAsyncData(load)
  const name = profile?.name ?? 'Ana Martins'

  return (
    <div className="pro-app">
      <ProNav name={name} />
      <main className="pro-main">
        <ProHeroSection />
        <ProExperienceSection />
        <ProEducationSection />
        <ProSkillsSection />
        <ProProjectsSection />
      </main>
      <ProFooter name={name} socialLinks={profile?.socialLinks} />
    </div>
  )
}
