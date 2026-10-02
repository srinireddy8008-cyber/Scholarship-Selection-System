// Exact 0/1 knapsack with a space-optimized value array.
//
// best[w]  = maximum priority achievable with budget w (1D array, O(W) space).
// taken[]  = one byte per (student, budget) pair, set when including the student
//            strictly improved best[w]. This is the same fact as
//            dp[i][w] !== dp[i-1][w] in the 2D formulation, so reconstruction
//            is identical: walk students from last to first, and if taken,
//            subtract the amount from the remaining budget.
//
// Time: O(n x W).
// Space: O(W) for values, plus n x (W + 1) bytes of decision flags for reconstruction.
// Tie-break: a student is skipped unless including them is strictly better.
//
// trace=true also keeps a copy of best[] after each student (used only for the
// detailed DP table when the budget is small). It does not change the result.
export const DETAIL_MAX_BUDGET = 60;

export function solveKnapsack(students, budget, { trace = false } = {}) {
  const n = students.length;
  const width = budget + 1;
  const best = new Float64Array(width);
  const taken = new Uint8Array(n * width);
  const rows = trace ? [Array.from(best)] : null;

  for (let i = 0; i < n; i++) {
    const { amount, priority } = students[i];
    // Descending w so best[w - amount] still holds the previous student's row.
    for (let w = budget; w >= amount; w--) {
      const withStudent = best[w - amount] + priority;
      if (withStudent > best[w]) {
        best[w] = withStudent;
        taken[i * width + w] = 1;
      }
    }
    if (trace) rows.push(Array.from(best));
  }

  const path = [];
  const selected = [];
  let w = budget;
  for (let i = n - 1; i >= 0; i--) {
    const isTaken = taken[i * width + w] === 1;
    path.push({ i: i + 1, w, taken: isTaken });
    if (isTaken) {
      selected.push(students[i]);
      w -= students[i].amount;
    }
  }
  selected.reverse();

  const totalAllocated = selected.reduce((s, x) => s + x.amount, 0);
  return {
    maxPriority: best[budget], best, rows, path, selected,
    totalAllocated, remaining: budget - totalAllocated, budget,
  };
}
