interface PageErrorProps {
  message: string
}

export default function PageError({ message }: PageErrorProps) {
  return (
    <div className="page-error">
      <p>{message}</p>
    </div>
  )
}
