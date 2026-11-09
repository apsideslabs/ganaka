## 2. Ṣaḍbala

`Math.random()` was removed from Dṛg Bala — it previously made total strength,
ratio and rank different on every page load. Dṛg Bala is now Parāśari whole-sign
dṛṣṭi (BPHS ch. 26), and the build fails if `Math.random` reappears in real code
anywhere in `lib/`.

The two hardcoded placeholders are also gone: a bare `+45` in Sthāna Bala and a
bare `+30` in Kāla Bala, which stood in for components that were never written.
They have been replaced by actual implementations:

| Component | BPHS | Status |
|---|---|---|
| Uccha Bala | 27.1–27.5 | implemented |
| **Saptavargaja Bala** | 27.6–27.19 | **implemented** — 7 vargas (D1, D2, D3, D7, D9, D12, D30), Moolatrikona 45 → Adhiśatru 1.875, with adhimitra/adhīśatru derived from the natural friendship table |
| Ojayugma Bala | 27.12 | **corrected** — was 30/15, now 15 in a favourable parity and 0 otherwise |
| Kendrādi Bala | 27.21 | implemented |
| Drekkāṇa Bala | 27.20 | implemented |
| Dig Bala | 27.22 | implemented |
| Natonnata Bala | 27.23 | **implemented** — now scales with distance from solar noon instead of a binary day/night switch |
| Paksha Bala | 27.24 | implemented, **with the Moon's doubling** |
| **Tribhāga Bala** | 27.25 | **implemented** — day thirds Mercury/Sun/Moon, night thirds Moon/Venus/Mars |
| **Dina Bala** | 27.28 | **implemented** — 45 virūpas to the weekday lord |
| **Horā Bala** | 27.29 | **implemented** — 60 virūpas to the planetary hour lord |
| **Ayana Bala** | 27.30–27.33 | **implemented** — from the planet's declination |
| Ceṣṭā Bala | 27.34 | implemented; the Sun's is its Ayana Bala and the Moon's its Paksha Bala, per BPHS |
| Naisargika Bala | 27.35 | implemented |
| Dṛg Bala | 27.36 | implemented |
| **Varṣa Bala / Māsa Bala** | 27.26–27.27 | **still zero** — these need the weekday on which the solar year and solar month began, which requires a saṅkrānti search the ephemeris module does not expose |
| **Yuddha Bala** | 27.37 | **still zero** — planetary war; applies only within one degree and is omitted rather than guessed |

Ceṣṭā Bala for the five non-luminaries uses a motion-state classification
(retrograde 60, stationary 45, fast direct 30, slow direct 15) rather than the
classical seeghrocha method, because the mean-longitude elements it needs are not
exposed by the ephemeris module. This is the largest remaining approximation in
śaḍbala.

Because Varṣa, Māsa and Yuddha are absent, totals still read slightly low, so
comparisons against `requiredRupas` remain conservative.
