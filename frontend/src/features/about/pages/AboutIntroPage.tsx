import { useCallback } from 'react'

import type { AboutSocialLink } from '../types'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { loadProfile } from '../../../shared/data/loadContent'
import { assetUrl } from '../../../shared/utils/assetUrl'
import { renderInlineBold } from '../../../shared/utils/renderInlineBold'
import PageError from '../../../shared/components/PageError'
import PageLoading from '../../../shared/components/PageLoading'
import '../about.css'

interface AboutIntroPageProps {
  title?: string | null
}

const SOCIAL_FALLBACK_LABEL: Record<AboutSocialLink['id'], string> = {
  github: 'GH',
  linkedin: 'in',
  gmail: '@',
}

function AboutSocialLinkItem({ link }: { link: AboutSocialLink }) {
  return (
    <a
      className={`about-intro-social-link about-intro-social-link--${link.id}`}
      href={link.url}
      target="_blank"
      rel="noreferrer"
      aria-label={link.label}
      title={link.label}
    >
      <svg className="about-intro-social-link-ring" viewBox="0 0 44 44" aria-hidden="true">
        <path
          className="about-intro-social-link-ring-arc about-intro-social-link-ring-arc--ccw"
          d="M 2 22 A 20 20 0 0 1 40.54 14.51"
          pathLength="100"
        />
        <path
          className="about-intro-social-link-ring-arc"
          d="M 2 22 A 20 20 0 0 0 40.54 29.49"
          pathLength="100"
        />
      </svg>
      {link.iconUrl ? (
        <img className="about-intro-social-link-image" src={assetUrl(link.iconUrl)} alt="" />
      ) : (
        <span className="about-intro-social-link-fallback">{SOCIAL_FALLBACK_LABEL[link.id]}</span>
      )}
    </a>
  )
}

export default function AboutIntroPage({ title }: AboutIntroPageProps) {
  const load = useCallback(() => loadProfile(), [])
  const { data, status, errorMessage } = useAsyncData(load)

  if (status === 'loading') {
    return <PageLoading />
  }

  if (status === 'error' || !data) {
    return <PageError message={errorMessage || 'Failed to load profile.'} />
  }

  return (
    <div className="about-intro">
      <div className="about-intro-horizontal">
        <div className="about-intro-content">
          <div className="book-page-title">{title || 'About Me'}</div>
          {data.paragraph ? (
            <p className="about-intro-paragraph">{renderInlineBold(data.paragraph)}</p>
          ) : null}
        </div>
        <div className={`about-intro-photo${data.photoUrl ? '' : ' about-intro-photo--empty'}`}>
          {data.photoUrl ? (
            <div
              className="about-intro-photo-image"
              style={{ backgroundImage: `url(${assetUrl(data.photoUrl)})` }}
            />
          ) : null}
        </div>
      </div>
      <div className="about-intro-cv-row">
        {data.socialLinks?.length ? (
          <nav className="about-intro-social" aria-label="Social links">
            {data.socialLinks.map((link) => (
              <AboutSocialLinkItem key={link.id} link={link} />
            ))}
          </nav>
        ) : null}
        {data.cvPhotoUrl ? (
          <div className="about-intro-cv-photo">
            <div className="about-intro-cv-photo-sheet">
              <img className="about-intro-cv-photo-image" src={assetUrl(data.cvPhotoUrl)} alt="CV" />
              <a
                className="about-intro-cv-photo-download"
                href={assetUrl(data.cvDownloadUrl ?? data.cvPhotoUrl)}
                target="_blank"
                rel="noreferrer"
              >
                {data.cvDownloadLabel ?? 'Download CV'}
              </a>
            </div>
          </div>
        ) : null}
      </div>
      {data.interests?.length ? (
        <section className="about-intro-interests" aria-label="Interests">
          <h3 className="skills-section-title">Interests</h3>
          <ul className="about-intro-interests-list">
            {data.interests.map((interest) => (
              <li key={interest.name} className="about-intro-interest">
                <span
                  className={`about-intro-interest-image${interest.iconUrl ? '' : ' about-intro-interest-image--empty'}`}
                  style={
                    interest.iconUrl
                      ? { backgroundImage: `url(${assetUrl(interest.iconUrl)})` }
                      : undefined
                  }
                  aria-hidden="true"
                />
                <span className="about-intro-interest-label">{interest.name}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
