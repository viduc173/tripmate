import type { CostBreakdown } from './estimate'

export type BudgetScope = 'group' | 'person'

/** Compares like with like: a per-person budget against per-person cost, a group budget against the total. */
export function checkBudget(
  budgetVnd: number,
  scope: BudgetScope,
  party: number,
  b: CostBreakdown,
): { ok: boolean; shortfallVnd: number; perPersonBudget: number } {
  const cost = scope === 'person' ? b.perPerson : b.total
  const shortfallVnd = Math.max(0, cost - budgetVnd)
  const perPersonBudget = scope === 'person' ? budgetVnd : Math.floor(budgetVnd / party)
  return { ok: shortfallVnd === 0, shortfallVnd, perPersonBudget }
}
