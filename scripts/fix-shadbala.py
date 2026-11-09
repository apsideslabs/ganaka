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
        '  timezoneOffsetHours?: number;\n  /** Ayanāṁśa in degrees, needed for Ayana Bala. */\n  ayanamsha?: number;\n}',
        1,
    )
    changed.append('ShadbalaContext.ayanamsha')

# 2. Replace the placeholder ayanamsa lookup with the real value.
DEAD = """    const ayanamsha = typeof ctx.jd === 'number' ? 0 : 0;
    void ayanamsha;
    const ayana = ayanaBala(pId, lon, ctxAyanamsha(ctx));"""
LIVE = """    const ayana = ayanaBala(
      pId,
      lon,
      typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0
    );"""
if DEAD in s:
    s = s.replace(DEAD, LIVE)
    changed.append('ayana bala ayanamsa')

# 3. Drop the now-unused helper.
HELPER = """
/** Ayanāṁśa supplied alongside the context, defaulting to Lahiri. */
function ctxAyanamsha(ctx: ShadbalaContext): number {
  return typeof ctx.ayanamsha === 'number' ? ctx.ayanamsha : 0;
}
"""
if HELPER in s:
    s = s.replace(HELPER, '')
    changed.append('remove ctxAyanamsha')

# 4. Remove the leftover dead locals in the hora block.
s = s.replace("    const base = isDayBirth ? sunrise! : sunset! - 0.5;\n", '')
 s = s.replace('    void base;\n', '')

if s != orig:
    S.write_text(s)

# 5. Pass the chart context at the single call site.
c = C.read_text()
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
if OLD in c:
    c.write_text(c.replace(OLD, NEW))
    changed.append('calculator call site')

print('changed:', changed or 'none')
