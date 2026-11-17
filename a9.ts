import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('=== JAIMINI CHARA KARAKAS ===');
// Atmakaraka = the graha with the HIGHEST degree within its sign (excluding Ketu per some, including per others)
const order = ['sun','moon','mars','mercury','jupiter','venus','saturn','rahu','ketu'];
const degs = order.map(p => ({ p, d: c.planets[p].siderealLongitude % 30 }));
degs.sort((a,b)=>b.d-a.d);
console.log('By degree-in-sign (descending):');
degs.forEach((x,i)=>console.log(`  ${i+1}. ${x.p.padEnd(8)} ${x.d.toFixed(3)}°`));
const j: any = c.jaimini ?? c.meta?.jaimini;
const ak = j?.karakas?.atmakaraka ?? j?.atmakaraka;
console.log('\nEngine Atmakaraka:', ak, ' manual:', degs[0].p, ak===degs[0].p?'✓':'✗');
if (j?.karakas) console.log('Engine karakas:', JSON.stringify(j.karakas).slice(0,220));
