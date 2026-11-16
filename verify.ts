import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const REF: Array<[string, any, any]> = [
 ['2009-03-03 23:51 Assam', { year:2009,month:3,day:3,hour:23,minute:51,second:24, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' },
   { sun:319.328331, moon:42.044194, mars:297.119769, mercury:298.263037, jupiter:289.309045, venus:351.292567, saturn:144.790284, lagna:224.390531, ayan:23.985187 }],
 ['1990-07-14 06:20 Delhi', { year:1990,month:7,day:14,hour:6,minute:20,second:0, latitude:28.61,longitude:77.21,timezoneOffsetHours:5.5, locationName:'X' },
   { sun:87.625444, moon:339.239189, mars:7.233995, mercury:100.274628, jupiter:88.499859, venus:58.936112, saturn:268.339592, lagna:96.877461, ayan:23.724827 }],
 ['1975-11-30 14:05 London', { year:1975,month:11,day:30,hour:14,minute:5,second:0, latitude:51.50,longitude:-0.13,timezoneOffsetHours:0, locationName:'X' },
   { sun:224.222178, moon:191.593163, mars:65.032684, mercury:225.178035, jupiter:351.394174, venus:179.162675, saturn:99.219228, lagna:359.640570, ayan:23.520637 }],
 ['2001-05-09 03:45 Sydney', { year:2001,month:5,day:9,hour:3,minute:45,second:0, latitude:-33.90,longitude:151.20,timezoneOffsetHours:11, locationName:'X' },
   { sun:24.279399, moon:218.146339, mars:245.124387, mercury:40.772439, jupiter:51.289539, venus:343.374883, saturn:38.331090, lagna:335.306354, ayan:23.875955 }],
 ['2026-11-16 12:00 Mumbai', { year:2026,month:11,day:16,hour:12,minute:0,second:0, latitude:19.08,longitude:72.88,timezoneOffsetHours:5.5, locationName:'X' },
   { sun:209.681631, moon:286.202090, mars:121.659594, mercury:191.401323, jupiter:121.657176, venus:178.729784, saturn:344.235057, lagna:282.418954, ayan:24.232516 }],
];
const arc = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) * 3600;
let worstAll = 0;
for (const [label, birth, ref] of REF) {
  const c: any = calculateFullJyotishaChart(birth);
  const row: string[] = [];
  let worst = 0;
  for (const b of ['sun','moon','mars','mercury','jupiter','venus','saturn']) {
    const d = arc((c.planets as any)[b].siderealLongitude, (ref as any)[b]);
    worst = Math.max(worst, d);
    row.push(`${b.slice(0,3)} ${d.toFixed(1)}`);
  }
  const dl = arc(c.lagna.siderealLongitude, ref.lagna);
  const da = arc(c.meta.ayanamshaValue, ref.ayan);
  worst = Math.max(worst, dl);
  worstAll = Math.max(worstAll, worst);
  console.log(`${label}`);
  console.log(`   ${row.join('  ')}`);
  console.log(`   lagna ${dl.toFixed(1)}″  ayanāṃśa ${da.toFixed(3)}″  → worst ${worst.toFixed(1)}″`);
}
console.log(`\nWORST ACROSS ALL: ${worstAll.toFixed(1)} arcsec`);
console.log(worstAll < 30 ? 'within 30″ — correct' : worstAll < 60 ? 'within 1′' : 'NEEDS INVESTIGATION');
