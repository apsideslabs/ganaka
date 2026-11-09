#!/usr/bin/env python3
"""Wire chart context into shadbala and clean up the implementation."""
import pathlib
import sys

changed = []

S = pathlib.Path('lib/shadbala/shadbala.ts')
C = pathlib.Path('lib/jyotisha/calculator.ts')

if not S.exists() or not C.exists():
    print('::error::expected source files missing')
    sys.exit(1)

s = S.read_text()
orig = s

# 1. The interface needs the ayanamsa the caller already computed.
if 'ayanamsha?: number;' not in s:
    s = s.replace(
        '  timezoneOffsetHours?: number;\n}',
        '  timezoneOffsetHours?: number;\n  /** Ayanamsa in degrees, needed for Ayana Bala. */\n  ayanamsha?: number;\n}',
        1,
    )
    changed.append('ShadbalaContext.ayanamsha')

# 2. Replace the placeholder ayanamsa lookup with the real value.
DEAD = (
    "    const ayanamsha = typeof ctx.jd === 'number' ? 0 : 0;\n"
    "    void ayanamsha;\n"
    "    const ayana = ayanaBala(pId, lon, ctxAyanamsha(ctx));"
)
LIVE = (
    "    const ayana = ayanaBala(\n"
    "      pId,\n"
    "      lon,\n"
    "      typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0\n"
    "    );"
)
if DEAD in s:
    s = s.replace(DEAD, LIVE)
    changed.append('ayana bala ayanamsa')

# 3. Drop the now-unused helper.
HELPER = (
    "\n/** Ayanamsa supplied alongside the context, defaulting to Lahiri. */\n"
    "function ctxAyanamsha(ctx: ShadbalaContext): number {\n"
    "  return typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0;\n"
    "}\n"
)
if HELPER in s:
    s = s.replace(HELPER, '')
    changed.append('remove ctxAyanamsha')

# 4. Remove the leftover dead locals in the hora block.
for junk in ('    const base = isDayBirth ? sunrise! : sunset! - 0.5;\n', '    void base;\n'):
    if junk in s:
        s = s.replace(junk, '')
        changed.append('hora cleanup')

if s != orig:
    S.write_text(s)

# 5. Pass the chart context at the single call site.
c_text = C.read_text()
OLD = '  const shadbala = calculateShadbala(shadbalaInput, lagna.siderealLongitude, isDayBirth);'
NEW = """  const shadbala = calculateShadbala(shadbalaInput, lagna.siderealLongitude, isDayBirth, {
    jd,
    sunriseJD: sunTimes.sunriseJD,
    sunsetJD: sunTimes.sunsetJD,
    solarNoonJD: sunTimes.solarNoonJD,
    year,
    month,
    day,
    hour,
    minute,
    timezoneOffsetHours,
    ayanamsha,
  });"""
if OLD in c_text:
    C.write_text(c_text.replace(OLD, NEW))
    changed.append('calculator call site')

# ---------------------------------------------------------------------------
# 6. Cesta Bala: replace the motion-state classification with the seeghrocha
#    method of BPHS 27.24-25 (Raman, Graha and Bhava Balas, ch. VI).
# ---------------------------------------------------------------------------
HELPERS = """
/**
 * Mean longitudes (tropical, degrees) from the JPL approximate elements.
 * T is Julian centuries from J2000.
 */
function meanLongitudes(T: number) {
  const n = (x: number) => ((x % 360) + 360) % 360;
  return {
    sun: n(280.46646 + 36000.76983 * T + 0.0003032 * T * T),
    mercury: n(252.2503235 + 149472.67411175 * T + 0.00000536 * T * T),
    venus: n(181.9790995 + 58517.81538729 * T + 0.00000165 * T * T),
    mars: n(355.45332 + 19140.30268499 * T + 0.00002005 * T * T),
    jupiter: n(34.351519 + 3036.3027748 * T + 0.0002233 * T * T),
    saturn: n(50.077444 + 1223.5110686 * T + 0.00051908 * T * T),
  };
}

/**
 * Cesta bala from the cesta kendra (BPHS 27.24-25):
 *
 *   kendra = seeghrocha - (mean + true) / 2
 *   fold to 180, divide by 3
 *
 * Exported so the deploy can check it against B. V. Raman's worked example.
 */
export function chestaBalaFromKendra(
  seeghrocha: number,
  mean: number,
  trueTropical: number
): number {
  let k = (((seeghrocha - (mean + trueTropical) / 2) % 360) + 360) % 360;
  if (k > 180) k = 360 - k;
  return k / 3;
}
"""

if 'chestaBalaFromKendra' not in s:
    anchor = 'export function calculateShadbala('
    s = s.replace(anchor, HELPERS.strip() + '\n\n' + anchor, 1)

OLD = """    } else if (pos.isRetrograde) {
      chestaBala = 60.0;
    } else if (Math.abs(pos.speedDegPerDay) < 0.05) {
      chestaBala = 45.0; // stationary
    } else if (pos.speedDegPerDay > 1.0) {
      chestaBala = 30.0; // fast direct
    } else {
      chestaBala = 15.0; // slow direct
    }"""

NEW = """    } else if (typeof ctx.jd === 'number') {
      // BPHS 27.24-25, the seeghrocha method (Raman, Graha and Bhava Balas,
      // ch. VI). Mars, Jupiter and Saturn take the mean Sun as their
      // seeghrocha; Mercury and Venus take their own heliocentric mean
      // longitude as the seeghrocha and the mean Sun as their mean position.
      // The mean longitudes are tropical, so the sidereal true longitude is
      // converted to tropical first.
      const T = (ctx.jd - 2451545.0) / 36525.0;
      const ml = meanLongitudes(T);
      const trueTropical = lon + (typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0);
      chestaBala =
        pId === 'mercury' || pId === 'venus'
          ? chestaBalaFromKendra((ml as any)[pId], ml.sun, trueTropical)
          : chestaBalaFromKendra(ml.sun, (ml as any)[pId], trueTropical);
    } else {
      // No Julian day in the context: fall back to the coarse motion state so
      // the figure is at least bounded. Callers that pass ctx always use the
      // seeghrocha method above.
      chestaBala = pos.isRetrograde ? 60.0 : 15.0;
    }"""

if OLD in s:
    s = s.replace(OLD, NEW)
    print('cesta bala replaced with seeghrocha method')
elif 'chestaBalaFromKendra(ml.sun' in s:
    print('already patched')
else:
    print('::error::cesta block not found')
    raise SystemExit(1)

if 'chestaBalaFromKendra' in s:
    S.write_text(s)

print('changed:', changed or 'none')
