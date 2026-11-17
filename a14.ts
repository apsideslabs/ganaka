import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
// Swiss: only Saturn retrograde on 2009-03-03
const SWISS: Record<string, boolean> = { sun:false, moon:false, mars:false, mercury:false, jupiter:false, venus:false, saturn:true };
for (const p of Object.keys(SWISS)) {
  const eng = c.planets[p].isRetrograde === true;
  console.log(`${eng === SWISS[p] ? '✓' : '✗'} ${p.padEnd(8)} engine retro=${eng}  swiss retro=${SWISS[p]}`);
}
console.log('\nsunrise: engine', c.panchanga.sunTimes?.sunrise, '— Swiss JD gives 04 Mar 06:30 UT = 12:00 IST');
console.log('(a 23:51 IST birth on 3 Mar belongs to the panchanga day beginning at sunrise on 3 Mar)');
