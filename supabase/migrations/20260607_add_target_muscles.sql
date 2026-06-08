-- Add target_muscles column to pilates_sessions
ALTER TABLE pilates_sessions
  ADD COLUMN IF NOT EXISTS target_muscles text[] DEFAULT '{}';

-- Seed target_muscles based on existing focus_area values
UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_deltoid-left','muscle_deltoid-right',
  'muscle_trapezius-left','muscle_trapezius-right',
  'muscle_pectorals-left','muscle_pectorals-right',
  'muscle_bicep-left','muscle_bicep-right',
  'muscle_forearm-inner-left','muscle_forearm-outer-left',
  'muscle_forearm-inner-right','muscle_forearm-outer-right',
  'muscle_abs-upper-left','muscle_abs-upper-right',
  'muscle_abs-mid-left','muscle_abs-mid-right',
  'muscle_abs-lower-left','muscle_abs-lower-right',
  'muscle_oblique-left','muscle_oblique-right',
  'muscle_hip-flexor-left','muscle_hip-flexor-right',
  'muscle_tfl-left','muscle_tfl-right',
  'muscle_adductor-left','muscle_adductor-right',
  'muscle_quad-inner-left','muscle_quad-inner-right',
  'muscle_quad-outer-left','muscle_quad-outer-right',
  'muscle_calf-left','muscle_calf-right',
  'muscle_tibialis-left','muscle_tibialis-right'
]
WHERE focus_area IN ('full_body', 'full body');

UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_abs-upper-left','muscle_abs-upper-right',
  'muscle_abs-mid-left','muscle_abs-mid-right',
  'muscle_abs-lower-left','muscle_abs-lower-right',
  'muscle_oblique-left','muscle_oblique-right',
  'muscle_hip-flexor-left','muscle_hip-flexor-right'
]
WHERE focus_area = 'core';

UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_tfl-left','muscle_tfl-right',
  'muscle_quad-outer-left','muscle_quad-outer-right',
  'muscle_hip-flexor-left','muscle_hip-flexor-right'
]
WHERE focus_area = 'glutes';

UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_quad-inner-left','muscle_quad-inner-right',
  'muscle_quad-outer-left','muscle_quad-outer-right',
  'muscle_adductor-left','muscle_adductor-right',
  'muscle_calf-left','muscle_calf-right',
  'muscle_tibialis-left','muscle_tibialis-right'
]
WHERE focus_area = 'legs';

UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_deltoid-left','muscle_deltoid-right',
  'muscle_trapezius-left','muscle_trapezius-right',
  'muscle_pectorals-left','muscle_pectorals-right',
  'muscle_bicep-left','muscle_bicep-right'
]
WHERE focus_area IN ('upper_body', 'upper body');

UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_bicep-left','muscle_bicep-right',
  'muscle_forearm-inner-left','muscle_forearm-outer-left',
  'muscle_forearm-inner-right','muscle_forearm-outer-right',
  'muscle_deltoid-left','muscle_deltoid-right'
]
WHERE focus_area = 'arms';

UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_hip-flexor-left','muscle_hip-flexor-right',
  'muscle_oblique-left','muscle_oblique-right',
  'muscle_quad-inner-left','muscle_quad-inner-right'
]
WHERE focus_area = 'flexibility';

UPDATE pilates_sessions SET target_muscles = ARRAY[
  'muscle_oblique-left','muscle_oblique-right',
  'muscle_hip-flexor-left','muscle_hip-flexor-right',
  'muscle_calf-left','muscle_calf-right'
]
WHERE focus_area = 'recovery';
