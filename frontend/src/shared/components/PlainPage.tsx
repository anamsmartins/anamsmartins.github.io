interface PlainPageProps {
  pageNumber: number
  title?: string | null
  content?: string | null
  imageUrl?: string | null
}

export default function PlainPage({ pageNumber, title, content, imageUrl }: PlainPageProps) {
  return (
    <>
      <h2>{title || `Page ${pageNumber}`}</h2>
      <div
        className={`page-image${imageUrl ? '' : ' page-image--empty'}`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      />
      <div className="page-text">{content}</div>
      <div className="page-footer">{pageNumber}</div>
    </>
  )
}
