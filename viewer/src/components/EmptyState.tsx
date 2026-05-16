interface Props {
  title: string;
  description: string;
  hint?: string;
}

export function EmptyState({ title, description, hint }: Props) {
  return (
    <div className="card p-8 text-center border-dashed">
      <div className="text-3xl mb-2">📭</div>
      <h3 className="font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">{description}</p>
      {hint && (
        <p className="text-xs text-slate-400 mt-3 max-w-md mx-auto">{hint}</p>
      )}
    </div>
  );
}
