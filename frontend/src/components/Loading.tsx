export function Loading({ label = 'Loading ReadMark OS…' }: { label?: string }) {
  return <div className="loading-state"><span className="spinner" /> {label}</div>
}
