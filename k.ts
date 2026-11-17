import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
console.log('charaKarakas count:', c.jaimini.charaKarakas.length);
for (const k of c.jaimini.charaKarakas) console.log(`  ${k.karakaKey.padEnd(4)} ${k.planet.padEnd(8)} ${k.degrees.toFixed(3)}°`);
