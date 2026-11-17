import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
import { calculateKpLayer } from './lib/kp';
import { sunMoonLongitudes } from './lib/astronomy/ephemeris';
import { calculateKPPosition } from './lib/jyotisha/sphutas';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const L: any = calculateKpLayer(c, new Date());
const DAY=86400000;
let strict=0, loose=0, total=0, windowsWithAny=0;
for (const k of Object.keys(L.timing)) {
  for (const w of (L.timing as any)[k].windows ?? []) {
    total++;
    const lords = new Set(w.lords.map((l:any)=>l.lord));
    const f=new Date(w.from).getTime(), t=new Date(w.to).getTime();
    const span=(t-f)/DAY;
    const body = span>=20?'sun':'moon';
    let s=0, lo=0;
    for (let x=f; x<=t; x+=DAY) {
      const jd = 2440587.5 + x/DAY;
      const {sun,moon}=sunMoonLongitudes(jd,'lahiri',0);
      const kp=calculateKPPosition(body==='sun'?sun:moon);
      const three=[kp.signLord,kp.starLord,kp.subLord] as string[];
      if (three.every(z=>lords.has(z))) s++;
      if (three.some(z=>lords.has(z))) lo++;
    }
    strict+=s; loose+=lo;
    if (s>0) windowsWithAny++;
  }
}
console.log(`windows examined: ${total}`);
console.log(`  qualifying days, strict (sign AND star AND sub all in period lords): ${strict}`);
console.log(`  qualifying days, loose  (ANY of the three in period lords):          ${loose}`);
console.log(`  windows with at least one strict day: ${windowsWithAny}/${total}`);
