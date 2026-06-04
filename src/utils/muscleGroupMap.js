const MAP = {
  glutes:      { primary: ['tfl', 'quads_outer'],              secondary: ['hip_flexors'] },
  core:        { primary: ['abs_upper', 'obliques'],            secondary: ['hip_flexors'] },
  legs:        { primary: ['quads_center', 'quads_outer'],      secondary: ['calves', 'tibialis'] },
  'upper body': { primary: ['chest', 'deltoid', 'biceps'],      secondary: ['serratus', 'forearms'] },
  upper_body:  { primary: ['chest', 'deltoid', 'biceps'],       secondary: ['serratus', 'forearms'] },
  full_body:   { primary: ['deltoid','biceps','forearms','obliques','tfl','quads_outer','tibialis',
                            'trapezius','chest','serratus','abs_upper','hip_flexors','quads_center','calves'],
                 secondary: [] },
  arms:        { primary: ['biceps', 'forearms'],               secondary: ['deltoid'] },
  flexibility: { primary: ['hip_flexors', 'obliques'],          secondary: ['quads_center'] },
  recovery:    { primary: ['obliques'],                         secondary: ['hip_flexors', 'calves'] },
}

export function mapFocusToMuscles(focusArea) {
  const key = (focusArea ?? '').toLowerCase()
  return MAP[key] ?? MAP[key.replace(/ /g, '_')] ?? { primary: [], secondary: [] }
}
