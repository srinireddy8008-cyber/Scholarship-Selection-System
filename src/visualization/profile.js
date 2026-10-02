import * as d3 from 'd3';

export const profileStep = (budget) => Math.max(1, Math.ceil((budget + 1) / 600));

// best[w] sampled every `step` budget units. Display only; the DP used every unit.
export function renderProfile(el, { best, budget }) {
  const W = 640, H = 300, m = { t: 16, r: 24, b: 44, l: 52 };
  const step = profileStep(budget);
  const pts = [];
  for (let w = 0; w <= budget; w += step) pts.push([w, best[w]]);
  if (pts[pts.length - 1][0] !== budget) pts.push([budget, best[budget]]);
  const x = d3.scaleLinear([0, budget], [m.l, W - m.r]);
  const y = d3.scaleLinear([0, best[budget] || 1], [H - m.b, m.t]);

  const svg = d3.select(el).selectAll('svg').data([0]).join('svg')
    .attr('viewBox', `0 0 ${W} ${H}`).attr('class', 'profile').attr('role', 'img')
    .attr('aria-label', 'Maximum priority score as a function of budget');
  svg.selectAll('*').remove();
  svg.append('g').attr('transform', `translate(0,${H - m.b})`).call(d3.axisBottom(x).ticks(6).tickFormat(d3.format(',')));
  svg.append('g').attr('transform', `translate(${m.l},0)`).call(d3.axisLeft(y).ticks(5));
  svg.append('path').datum(pts).attr('class', 'profile-line')
    .attr('d', d3.line().curve(d3.curveStepAfter).x((d) => x(d[0])).y((d) => y(d[1])));
  svg.append('circle').attr('class', 'profile-end').attr('r', 5).attr('cx', x(budget)).attr('cy', y(best[budget]))
    .append('title').text(`Budget ${budget}: maximum priority ${best[budget]}`);
  svg.append('text').attr('class', 'axis-label').attr('x', (m.l + W - m.r) / 2).attr('y', H - 6).attr('text-anchor', 'middle').text('Budget (rupees)');
  svg.append('text').attr('class', 'axis-label').attr('transform', `translate(14,${(m.t + H - m.b) / 2}) rotate(-90)`).attr('text-anchor', 'middle').text('Max priority');
}
