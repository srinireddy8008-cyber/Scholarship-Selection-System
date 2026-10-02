import { solveKnapsack } from './knapsack.js';
import { validateStudent, validateBudget } from './validation.js';
import assert from 'node:assert';

function brute(students, budget) {
  let best = 0;
  for (let m = 0; m < 1 << students.length; m++) {
    let a = 0, p = 0;
    students.forEach((s, k) => { if (m & (1 << k)) { a += s.amount; p += s.priority; } });
    if (a <= budget) best = Math.max(best, p);
  }
  return best;
}
const mk = (a, p) => a.map((x, i) => ({ id: 'S' + i, name: 'n', amount: x, priority: p[i] }));

let r = solveKnapsack(mk([3, 4, 5], [4, 5, 6]), 8);
assert.equal(r.maxPriority, 10);
assert.deepEqual(r.selected.map((s) => s.amount), [3, 5]);

for (let t = 0; t < 300; t++) {
  const n = 1 + Math.floor(Math.random() * 8), W = 1 + Math.floor(Math.random() * 20);
  const s = mk(Array.from({ length: n }, () => Math.floor(Math.random() * 12)), Array.from({ length: n }, () => Math.floor(Math.random() * 15)));
  const x = solveKnapsack(s, W);
  assert.equal(x.maxPriority, brute(s, W));
  assert.ok(x.totalAllocated <= W);
  assert.equal(x.totalAllocated + x.remaining, W);
  assert.equal(x.selected.reduce((a, b) => a + b.priority, 0), x.maxPriority);
}
assert.equal(solveKnapsack(mk([9, 10], [5, 6]), 4).selected.length, 0);
assert.equal(solveKnapsack(mk([3, 5], [1, 1]), 8).remaining, 0);
assert.ok(validateBudget('0')); assert.ok(validateBudget('')); assert.ok(validateBudget('2.5'));
assert.ok(validateStudent({ id: 'S0', name: 'x', amount: '1', priority: '1' }, mk([1], [1])).id);
assert.ok(validateStudent({ id: 'A', name: 'x', amount: '-1', priority: 'a' }, []).amount);
console.log('All tests passed');

// ---- Scalability and edge cases ----
function ref2D(students, W) {
  const dp = Array.from({ length: students.length + 1 }, () => new Array(W + 1).fill(0));
  students.forEach((s, k) => { const i = k + 1; for (let w = 0; w <= W; w++) dp[i][w] = s.amount > w ? dp[i - 1][w] : Math.max(dp[i - 1][w], dp[i - 1][w - s.amount] + s.priority); });
  return dp;
}
function check(students, W, trace = false) {
  const x = solveKnapsack(students, W, { trace });
  assert.equal(x.maxPriority, brute(students, W), `W=${W}`);
  assert.equal(x.maxPriority, ref2D(students, W)[students.length][W]);
  assert.equal(x.selected.reduce((a, b) => a + b.priority, 0), x.maxPriority);
  assert.ok(x.totalAllocated <= W);
  assert.equal(x.totalAllocated + x.remaining, W);
  if (trace) assert.deepEqual(x.rows, ref2D(students, W));
  return x;
}
const seven = mk([12000, 8500, 15000, 9000, 20000, 7500, 11000], [8, 6, 9, 5, 10, 4, 7]);
check(mk([3, 4, 5], [4, 5, 6]), 6, true);
check(seven.map((s, i) => ({ ...s, amount: [20, 14, 25, 15, 33, 12, 18][i] })), 100);
check(seven.map((s, i) => ({ ...s, amount: [200, 140, 250, 150, 330, 120, 180][i] })), 1000);
const big = check(seven, 45000);
assert.equal(big.best.length, 45001);
assert.ok(big.selected.length > 0);
assert.equal(check(seven, 200000).selected.length, 7);   // budget above everything
assert.equal(check(seven, 1000).selected.length, 0);     // below every requirement
assert.equal(solveKnapsack(seven, 0).selected.length, 0);// budget 0 (UI blocks it earlier)
check(mk([4, 4, 4, 4], [5, 5, 5, 5]), 9);                // equal priority and amount
check(mk([2, 3, 4, 5], [3, 4, 5, 6]), 5);                // two optimal sets (2+3 and 5 alone is 6 vs 7)
check(mk([3, 3, 3], [4, 4, 4]), 6);                      // identical amounts, ties
check(mk([50, 3, 4], [100, 4, 5]), 8);                   // one student exceeds the budget
for (let t = 0; t < 200; t++) {
  const n = 1 + Math.floor(Math.random() * 8), W = 1 + Math.floor(Math.random() * 60);
  check(mk(Array.from({ length: n }, () => Math.floor(Math.random() * 30)), Array.from({ length: n }, () => Math.floor(Math.random() * 9))), W, true);
}
console.log('Scalability tests passed');
