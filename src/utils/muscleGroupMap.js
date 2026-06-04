const MAP = {
  core:        { primary: ['core'],                             secondary: [] },
  glutes:      { primary: ['glutes'],                           secondary: ['hamstrings'] },
  arms:        { primary: ['arms', 'shoulders'],                secondary: ['forearms'] },
  full_body:   { primary: ['full_body'],                        secondary: [] },
  flexibility: { primary: ['core', 'quads', 'hamstrings'],      secondary: ['calves'] },
  recovery:    { primary: ['core'],                             secondary: ['quads', 'hamstrings', 'calves'] },
  back:        { primary: ['back', 'shoulders'],                secondary: ['arms', 'core'] },
  legs:        { primary: ['quads', 'hamstrings'],              secondary: ['calves', 'glutes'] },
  upper_body:  { primary: ['shoulders', 'chest', 'arms'],       secondary: ['forearms'] },
  'upper body':{ primary: ['shoulders', 'chest', 'arms'],       secondary: ['forearms'] },
  hamstrings:  { primary: ['hamstrings', 'glutes'],             secondary: ['calves'] },
  chest:       { primary: ['chest'],                            secondary: ['shoulders', 'arms'] },
  shoulders:   { primary: ['shoulders'],                        secondary: ['chest', 'arms'] },
  quads:       { primary: ['quads'],                            secondary: ['glutes'] },
  calves:      { primary: ['calves'],                           secondary: ['quads'] },
}

export function focusToMuscles(focusArea) {
  const key = (focusArea ?? '').toLowerCase()
  return MAP[key] ?? MAP[key.replace(/ /g, '_')] ?? { primary: [], secondary: [] }
}
