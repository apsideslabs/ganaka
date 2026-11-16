import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
// Sample the Sun's error across the supported range using one location.
const rows: string[] = [];
for (let y = 1900; y <= 2040; y += 10) {
  const c: any = calculateFullJyotishaChart({ year:y,month:6,day:15,hour:12,minute:0,second:0, latitude:19.08,longitude:72.88,timezoneOffsetHours:5.5, locationName:'X' });
  rows.push(`${y}:${c.planets.sun.siderealLongitude.toFixed(4)}`);
}
console.log('sun sidereal at 15 Jun 12:00 IST, every 10 years:');
console.log(' ', rows.join('  '));
