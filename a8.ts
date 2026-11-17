import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:3,hour:23,minute:51,second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
const sun = c.planets.sun.siderealLongitude, moon = c.planets.moon.siderealLongitude;
const p: any = c.panchanga ?? c.meta?.panchanga;

console.log('=== PAÑCĀṄGA (manual vs engine) ===');
const diff = ((moon - sun + 360) % 360);
console.log(`Moon−Sun = ${diff.toFixed(4)}°`);
console.log(`Tithi  manual ${Math.floor(diff/12)+1}   engine ${p?.tithi?.number ?? p?.tithiNumber}`);
console.log(`Nakshatra manual ${Math.floor(moon/(360/27))+1}   engine ${c.planets.moon.nakshatraNumber}`);
const yogaSum = ((moon + sun) % 360);
console.log(`Yoga   manual ${Math.floor(yogaSum/(360/27))+1}   engine ${p?.yoga?.number ?? p?.yogaNumber}`);
console.log(`Karana manual ${Math.floor(diff/6)+1}   engine ${p?.karana?.number ?? p?.karanaNumber}`);
console.log(`Vāra   manual ${new Date(Date.UTC(2009,2,3)).getUTCDay()} (0=Sun)  engine ${p?.vara?.number ?? p?.varaNumber}`);

console.log('\n=== D9 (Navāṃśa) — fixed-sign rule ===');
// Vṛṣabha is fixed: D9 starts from the 9th from it = Makara. Part = floor(deg/3.3333)+1
const deg = moon % 30;
const part = Math.floor(deg / (30/9));
const START: Record<number,number> = {}; // fixed signs start from 9th from themselves
const sign = Math.floor(moon/30)+1;
const isFixed = [2,5,8,11].includes(sign);
const startSign = isFixed ? ((sign - 1 + 8) % 12) + 1 : sign;
const d9manual = ((startSign - 1 + part) % 12) + 1;
console.log(`Moon ${deg.toFixed(3)}° in sign ${sign}, part ${part+1} → D9 sign ${d9manual}`);
console.log(`Engine D9 Moon sign: ${c.vargas.D9.planets.moon.rashiNumber}  ${c.vargas.D9.planets.moon.rashiNumber===d9manual?'✓':'✗'}`);
