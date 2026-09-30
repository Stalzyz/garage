import { istDayRange, istHourOf, istDateString, addIstDays, formatIst, istHourRange } from './src/utils/ist-time';
let fail = 0;
const ok = (n: string, got: any, want: any) => {
  const g = typeof got === 'object' ? JSON.stringify(got) : String(got);
  const w = typeof want === 'object' ? JSON.stringify(want) : String(want);
  if (g === w) console.log(`  PASS ${n} -> ${g}`); else { fail++; console.log(`  FAIL ${n} -> got ${g} want ${w}`); }
};

console.log('\n=== Day boundary: IST 2026-09-30 00:00 == UTC 2026-09-29 18:30 ===');
const r = istDayRange('2026-09-30');
ok('isoDate', r.isoDate, '2026-09-30');
ok('start UTC', r.start.toISOString(), '2026-09-29T18:30:00.000Z');
ok('end UTC', r.end.toISOString(), '2026-09-30T18:30:00.000Z');

console.log('\n=== Hour bucket: instants inside 2026-09-30 IST ===');
ok('09:15 IST -> hour 9', istHourOf(new Date('2026-09-30T03:45:00Z')), 9);
ok('00:00 IST -> hour 0 (not 24)', istHourOf(new Date('2026-09-29T18:30:00Z')), 0);
ok('23:59 IST -> hour 23', istHourOf(new Date('2026-09-30T18:29:00Z')), 23);

console.log('\n=== An instant late in UTC evening is NEXT day in IST ===');
// 2026-09-30 20:00 UTC = 2026-10-01 01:30 IST
ok('istDateString of 2026-09-30T20:00Z', istDateString(new Date('2026-09-30T20:00:00Z')), '2026-10-01');
ok('its hour', istHourOf(new Date('2026-09-30T20:00:00Z')), 1);

console.log('\n=== Day math across month boundary ===');
ok('addIstDays(2026-09-30, +1)', addIstDays('2026-09-30', 1), '2026-10-01');
ok('addIstDays(2026-10-01, -1)', addIstDays('2026-10-01', -1), '2026-09-30');
ok('addIstDays(2026-03-01, -1)', addIstDays('2026-03-01', -1), '2026-02-28');

console.log('\n=== Hour range ===');
const h = istHourRange('2026-09-30', 9);
ok('hour 9 start', h.start.toISOString(), '2026-09-30T03:30:00.000Z');
ok('hour 9 end', h.end.toISOString(), '2026-09-30T04:30:00.000Z');

console.log('\n=== Formatting ===');
ok('formatIst', formatIst(new Date('2026-09-30T09:05:00Z')), '30 Sept 2026, 14:35');

console.log(`\n${fail === 0 ? 'ALL PASS' : fail + ' FAILED'}`);
process.exit(fail ? 1 : 0);
