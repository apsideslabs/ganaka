import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
import { calculateKpLayer } from './lib/kp';
import { candidateDays } from './lib/kp/candidate-days';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const L: any = calculateKpLayer(c, new Date());
for (const matter of ['career','wealth','property','health']) {
  const w = (L.timing as any)[matter]?.windows ?? [];
  if (!w.length) { console.log(`${matter}: no windows`); continue; }
  const win = w[0];
  const days = candidateDays(c, win);
  console.log(`\n${matter}: window ${win.from.slice(0,10)} → ${win.to.slice(0,10)}  lords ${win.lords.map((l:any)=>l.lord).join(',')}`);
  console.log(`  candidate days: ${days.length}  (body: ${days[0]?.body ?? 'n/a'})`);
  for (const d of days.slice(0,6)) console.log(`    ${d.date}  ${d.body}  sign ${d.signLord} star ${d.starLord} sub ${d.subLord}`);
}
