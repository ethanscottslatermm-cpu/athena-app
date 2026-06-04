// viewBox matches body-model.png natural dimensions: 1536 × 2752
// Muscle paths are traced to this specific silhouette.
// public/images/pilates/body-model.png must be present for the base image.

const VW = 1536
const VH = 2752

const MUSCLE_PATHS = {
  shoulders: [
    // left deltoid cap
    'M 312,532 C 228,504 180,562 192,652 C 204,730 270,762 370,732 C 442,710 472,650 448,566 Z',
    // right deltoid cap (mirrored at x=768)
    'M 1224,532 C 1308,504 1356,562 1344,652 C 1332,730 1266,762 1166,732 C 1094,710 1064,650 1088,566 Z',
  ],
  chest: [
    'M 482,548 C 400,610 372,742 384,878 C 396,992 454,1062 768,1082 C 1082,1062 1140,992 1152,878 C 1164,742 1136,610 1054,548 C 988,502 878,484 768,484 C 658,484 548,502 482,548 Z',
  ],
  core: [
    'M 476,1078 C 402,1122 376,1212 386,1308 C 396,1382 450,1422 768,1437 C 1086,1422 1140,1382 1150,1308 C 1160,1212 1134,1122 1060,1078 C 994,1040 882,1022 768,1022 C 654,1022 542,1040 476,1078 Z',
  ],
  arms: [
    // left upper arm (bicep / deltoid to elbow)
    'M 217,560 C 154,604 124,716 138,850 C 152,964 224,1014 320,992 C 380,972 406,908 392,808 C 378,712 336,592 280,560 Z',
    // right upper arm
    'M 1319,560 C 1382,604 1412,716 1398,850 C 1384,964 1312,1014 1216,992 C 1156,972 1130,908 1144,808 C 1158,712 1200,592 1256,560 Z',
  ],
  forearms: [
    // left forearm (elbow to wrist/hand)
    'M 170,990 C 110,1044 84,1150 98,1270 C 112,1374 170,1418 274,1398 C 334,1378 356,1314 340,1218 C 324,1126 280,1010 226,984 Z',
    // right forearm
    'M 1366,990 C 1426,1044 1452,1150 1438,1270 C 1424,1374 1366,1418 1262,1398 C 1202,1378 1180,1314 1196,1218 C 1212,1126 1256,1010 1310,984 Z',
  ],
  // back uses chest + core zones (front-view placeholder)
  back: [
    'M 482,548 C 400,610 372,742 384,878 C 396,992 454,1062 768,1082 C 1082,1062 1140,992 1152,878 C 1164,742 1136,610 1054,548 C 988,502 878,484 768,484 C 658,484 548,502 482,548 Z',
    'M 476,1078 C 402,1122 376,1212 386,1308 C 396,1382 450,1422 768,1437 C 1086,1422 1140,1382 1150,1308 C 1160,1212 1134,1122 1060,1078 C 994,1040 882,1022 768,1022 C 654,1022 542,1040 476,1078 Z',
  ],
  glutes: [
    'M 370,1410 C 292,1482 266,1584 284,1672 C 302,1746 372,1792 768,1810 C 1164,1792 1234,1746 1252,1672 C 1270,1584 1244,1482 1166,1410 C 1080,1338 926,1306 768,1306 C 610,1306 456,1338 370,1410 Z',
  ],
  quads: [
    // left front thigh
    'M 312,1792 C 254,1864 230,1970 246,2082 C 262,2180 324,2224 434,2212 C 504,2202 534,2156 520,2058 C 506,1966 466,1854 414,1814 Z',
    // right front thigh
    'M 1224,1792 C 1282,1864 1306,1970 1290,2082 C 1274,2180 1212,2224 1102,2212 C 1032,2202 1002,2156 1016,2058 C 1030,1966 1070,1854 1122,1814 Z',
  ],
  // hamstrings share the thigh zone (front-facing silhouette)
  hamstrings: [
    'M 312,1792 C 254,1864 230,1970 246,2082 C 262,2180 324,2224 434,2212 C 504,2202 534,2156 520,2058 C 506,1966 466,1854 414,1814 Z',
    'M 1224,1792 C 1282,1864 1306,1970 1290,2082 C 1274,2180 1212,2224 1102,2212 C 1032,2202 1002,2156 1016,2058 C 1030,1966 1070,1854 1122,1814 Z',
  ],
  calves: [
    // left calf
    'M 270,2220 C 220,2294 202,2410 220,2522 C 236,2618 292,2660 404,2648 C 470,2638 494,2594 478,2496 C 462,2402 422,2266 368,2234 Z',
    // right calf
    'M 1266,2220 C 1316,2294 1334,2410 1316,2522 C 1300,2618 1244,2660 1132,2648 C 1066,2638 1042,2594 1058,2496 C 1074,2402 1114,2266 1168,2234 Z',
  ],
}

