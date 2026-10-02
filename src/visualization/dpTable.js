import * as d3 from 'd3';

const CELL = 34, LEFT = 170, TOP = 30;

export function renderDpTable(el, { dp, students, path, budget }) {
  const n = students.length;
  const onPath = new Map(path.map((p) => [`${p.i},${p.w}`, p.taken]));
  const takenIds = new Set(path.filter((p) => p.taken).map((p) => p.i));

  const svg = d3.select(el).selectAll('svg').data([0]).join('svg')
    .attr('width', LEFT + (budget + 1) * CELL)
    .attr('height', TOP + (n + 1) * CELL)
    .attr('role', 'img')
    .attr('aria-label', 'Dynamic programming table with reconstruction path');
  svg.selectAll('*').remove();

  svg.append('g').selectAll('text').data(d3.range(budget + 1)).join('text')
    .attr('class', 'dp-colhead').attr('x', (d) => LEFT + d * CELL + CELL / 2).attr('y', 20)
    .attr('text-anchor', 'middle').text((d) => d);

  const labels = ['0  (no students)', ...students.map((s) => `${s.id}  ${s.name} (${s.amount}, ${s.priority})`)];
  svg.append('g').selectAll('text').data(labels).join('text')
    .attr('class', (_, i) => 'dp-rowhead' + (takenIds.has(i) ? ' is-taken' : ''))
    .attr('x', LEFT - 8).attr('y', (_, i) => TOP + i * CELL + CELL / 2 + 4)
    .attr('text-anchor', 'end').text((d) => (d.length > 26 ? d.slice(0, 25) + '...' : d));

  const cells = [];
  for (let i = 0; i <= n; i++) for (let w = 0; w <= budget; w++) cells.push({ i, w, v: dp[i][w] });

  const g = svg.append('g').selectAll('g').data(cells).join('g')
    .attr('transform', (d) => `translate(${LEFT + d.w * CELL},${TOP + d.i * CELL})`);

  g.append('rect').attr('width', CELL - 2).attr('height', CELL - 2).attr('x', 1).attr('y', 1)
    .attr('class', (d) => {
      const k = onPath.get(`${d.i},${d.w}`);
      return 'dp-cell' + (k === true ? ' path-taken' : k === false ? ' path-skipped' : '');
    });
  g.append('text').attr('class', 'dp-val').attr('x', CELL / 2).attr('y', CELL / 2 + 4)
    .attr('text-anchor', 'middle').text((d) => d.v);
  g.append('title').text((d) => {
    const k = onPath.get(`${d.i},${d.w}`);
    return `dp[${d.i}][${d.w}] = ${d.v}` + (k === undefined ? '' : k ? ' (on path: student selected)' : ' (on path: student skipped)');
  });
}
