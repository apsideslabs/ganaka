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

# ---------------------------------------------------------------------------
# 7. Varsa and Masa Bala (BPHS 27.26-27).
# ---------------------------------------------------------------------------
OLD_VM = """    // 3.7 Varṣa and Māsa bala are not implemented: they need the weekday on
    //     which the solar year and solar month began, which requires a
    //     saṅkrānti search the ephemeris module does not expose. They are 0.
    const varshaBala = 0;
    const masaBala = 0;"""

NEW_VM = """    // 3.7 Varṣa Bala (15 virūpas) and Māsa Bala (30 virūpas), BPHS 27.26-27,
    //     go to the lord of the weekday on which the solar year and the solar
    //     month began. The caller passes the exact ingress instants, found by
    //     bisection on the Sun's sidereal longitude.
    let varshaBala = 0;
    let masaBala = 0;
    if (typeof ctx.masaIngressJD === 'number' &&
        WEEKDAY_LORDS[weekdayIndex(ctx.masaIngressJD)] === pId) {
      masaBala = 30;
    }
    if (typeof ctx.varshaIngressJD === 'number' &&
        WEEKDAY_LORDS[weekdayIndex(ctx.varshaIngressJD)] === pId) {
      varshaBala = 15;
    }"""

if OLD_VM in s:
    s = s.replace(OLD_VM, NEW_VM)
    print('varsa/masa implemented')
elif 'masaDays' in s:
    print('already patched')
else:
    print('::warning::varsa/masa block not found')

if 'masaIngressJD' in s or 'masaDays' in s:
    S.write_text(s)

# --- 9. Weekdays must be local, not UT -------------------------------------
if 'localWeekdayIndex' not in s:
    # declare the local-weekday helper early: the hora block uses it too
    s = s.replace(
        "  const hasTimes = typeof jd === 'number' && typeof sunrise === 'number' && typeof sunset === 'number';",
        "  const hasTimes = typeof jd === 'number' && typeof sunrise === 'number' && typeof sunset === 'number';\n\n"
        "  // Weekdays must be taken in local civil time, not UT: a 02:00 IST birth is\n"
        "  // still the previous UT day, which would award Dina, Hora, Varsa and Masa\n"
        "  // bala to the wrong lord.\n"
        "  const tzDays = (typeof ctx.timezoneOffsetHours === 'number' ? ctx.timezoneOffsetHours : 0) / 24;\n"
        "  const localWeekdayIndex = (j: number) => weekdayIndex(j + tzDays);", 1)
    # dina bala
    s = s.replace(
        "  const dinaLord = typeof jd === 'number' ? WEEKDAY_LORDS[weekdayIndex(jd)] : null;",
        "  const dinaLord = typeof jd === 'number' ? WEEKDAY_LORDS[localWeekdayIndex(jd)] : null;", 1)
    # hora bala
    s = s.replace(
        "    const startIdx = HORA_ORDER.indexOf(WEEKDAY_LORDS[weekdayIndex(Math.floor(start))]);",
        "    const startIdx = HORA_ORDER.indexOf(WEEKDAY_LORDS[localWeekdayIndex(Math.floor(start))]);", 1)
    # varsa / masa
    s = s.replace(
        "WEEKDAY_LORDS[weekdayIndex(ctx.masaIngressJD)] === pId",
        "WEEKDAY_LORDS[localWeekdayIndex(ctx.masaIngressJD)] === pId", 1)
    s = s.replace(
        "WEEKDAY_LORDS[weekdayIndex(ctx.varshaIngressJD)] === pId",
        "WEEKDAY_LORDS[localWeekdayIndex(ctx.varshaIngressJD)] === pId", 1)
    if 'localWeekdayIndex' in s:
        S.write_text(s)
        print('local weekday applied')

print('changed:', changed or 'none')

# --- 8. Solar ingress instants for Varsa and Masa bala ---------------------
if 'varshaIngressJD' not in s:
    s = s.replace(
        '  /** Ayanamsa in degrees, needed for Ayana Bala. */\n  ayanamsha?: number;',
        '  /** Ayanamsa in degrees, needed for Ayana Bala. */\n  ayanamsha?: number;\n  /** JD when the Sun last entered Aries (Mesha sankranti). */\n  varshaIngressJD?: number;\n  /** JD when the Sun last entered the current sidereal sign. */\n  masaIngressJD?: number;',
        1)
    S.write_text(s)

C2 = pathlib.Path('lib/jyotisha/calculator.ts')
if C2.exists():
    c = C2.read_text()
    if 'lastIngressJD' not in c:
        c = c.replace(
            "import { calculateAllPlanets, calculateSolarTimes, PlanetId } from '../astronomy/ephemeris';",
            "import { calculateAllPlanets, calculateSolarTimes, getSunDetailsAtJD, PlanetId } from '../astronomy/ephemeris';",
            1)
        anchor = '  const isDayBirth = jd >= sunTimes.sunriseJD && jd <= sunTimes.sunsetJD;'
        ingress = anchor + """

  // Solar ingress instants for Varsa and Masa bala (BPHS 27.26-27). Found by
  // bisection on the Sun's sidereal longitude rather than by linear
  // extrapolation: the Sun's speed ranges from 0.953 to 1.019 deg/day, so a
  // straight-line estimate over ~320 days can be several days out and land on
  // the wrong weekday.
  const sunSiderealAt = (j: number): number => {
    const s2 = getSunDetailsAtJD(j);
    const ay = calculateAyanamsha(j, ayanamshaType, customAyanamshaValue);
    return (((s2.appLon - ay) % 360) + 360) % 360;
  };
  const lastIngressJD = (target: number): number => {
    const f = (j: number) => (((sunSiderealAt(j) - target) % 360) + 360) % 360;
    const approx = jd - f(jd);
    let lo = approx - 12;
    let hi = approx + 12;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 180) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };
  const varshaIngressJD = lastIngressJD(0);
  const masaIngressJD = lastIngressJD(
    Math.floor(rawPlanets.sun.siderealLongitude / 30) * 30
  );"""
        assert anchor in c, 'calculator anchor not found'
        c = c.replace(anchor, ingress, 1)
        c = c.replace(
            '    ayanamsha,\n  });',
            '    ayanamsha,\n    varshaIngressJD,\n    masaIngressJD,\n  });',
            1)
        C2.write_text(c)
        print('calculator: ingress search added')
    else:
        print('calculator already patched')

