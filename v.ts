import { calculateFullJyotishaChart } from './lib/jyotisha/calculator';
// 3 Mar 2009 was a Tuesday. A birth at 02:00 on 4 Mar is still the Hindu day
// that began at sunrise on 3 Mar, so the vara must still be Mars (Tuesday).
for (const [label, d, h] of [['3 Mar 23:51', 3, 23.85], ['4 Mar 02:00', 4, 2], ['4 Mar 06:00', 4, 6], ['4 Mar 09:00', 4, 9]] as any[]) {
  const c: any = calculateFullJyotishaChart({ year:2009,month:3,day:d,hour:Math.floor(h),minute:Math.round((h%1)*60),second:0, latitude:26.65,longitude:91.15,timezoneOffsetHours:5.5, locationName:'X' } as any);
  const p: any = c.panchanga;
  console.log(`${label}  vara=${p.vara?.name ?? p.vara?.number}  tithi=${p.tithi?.number ?? p.tithi}  sunrise=${p.sunTimes?.sunrise}`);
}
console.log('\n3 Mar = Tuesday (Mars). A 4 Mar 02:00 birth belongs to that same Hindu day.');
