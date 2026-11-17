import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
import { calculateKpLayer } from './lib/kp';
import { fourStepForAll } from './lib/kp/four-step';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const L: any = calculateKpLayer(c, new Date());
for (const r of fourStepForAll(c, L, new Date())) {
  const s4 = r.steps.find(s=>s.step===4)!;
  console.log(`\n${r.matterLabel} — ${r.outcome}`);
  console.log(`  ${s4.finding.slice(0,190)}`);
}