const ALL_ZONES = Object.keys(MUSCLE_PATHS)

export default function BodyMuscleMap({
  activeMuscles = [],
  secondaryMuscles = [],
  height = 220,
  showLegend = true,
}) {
  const expand = (arr) => arr.includes('full_body') ? ALL_ZONES : arr

  const primary   = expand(activeMuscles)
  const secondary = expand(secondaryMuscles).filter(z => !primary.includes(z))

  function zoneStyle(zone) {
    if (primary.includes(zone))   return { opacity: 0.55, filter: 'url(#muscle-glow)' }
    if (secondary.includes(zone)) return { opacity: 0.28, filter: 'url(#muscle-glow)' }
    return { opacity: 0 }
  }

  const legendZones = [...new Set([...primary, ...secondary])]
    .filter(z => z !== 'full_body' && MUSCLE_PATHS[z])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>

      {/* PNG + SVG overlay scale together inside this relative wrapper */}
      <div style={{ position: 'relative', height, display: 'inline-block' }}>
        <img
          src="/images/pilates/body-model.png"
          alt=""
          style={{
            height: '100%',
            width: 'auto',
            display: 'block',
            userSelect: 'none',
            // multiply removes any white/grey background pixels (leaves only opaque silhouette)
            mixBlendMode: 'multiply',
            // recolor opaque pixels from black → warm brown (#6B5A52)
            filter: 'url(#silhouette-color)',
          }}
          draggable={false}
        />

        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{
            position: 'absolute',
            top: 0, left: 0,
            width: '100%', height: '100%',
          }}
        >
          <defs>
            {/* Recolor silhouette: fills opaque source pixels with warm brown */}
            <filter id="silhouette-color" x="0" y="0" width="100%" height="100%">
              <feFlood floodColor="#6B5A52" floodOpacity="1" result="color"/>
              <feComposite in="color" in2="SourceAlpha" operator="in"/>
            </filter>

            <filter id="muscle-glow" x="-30%" y="-10%" width="160%" height="120%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="28" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {Object.entries(MUSCLE_PATHS).map(([zone, paths]) => {
            const s = zoneStyle(zone)
            return paths.map((d, i) => (
              <path
                key={`${zone}-${i}`}
                d={d}
                fill="#C4859A"
                opacity={s.opacity}
                filter={s.filter}
                style={{ transition: 'opacity 0.3s ease-in-out' }}
              />
            ))
          })}
        </svg>
      </div>

      {/* Legend pills */}
      {showLegend && legendZones.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
          {legendZones.map(zone => {
            const isPrimary = primary.includes(zone)
            return (
              <span
                key={zone}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 20,
                  background: isPrimary ? 'rgba(196,133,154,0.14)' : 'rgba(196,133,154,0.07)',
                  border: `1px solid rgba(196,133,154,${isPrimary ? '0.35' : '0.2'})`,
                  fontFamily: 'Cinzel, serif', fontSize: 8,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: isPrimary ? '#C4859A' : 'rgba(196,133,154,0.6)',
                  transition: 'all 0.3s ease',
                }}
              >
                <span style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: '#C9A86C', display: 'inline-block',
                  opacity: isPrimary ? 1 : 0.5,
                }} />
                {zone.replace(/_/g, ' ')}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
