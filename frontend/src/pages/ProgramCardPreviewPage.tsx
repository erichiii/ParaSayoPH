import { ProgramCard } from '../components/programs/ProgramCard'
import { SectionContainer } from '../components/ui/SectionContainer'
import { localDemoPrograms } from '../data/mockPrograms'

const [completeProgram, unknownStatusProgram, missingProviderProgram] = localDemoPrograms

const previewCases = [
  {
    label: 'Complete opportunity variant',
    program: completeProgram,
    variant: 'opportunity' as const,
  },
  {
    label: 'Complete program variant',
    program: completeProgram,
    variant: 'program' as const,
  },
  {
    label: 'Unknown status and no deadline',
    program: unknownStatusProgram,
    variant: 'program' as const,
  },
  {
    label: 'Missing provider and unknown coverage',
    program: missingProviderProgram,
    variant: 'program' as const,
  },
]

export function ProgramCardPreviewPage() {
  return (
    <main className="min-h-screen bg-[var(--color-surface-canvas)] py-12">
      <SectionContainer className="grid gap-8">
        <header className="grid gap-2">
          <p className="text-sm font-semibold text-[var(--color-brand-blue-500)]">Development preview</p>
          <h1 className="text-3xl font-bold text-[var(--color-ink-900)]">Program card variants</h1>
          <p className="max-w-2xl text-[var(--color-ink-700)]">
            Local fixture states for EXP-01 review only. This route is not available in production.
          </p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {previewCases.map((preview) => (
            <section key={preview.label} className="grid gap-3" aria-labelledby={`${preview.label}-heading`}>
              <h2
                id={`${preview.label}-heading`}
                className="text-lg font-semibold text-[var(--color-ink-900)]"
              >
                {preview.label}
              </h2>
              <ProgramCard program={preview.program} variant={preview.variant} />
            </section>
          ))}
        </div>
      </SectionContainer>
    </main>
  )
}
