import { useEffect, useRef } from 'react';
import { renderDpTable } from '../visualization/dpTable.js';
import { renderProfile, profileStep } from '../visualization/profile.js';

const money = (n) => '\u20B9' + Number(n).toLocaleString('en-IN');

export default function DpTable({ result, students }) {
  const ref = useRef(null);
  const detailed = !!result.rows;
  useEffect(() => {
    if (detailed) renderDpTable(ref.current, { dp: result.rows, students, path: result.path, budget: result.budget });
    else renderProfile(ref.current, { best: result.best, budget: result.budget });
  }, [result, students, detailed]);

  return (
    <>
      {detailed ? (
        <>
          <p>Detailed table: every budget state from 0 to {result.budget} is shown. Each cell is the best priority score reachable with that budget using the students up to that row.</p>
          <ul className="legend">
            <li><span className="sw taken" /> Reconstruction path, student selected (value differs from the row above)</li>
            <li><span className="sw skipped" /> Reconstruction path, student skipped (value equals the row above)</li>
          </ul>
          <div className="scroll" tabIndex={0} aria-label="DP table, scrollable"><div ref={ref} /></div>
        </>
      ) : (
        <>
          <p>The budget has {(result.budget + 1).toLocaleString('en-IN')} states, too many to show as cells. The algorithm processed every one of them exactly, with no rounding. The chart plots the final maximum priority for each budget, sampled every {profileStep(result.budget)} unit(s) for display only.</p>
          <div className="chart" ref={ref} />
        </>
      )}
      <h3>Reconstruction trace</h3>
      <p className="note">Students are examined from last to first, starting with the full budget.</p>
      <div className="scroll">
        <table>
          <thead><tr><th>Student</th><th className="num">Budget before</th><th>Decision</th><th className="num">Budget after</th></tr></thead>
          <tbody>
            {result.path.map((p) => {
              const s = students[p.i - 1];
              return (
                <tr key={p.i}>
                  <td>{s.id} {s.name}</td><td className="num">{money(p.w)}</td>
                  <td className={p.taken ? 'ok' : 'muted'}>{p.taken ? `Selected (${money(s.amount)})` : s.amount > p.w ? 'Skipped (amount exceeds remaining budget)' : 'Skipped (no gain)'}</td>
                  <td className="num">{money(p.taken ? p.w - s.amount : p.w)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
