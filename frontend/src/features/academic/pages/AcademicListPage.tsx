import { useCallback } from 'react'

import PageError from '../../../shared/components/PageError'
import PageLoading from '../../../shared/components/PageLoading'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { sortByPeriodDesc } from '../../../shared/utils/date'
import { loadAcademics } from '../../../shared/data/loadContent'
import { assetUrl } from '../../../shared/utils/assetUrl'
import '../academic.css'

interface AcademicListPageProps {
  title?: string | null
}

function HonorText({ text }: { text: string }) {
  const parts = text.split(/(\d{4}|\d+\s*\/\s*\d+)/g)

  return (
    <>
      {parts.map((part, index) =>
        /^\d{4}$/.test(part) || /^\d+\s*\/\s*\d+$/.test(part) ? (
          <span key={index} className="academic-honor-num">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  )
}

export default function AcademicListPage({ title }: AcademicListPageProps) {
  const load = useCallback(() => loadAcademics(), [])
  const { data, status, errorMessage } = useAsyncData(load)

  if (status === 'loading') {
    return <PageLoading />
  }

  if (status === 'error') {
    return <PageError message={errorMessage} />
  }

  const sortedAcademics = sortByPeriodDesc(data?.academics ?? [])
  const honors = data?.honors ?? []

  return (
    <div className="academic-list">
      {title && <div className="book-page-title">{title}</div>}
      <div className="academic-timeline">
        {sortedAcademics.map((academic, index) => (
          <div className="academic-item" key={`${academic.degree}-${index}`}>
            <div className="academic-item-rail">
              <div
                className={`academic-item-image${academic.iconUrl ? '' : ' academic-item-image--empty'}`}
                style={
                  academic.iconUrl ? { backgroundImage: `url(${assetUrl(academic.iconUrl)})` } : undefined
                }
              />
            </div>
            <div className="academic-item-body">
              <div className="academic-item-meta">
                <h3 className="academic-item-degree">{academic.degree}</h3>
                <span className="academic-item-period">{academic.period}</span>
              </div>
              <div className="academic-item-submeta">
                <span className="academic-item-institution">{academic.institution}</span>
                {academic.grade != null ? (
                  <span className="academic-item-grade">{academic.grade}/20</span>
                ) : null}
              </div>
              <p className="academic-item-description">{academic.description}</p>
            </div>
          </div>
        ))}
      </div>
      {honors.length > 0 && (
        <section className="academic-honors">
          <h3 className="academic-section-title">Honor awards</h3>
          <ul className="academic-honors-list">
            {honors.map((honor, index) => (
              <li key={`${honor.title}-${index}`}>
                <h4 className="academic-honor-title">
                  {honor.url ? (
                    <a href={honor.url} target="_blank" rel="noopener noreferrer">
                      <HonorText text={honor.title} />
                    </a>
                  ) : (
                    <HonorText text={honor.title} />
                  )}
                </h4>
                <span className="academic-honor-institution">{honor.institution}</span>
                <p className="academic-honor-description">
                  <HonorText text={honor.description} />
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
