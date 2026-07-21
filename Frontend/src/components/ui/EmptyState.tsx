interface EmptyStateProps {
  title: string
  description: string
}

/** Placeholder body used by pages whose features are not implemented yet. */
export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="max-w-md text-sm text-slate-500">{description}</p>
    </div>
  )
}
