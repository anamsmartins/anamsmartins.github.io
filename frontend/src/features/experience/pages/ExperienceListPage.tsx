import { useCallback } from 'react'

import PageError from '../../../shared/components/PageError'
import PageLoading from '../../../shared/components/PageLoading'
import { useAsyncData } from '../../../shared/hooks/useAsyncData'
import { sortByPeriodDesc } from '../../../shared/utils/date'
import { loadJobs } from '../../../shared/data/loadContent'
import { assetUrl } from '../../../shared/utils/assetUrl'
import '../experience.css'

interface ExperienceListPageProps {
  title?: string | null
}

export default function ExperienceListPage({ title }: ExperienceListPageProps) {
  const load = useCallback(() => loadJobs(), [])
  const { data: jobs, status, errorMessage } = useAsyncData(load)

  if (status === 'loading') {
    return <PageLoading />
  }

  if (status === 'error') {
    return <PageError message={errorMessage} />
  }

  const sortedJobs = sortByPeriodDesc(jobs ?? [])

  return (
    <div className="experience-list">
      {title && <div className="book-page-title">{title}</div>}
      {sortedJobs.map((job, index) => (
        <div className="experience-item" key={`${job.company}-${index}`}>
          <div className="experience-item-rail">
            <div
              className={`experience-item-image${job.iconUrl ? '' : ' experience-item-image--empty'}`}
              style={job.iconUrl ? { backgroundImage: `url(${assetUrl(job.iconUrl)})` } : undefined}
            />
          </div>
          <div className="experience-item-body">
            <div className="experience-item-meta">
              <h3 className="experience-item-role">{job.role}</h3>
              <span className="experience-item-period">{job.period}</span>
            </div>
            <span className="experience-item-company">{job.company}</span>
            <p className="experience-item-description">{job.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
