import { useState } from 'react';
import { sampleStudents, sampleBudget } from './data/sampleStudents.js';
import { solveKnapsack, DETAIL_MAX_BUDGET } from './algorithm/knapsack.js';
import { validateStudent, validateBudget, validateRun } from './algorithm/validation.js';
import DpTable from './components/DpTable.jsx';

const blank = { id: '', name: '', amount: '', priority: '' };
const money = (n) => '\u20B9' + Number(n).toLocaleString('en-IN');

export default function App() {
  const [students, setStudents] = useState(sampleStudents);
  const [isDemo, setIsDemo] = useState(true);
  const [budget, setBudget] = useState(String(sampleBudget));
  const [draft, setDraft] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [runError, setRunError] = useState(null);
  const [run, setRun] = useState(null);

  const key = JSON.stringify([students, budget]);
  const stale = run && run.key !== key;
  const budgetErr = budget === '' ? null : validateBudget(budget);
  const budgetNum = Number(budget);
  const tooCostly = budgetErr || budget === '' ? [] : students.filter((s) => s.amount > budgetNum);
  const r = run && run.result;

  const change = (f) => (e) => setDraft({ ...draft, [f]: e.target.value });
  function save(e) {
    e.preventDefault();
    const errs = validateStudent(draft, students, editingId);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const s = { id: draft.id.trim(), name: draft.name.trim(), amount: Number(draft.amount), priority: Number(draft.priority) };
    setStudents(editingId ? students.map((x) => (x.id === editingId ? s : x)) : [...students, s]);
    setDraft(blank); setEditingId(null);
  }
  const cancel = () => { setEditingId(null); setDraft(blank); setErrors({}); };
  function edit(s) {
    setEditingId(s.id);
    setDraft({ id: s.id, name: s.name, amount: String(s.amount), priority: String(s.priority) });
    setErrors({});
  }
  const clearAll = () => { setStudents([]); setIsDemo(false); cancel(); };

  function runOptimization() {
    const err = validateRun(students, budget);
    setRunError(err);
    if (err) return;
    const snapshot = students.map((s) => ({ ...s }));
    setRun({ key, students: snapshot, result: solveKnapsack(snapshot, budgetNum, { trace: budgetNum <= DETAIL_MAX_BUDGET }) });
  }

  const field = (name, label, numeric) => (
    <div className="field">
      <label htmlFor={`f-${name}`}>{label}</label>
      <input id={`f-${name}`} type={numeric ? 'number' : 'text'} min={numeric ? 0 : undefined} step={numeric ? 1 : undefined}
        inputMode={numeric ? 'numeric' : undefined} value={draft[name]} onChange={change(name)}
        aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `e-${name}` : undefined} />
      {errors[name] && <span className="err" id={`e-${name}`}>{errors[name]}</span>}
    </div>
  );

  return (
    <>
      <header className="top">
        <div className="wrap bar">
          <h1>Scholarship Selection System</h1>
          <nav aria-label="Sections">
            <a href="#students">Student data</a><a href="#optimize">Optimization</a>
            <a href="#results">Results</a><a href="#viz">Visualization</a>
          </nav>
        </div>
      </header>
      <main className="wrap">
        <section id="overview">
          <h2>Overview</h2>
          <p>Selects the students that maximize total priority score without exceeding the scholarship budget. Each student is either funded in full or not funded (0/1 knapsack), solved exactly by dynamic programming.</p>
          <p className="note">Time: O(n × W). Space: O(W) for the DP value array plus O(n × W) forreconstruction data. Here n is the number of students and W is thebudget in rupees.</p>
          <dl className="facts">
            <div><dt>Students</dt><dd>{students.length}</dd></div>
            <div><dt>Budget</dt><dd>{budget === '' || budgetErr ? 'Not set' : money(budgetNum)}</dd></div>
            <div><dt>Last run</dt><dd className="small">{!run ? 'None' : stale ? 'Out of date' : 'Current'}</dd></div>
          </dl>
        </section>

        <section id="students">
          <h2>Student data</h2>
          {isDemo && students.length > 0 && <p className="info">Demo data: fictional students shown for demonstration. Edit them or clear all.</p>}
          <h3>{editingId ? `Edit student ${editingId}` : 'Add a student'}</h3>
          <form className="grid" onSubmit={save} noValidate>
            {field('id', 'Student ID')}{field('name', 'Name')}
            {field('amount', 'Amount required (\u20B9)', true)}{field('priority', 'Priority score', true)}
            <div className="actions">
              <button type="submit" className="btn secondary-strong">{editingId ? 'Save changes' : 'Add student'}</button>
              {editingId && <button type="button" className="btn" onClick={cancel}>Cancel</button>}
            </div>
          </form>
          <div className="scroll">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th className="num">Amount required</th><th className="num">Priority</th><th className="num">Actions</th></tr></thead>
              <tbody>
                {students.length === 0 && <tr><td colSpan="5" className="muted">No students. Add a student above.</td></tr>}
                {students.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td><td>{s.name}</td><td className="num">{money(s.amount)}</td><td className="num">{s.priority}</td>
                    <td className="num nowrap">
                      <button className="btn-text" onClick={() => edit(s)}>Edit</button>
                      <button className="btn-text danger" onClick={() => setStudents(students.filter((x) => x.id !== s.id))}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {students.length > 0 && <button className="btn" onClick={clearAll}>Clear all students</button>}
        </section>

        <section id="optimize">
          <h2>Optimization</h2>
          <div className="field narrow">
            <label htmlFor="budget">Total scholarship budget (&#8377;)</label>
            <input id="budget" type="number" min="0" step="1" inputMode="numeric" value={budget} onChange={(e) => setBudget(e.target.value)} aria-invalid={!!budgetErr} />
            {budgetErr && <span className="err">{budgetErr}</span>}
          </div>
          {tooCostly.length > 0 && <p className="warn">These students require more than the budget and can never be selected: {tooCostly.map((s) => s.id).join(', ')}.</p>}
          <button className="btn primary" onClick={runOptimization}>Run optimization</button>
          {runError && <p className="err" role="alert">{runError}</p>}
          {stale && <p className="warn" role="status">Students or budget changed since the last run. Results below are out of date. Run optimization again.</p>}
          <p className="note">Tie-break: a student is skipped unless including them gives a strictly higher total priority.</p>
        </section>

        <section id="results">
          <h2>Results</h2>
          {!r ? <p>Run the optimization to see results.</p> : (
            <div className={stale ? 'stale' : ''}>
              {r.selected.length === 0 && <p className="warn" role="status">No student can be funded with a budget of {money(r.budget)}.</p>}
              <dl className="facts">
                <div><dt>Available budget</dt><dd>{money(r.budget)}</dd></div>
                <div><dt>Total allocated</dt><dd>{money(r.totalAllocated)}</dd></div>
                <div><dt>Remaining budget</dt><dd>{money(r.remaining)}</dd></div>
                <div className="key"><dt>Total priority score</dt><dd>{r.maxPriority}</dd></div>
                <div><dt>Students selected</dt><dd>{r.selected.length}</dd></div>
              </dl>
              {r.selected.length > 0 && (
                <div className="scroll">
                  <table>
                    <thead><tr><th>Student</th><th className="num">Scholarship amount</th><th className="num">Priority score</th></tr></thead>
                    <tbody>{r.selected.map((s) => <tr key={s.id}><td>{s.id} {s.name}</td><td className="num">{money(s.amount)}</td><td className="num">{s.priority}</td></tr>)}</tbody>
                    <tfoot><tr><th>Total</th><th className="num">{money(r.totalAllocated)}</th><th className="num">{r.maxPriority}</th></tr></tfoot>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>

        <section id="viz">
          <h2>Algorithm visualization</h2>
          {!r ? <p>Run the optimization to see how the result was computed.</p> : <div className={stale ? 'stale' : ''}><DpTable result={r} students={run.students} /></div>}
        </section>
      </main>
    </>
  );
}
