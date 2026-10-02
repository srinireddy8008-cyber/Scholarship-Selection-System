export const MAX_BUDGET = 5000000;
export const MAX_FLAGS = 50000000; // students x (budget + 1) decision bytes kept for reconstruction
const isWhole = (v) => /^\d+$/.test(String(v).trim());

export function validateStudent(draft, students, editingId = null) {
  const e = {};
  const id = String(draft.id ?? '').trim();
  if (!id) e.id = 'ID is required.';
  else if (students.some((s) => s.id === id && s.id !== editingId)) e.id = 'This ID already exists.';
  if (!String(draft.name ?? '').trim()) e.name = 'Name is required.';
  for (const [key, label] of [['amount', 'Scholarship amount'], ['priority', 'Priority score']]) {
    const v = String(draft[key] ?? '').trim();
    if (v === '') e[key] = `${label} is required.`;
    else if (v.startsWith('-')) e[key] = `${label} cannot be negative.`;
    else if (!isWhole(v)) e[key] = `${label} must be a whole number.`;
  }
  return e;
}

export function validateBudget(value) {
  const v = String(value ?? '').trim();
  if (v === '') return 'Enter a budget.';
  if (v.startsWith('-')) return 'Budget cannot be negative.';
  if (!isWhole(v)) return 'Budget must be a whole number.';
  if (Number(v) === 0) return 'Budget must be greater than zero.';
  return null;
}

export function validateRun(students, budgetText) {
  if (students.length === 0) return 'Add at least one student before running.';
  const b = validateBudget(budgetText);
  if (b) return b;
  const budget = Number(budgetText);
  if (budget > MAX_BUDGET) return `Budget is above the supported maximum of ${MAX_BUDGET.toLocaleString('en-IN')}.`;
  if (students.length * (budget + 1) > MAX_FLAGS) return 'Students x budget exceeds the memory limit for reconstruction. Reduce the budget or the number of students.';
  return null;
}
