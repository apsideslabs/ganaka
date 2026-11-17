import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const av = c.ashtakavarga;
// BPHS Ch.66 — the classical BAV totals. They are NOT equal; they sum to 337.
const BPHS: Record<string, number> = { sun:48, moon:49, mars:39, mercury:54, jupiter:56, venus:52, saturn:39 };
let sum = 0, bad = 0;
for (const p of Object.keys(BPHS)) {
  const t = av.bav[p].totalBindus;
  const ok = t === BPHS[p];
  if (!ok) bad++;
  sum += t;
  console.log(`${ok?'✓':'✗'} ${p.padEnd(8)} BAV total ${String(t).padStart(2)}  (BPHS ${BPHS[p]})  per-sign ${av.bav[p].bindusByRashi.join('')}`);
}
console.log(`\nsum of BAV totals: ${sum}  (must be 337)  ${sum===337?'✓':'✗'}`);
const sav = av.sav.bindusByRashi;
const savSum = sav.reduce((a:number,b:number)=>a+b,0);
console.log(`SAV per sign: ${sav.join(' ')}  → sum ${savSum}  ${savSum===337?'✓':'✗'}`);
// SAV per sign must equal the sum of the seven BAVs for that sign.
for (let i = 0; i < 12; i++) {
  const col = Object.keys(BPHS).reduce((a,p)=>a+av.bav[p].bindusByRashi[i],0);
  if (col !== sav[i]) { console.log(`✗ sign ${i+1}: SAV ${sav[i]} ≠ BAV column ${col}`); bad++; }
}
console.log(bad===0 ? '\nAshtakavarga internally consistent and matches BPHS' : `\n${bad} problems`);
