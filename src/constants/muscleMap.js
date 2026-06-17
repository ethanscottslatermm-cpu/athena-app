export const MUSCLE_PAIRS = {
  traps:        ['traps_left',        'traps_right'],
  front_delts:  ['front_delts_left',  'front_delts_right'],
  chest:        ['chest_left',        'chest_right'],
  biceps:       ['biceps_left',       'biceps_right'],
  forearms:     ['forearms_left',     'forearms_right'],
  hips:         ['hip_left',          'hip_right'],
  inner_thigh:  ['inner_thigh_left',  'inner_thigh_right'],
  quads:        ['quads_left',        'quads_right'],
  outer_quad:   ['outer_quad_left',   'outer_quad_right'],
  inner_quad:   ['inner_quad_left',   'inner_quad_right'],
  shins:        ['shins_left',        'shins_right'],
  calves_inner: ['calves_inner_left', 'calves_inner_right'],
  wrists:       ['hand_left',         'hand_right'],
  knees:        ['knee_left',         'knee_right'],
  feet:         ['foot_left',         'foot_right'],
  upper_abs:    ['upper_abs'],
  mid_abs:      ['mid_abs'],
  lower_abs:    ['lower_abs'],
  obliques:     ['obliques'],
  v_cut:        ['v_cut'],
}

export const ALL_MUSCLE_KEYS = Object.keys(MUSCLE_PAIRS)

export const ID_TO_PAIR = {}
Object.entries(MUSCLE_PAIRS).forEach(([pair, ids]) => {
  ids.forEach(id => { ID_TO_PAIR[id] = pair })
})

export const MUSCLE_COLORS = {
  traps:        '#C9A86C',
  front_delts:  '#E8956D',
  chest:        '#C4859A',
  biceps:       '#A07BC4',
  forearms:     '#7BA8C4',
  upper_abs:    '#8FAF8A',
  mid_abs:      '#8FAF8A',
  lower_abs:    '#8FAF8A',
  obliques:     '#7A9F7A',
  v_cut:        '#6F8F6F',
  hips:         '#C4956A',
  inner_thigh:  '#9B7FA0',
  quads:        '#6A8FBF',
  outer_quad:   '#5A7FAF',
  inner_quad:   '#7A9FC9',
  shins:        '#8FAF9A',
  calves_inner: '#7A9F8A',
  wrists:       '#A09080',
  knees:        '#A09080',
  feet:         '#A09080',
}

export const MUSCLE_NAMES = {
  traps:        'Trapezius',
  front_delts:  'Front Delts',
  chest:        'Pectoralis',
  biceps:       'Biceps',
  forearms:     'Forearms',
  upper_abs:    'Upper Abs',
  mid_abs:      'Mid Abs',
  lower_abs:    'Lower Abs',
  obliques:     'Obliques',
  v_cut:        'Hip Flexors',
  hips:         'Hips',
  inner_thigh:  'Inner Thigh',
  quads:        'Quadriceps',
  outer_quad:   'Outer Quad',
  inner_quad:   'VMO',
  shins:        'Tibialis',
  calves_inner: 'Gastrocnemius',
  wrists:       'Wrists',
  knees:        'Knees',
  feet:         'Feet',
}

export const MUSCLE_ANATOMICAL = {
  traps:        'Trapezius',
  front_delts:  'Anterior Deltoid',
  chest:        'Pectoralis Major',
  biceps:       'Biceps Brachii',
  forearms:     'Brachioradialis',
  upper_abs:    'Rectus Abdominis (Upper)',
  mid_abs:      'Rectus Abdominis',
  lower_abs:    'Rectus Abdominis (Lower)',
  obliques:     'External Oblique',
  v_cut:        'Iliopsoas',
  hips:         'Tensor Fasciae Latae',
  inner_thigh:  'Adductor Magnus',
  quads:        'Quadriceps Femoris',
  outer_quad:   'Vastus Lateralis',
  inner_quad:   'Vastus Medialis',
  shins:        'Tibialis Anterior',
  calves_inner: 'Gastrocnemius',
  wrists:       'Flexor Carpi Radialis',
  knees:        'Patella Tendon',
  feet:         'Plantar Fascia',
}

export const PHASE_MUSCLES = {
  follicular: {
    primary:   ['quads', 'chest', 'front_delts', 'biceps'],
    secondary: ['outer_quad', 'traps', 'forearms'],
    avoid:     [],
    rationale: 'Estrogen is rising — ideal for strength and power work.',
  },
  ovulation: {
    primary:   ['outer_quad', 'hips', 'inner_thigh', 'calves_inner'],
    secondary: ['quads', 'shins', 'knees'],
    avoid:     [],
    rationale: 'Peak athletic performance — focus on explosive and cardio.',
  },
  luteal: {
    primary:   ['upper_abs', 'mid_abs', 'lower_abs', 'obliques', 'v_cut'],
    secondary: ['inner_thigh', 'hips'],
    avoid:     ['quads', 'chest'],
    rationale: 'Progesterone rising — core stability and controlled movement.',
  },
  menstrual: {
    primary:   ['shins', 'calves_inner', 'forearms', 'feet'],
    secondary: ['wrists', 'knees'],
    avoid:     ['quads', 'chest', 'front_delts'],
    rationale: 'Rest and restore — gentle movement and light mobility only.',
  },
}

export const PHASE_COLORS = {
  menstrual:  '#C4606A',
  follicular: '#8FAF8A',
  ovulation:  '#C9A86C',
  luteal:     '#9B7FA0',
}

// Map pilates session focus_area → MuscleMap pair keys
export const FOCUS_TO_MUSCLES = {
  core:        ['upper_abs', 'mid_abs', 'lower_abs', 'obliques', 'v_cut'],
  glutes:      ['hips', 'inner_thigh', 'outer_quad', 'inner_quad'],
  legs:        ['quads', 'outer_quad', 'inner_quad', 'inner_thigh', 'calves_inner', 'shins'],
  upper_body:  ['traps', 'chest', 'front_delts', 'biceps'],
  arms:        ['biceps', 'forearms', 'wrists', 'front_delts'],
  flexibility: ['hips', 'v_cut', 'obliques', 'inner_thigh'],
  recovery:    ['v_cut', 'obliques', 'calves_inner', 'feet'],
  full_body:   ['traps', 'chest', 'front_delts', 'biceps', 'upper_abs', 'mid_abs',
                'lower_abs', 'hips', 'quads', 'calves_inner'],
}

export const HEATMAP_OPACITY = (count) => {
  if (count === 0) return 0.06
  if (count === 1) return 0.25
  if (count === 2) return 0.45
  if (count === 3) return 0.65
  if (count === 4) return 0.82
  return 1.0
}
