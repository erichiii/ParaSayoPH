import { localDemoPrograms } from '../data/mockPrograms'
import type { Program } from './types'

export async function getPrograms(): Promise<Program[]> {
  return [...localDemoPrograms]
}

export async function getProgramById(id: string): Promise<Program | null> {
  return localDemoPrograms.find((program) => program.id === id) ?? null
}
