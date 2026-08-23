type PlaceholderPageProps = {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <main className="min-h-screen bg-white p-6 text-slate-900">
      <h1>{title}</h1>
    </main>
  )
}
