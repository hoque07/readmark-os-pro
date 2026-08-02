import { AlertTriangle, RefreshCw } from 'lucide-react'

export function ErrorNotice({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="error-notice">
      <AlertTriangle size={20} />
      <div><strong>Something needs attention</strong><p>{message}</p></div>
      {retry && <button className="button button-ghost button-small" onClick={retry}><RefreshCw size={15} /> Retry</button>}
    </div>
  )
}
