interface PageLoadingProps {
  label?: string
}

export default function PageLoading({ label = 'Loading…' }: PageLoadingProps) {
  return (
    <div className="page-loading">
      <p>{label}</p>
    </div>
  )
}
