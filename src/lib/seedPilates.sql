-- ─────────────────────────────────────────────────────────────────────────
-- Athena Pilates — full seed (paste into Supabase SQL editor, run once)
-- ─────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  s_id uuid;
BEGIN

-- ══════════════════════════════════════════════════════════════
-- SESSIONS  (20 total — 5 per phase)
-- ══════════════════════════════════════════════════════════════

-- ── MENSTRUAL ────────────────────────────────────────────────

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Gentle Restoration Flow','A nurturing session for the menstrual phase. Gentle movements to ease cramping and lower back tension without depleting energy.','menstrual','recovery',15,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Constructive Rest',1,NULL,90,10,'Lie on your back, knees bent, feet flat. Allow your spine to soften into the mat. Breathe deeply and let gravity support you.',1,'recovery'),
(s_id,'Supine Knee Circles',1,8,NULL,20,'Draw one knee toward your chest and trace slow circles. Keep your lower back heavy on the mat. Switch legs. Move with your breath.',2,'recovery'),
(s_id,'Gentle Spinal Twist',1,NULL,45,15,'From your back, let both knees fall gently to one side. Extend opposite arm. Breathe into the stretch. Switch sides.',3,'flexibility'),
(s_id,'Child''s Pose',1,NULL,90,10,'Sit back toward your heels, arms extended forward. Let your forehead release toward the mat. Breathe into your lower back.',4,'recovery'),
(s_id,'Hip Flexor Supine',1,NULL,45,15,'Lying on your back, draw one knee to chest while keeping the other leg long. Feel the release along the front of the extended hip.',5,'flexibility');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Spinal Release & Breathe','A therapeutic practice focusing on spinal mobility and breath awareness. Ideal when your body is calling for gentleness and inward attention.','menstrual','flexibility',30,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Diaphragmatic Breathing',1,NULL,120,10,'One hand on belly, one on chest. Breathe to expand the belly first, then the chest. Exhale fully. Three counts in, four counts out.',1,'recovery'),
(s_id,'Knee Fold with Breath',2,8,NULL,20,'On an exhale, float one knee up to tabletop. Inhale at the top. Exhale to lower. The movement comes from the core, not momentum.',2,'core'),
(s_id,'Spine Articulation',2,6,NULL,30,'From standing, nod your head and slowly peel your spine forward vertebra by vertebra. Slowly rebuild from the base up.',3,'flexibility'),
(s_id,'Cat-Cow Stretch',1,10,NULL,20,'On hands and knees, inhale to drop belly and lift head. Exhale to arch back and tuck chin. Move with your breath.',4,'flexibility'),
(s_id,'Mermaid Side Stretch',1,NULL,45,15,'Sitting with legs folded, reach one arm up and over. Breathe into the side of your ribs. Keep both sit bones grounded.',5,'flexibility'),
(s_id,'Figure Four Stretch',1,NULL,60,15,'Lying on back, cross one ankle over the opposite knee. Flex the top foot. Breathe into the outer hip.',6,'flexibility');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Restorative Mat Session','A fully restorative practice that allows you to honor your need for rest. Gentle supine movements and conscious breathing throughout.','menstrual','recovery',45,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Full Body Scan',1,NULL,120,10,'Working from feet to crown, systematically release each body part. No movement — only presence and breath.',1,'recovery'),
(s_id,'Knee Circles',1,8,NULL,20,'Draw both knees to chest and circle them slowly together. Feel your lower back press into and release from the mat.',2,'recovery'),
(s_id,'Supine Twist',1,NULL,60,15,'Knees bent, allow them to fall to one side. Extend opposite arm. Stay 60 seconds, feeling tension melt with each exhale.',3,'flexibility'),
(s_id,'Legs Up Rest',1,NULL,180,10,'Rest legs up a wall. Allow your lower back to soften. Promotes circulation and eases heavy legs. Breathe slowly.',4,'recovery'),
(s_id,'Child''s Pose with Breath',1,NULL,90,15,'Actively breathe into your back body. Feel lower back and ribs expand on each inhale. Sink deeper on each exhale.',5,'recovery'),
(s_id,'Gentle Neck Release',1,NULL,45,15,'Lying on your back, slowly tilt ear toward shoulder. Place hand gently on same side of head for light traction.',6,'flexibility'),
(s_id,'Savasana',1,NULL,120,0,'Release all effort. Feel the weight of your body supported completely by the mat. Simply be.',7,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Pelvic Floor Reset','Focused breathwork and subtle core engagement to support your pelvic floor during menstruation. Light, intentional movement.','menstrual','core',20,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Breath Awareness',1,NULL,90,10,'Lie on your back, knees bent. On each exhale notice a natural lift through your pelvic floor. Soften on the inhale.',1,'core'),
(s_id,'Kegel Contractions',3,10,NULL,30,'Gently draw up through the pelvic floor. Hold 3 seconds, then release fully. Breathe throughout. The release is as important as the contraction.',2,'core'),
(s_id,'Supine Hip Lifts',2,8,NULL,30,'Feet flat, exhale and press through feet to lift hips slightly. Hold briefly. Slowly lower on the inhale.',3,'core'),
(s_id,'Happy Baby',1,NULL,60,15,'Draw both knees wide toward armpits, hold outer edges of feet. Let the pelvic floor completely release.',4,'flexibility'),
(s_id,'Breathing Close',1,NULL,90,0,'Return to breath awareness. On each exhale a gentle lift. On each inhale a conscious release. Let this become natural.',5,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Supine Surrender Flow','Flowing movements entirely on your back. A beautiful session for days when you want to move but stay close to the earth.','menstrual','flexibility',30,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Supine Foot Flex Series',1,10,NULL,20,'Flex and point each foot, then circle through the ankle both directions. Keep your breath steady throughout.',1,'flexibility'),
(s_id,'Single Leg Lift',2,8,NULL,30,'Float one leg to the ceiling on an exhale. Pelvis absolutely still. Inhale at top, exhale to lower with control.',2,'core'),
(s_id,'Windmill Legs',2,6,NULL,30,'Both legs to ceiling, slowly lower as far as your lower back stays anchored. Inhale down, exhale up.',3,'flexibility'),
(s_id,'Supine Spinal Twist',1,NULL,45,20,'Both knees fall to one side. Arms open wide. Breathe. On each exhale soften further.',4,'flexibility'),
(s_id,'Bridge Pose',3,8,NULL,30,'Feet flat, press through feet to lift hips to a diagonal. Squeeze glutes at top. Lower one vertebra at a time.',5,'glutes'),
(s_id,'Savasana Flow Close',1,NULL,90,0,'End in complete rest. Notice how your body feels after movement. Breathe without effort.',6,'recovery');

-- ── FOLLICULAR ───────────────────────────────────────────────

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Rising Energy Core','As your energy returns in the follicular phase, this session builds core foundation with classical Pilates exercises.','follicular','core',30,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Pelvic Tilt',2,10,NULL,20,'Gently tilt your pelvis to flatten lower back into mat on exhale, release to natural curve on inhale. Small, precise movement.',1,'core'),
(s_id,'Knee Fold Single Leg',3,8,NULL,25,'Float one knee to tabletop on exhale. Deep abdominals initiate the movement. Pelvis level and lower back connected to mat.',2,'core'),
(s_id,'Hundred Prep',1,NULL,60,30,'Curl head and shoulders off mat. Hover arms just above mat. Pump arms 5 counts inhale, 5 counts exhale.',3,'core'),
(s_id,'Roll Up',3,5,NULL,30,'Lie flat, arms overhead. Exhale — nod head, peel spine off mat. Inhale at top. Exhale to reverse, melting back down.',4,'core'),
(s_id,'Single Leg Stretch',3,8,NULL,30,'Curl up. Draw one knee in while extending the other. Switch in flowing motion. Inhale 2 switches, exhale 2.',5,'core'),
(s_id,'Criss Cross',3,10,NULL,30,'Rotate to draw one elbow toward opposite knee. Extend other leg. Change sides in controlled rhythm.',6,'core');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Glute Awakening','Your growing strength in the follicular phase makes this ideal for activating and building your glutes.','follicular','glutes',30,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Bridge Lift',3,12,NULL,30,'Feet flat and parallel. Press through heels to lift hips to a diagonal. Squeeze glutes at top.',1,'glutes'),
(s_id,'Single Leg Bridge',3,8,NULL,30,'In bridge, extend one leg to ceiling. Maintain level hips. Lower and lift supporting hip.',2,'glutes'),
(s_id,'Clam Shell',3,12,NULL,25,'Lying on side, feet together, knees at 45 degrees. Rotate top knee open. Movement is in the hip, not the waist.',3,'glutes'),
(s_id,'Donkey Kick',3,10,NULL,25,'On all fours, flex foot and press heel toward ceiling, knee at 90 degrees. Squeeze glute at top.',4,'glutes'),
(s_id,'Fire Hydrant',3,10,NULL,25,'From all fours, lift one knee directly out to side. Torso and pelvis do not shift.',5,'glutes'),
(s_id,'Bridge Pulse',3,15,NULL,30,'Hold hips at bridge height and pulse upward with small rapid movements. Keep glutes contracted.',6,'glutes');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Full Body Foundation','A comprehensive intermediate session covering all muscle groups. Your follicular energy supports sustained effort.','follicular','full_body',45,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Roll Down Warm Up',2,5,NULL,20,'From standing, nod head and peel spine forward vertebra by vertebra. Hang heavy, then rebuild from base.',1,'flexibility'),
(s_id,'Hundred',1,NULL,90,30,'Curl to consistent height. Legs in tabletop or extended to 45 degrees. Pump arms 5 in, 5 out.',2,'core'),
(s_id,'Leg Circle',2,5,NULL,30,'One leg to ceiling, stabilize torso. Circle the leg across midline, down, around, and back up.',3,'core'),
(s_id,'Side Kick Series',2,8,NULL,30,'Lying on side, kick top leg forward on double inhale, sweep back on exhale. Torso completely stable.',4,'glutes'),
(s_id,'Push Up',3,8,NULL,30,'From plank, bend elbows at 45-degree angle to body. Lower with control. Press away to return.',5,'arms'),
(s_id,'Teaser Prep',3,5,NULL,35,'From your back, roll up to a V position with knees bent. Hold briefly. Lower back down with control.',6,'core'),
(s_id,'Swan Dive Prep',3,5,NULL,30,'Lying on belly, press through hands to lift upper body. Use back extensors, not arms.',7,'full_body'),
(s_id,'Child''s Pose Close',1,NULL,60,0,'Sit back into child''s pose. Let all effort dissolve. Breathe freely.',8,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Arm & Shoulder Sculpt','Upper body strength and tone using your bodyweight. Rising estrogen makes follicular ideal for building upper body endurance.','follicular','arms',30,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Chest Expansion',3,10,NULL,25,'Arms forward. Sweep arms back, squeezing shoulder blades together. Hold briefly. Return with control.',1,'arms'),
(s_id,'Pilates Push Up',3,8,NULL,35,'Lower with a perfectly rigid plank. Elbows track past your ribs. Press the mat away with equal force.',2,'arms'),
(s_id,'Tricep Dip',3,10,NULL,30,'Seated with hands behind you, fingers forward. Bend elbows to lower hips. Press through palms to lift.',3,'arms'),
(s_id,'Thread the Needle',2,8,NULL,25,'On hands and knees, thread one arm under body, rotating thoracic spine. Focus on spinal rotation.',4,'arms'),
(s_id,'Plank Hold',1,NULL,45,30,'Hold a perfect plank. Wrists under shoulders, hips level. Press the mat away. Draw navel in.',5,'arms'),
(s_id,'Cobra Press',3,8,NULL,25,'Lying on belly, press through hands to lift chest. Use back extensors, arms only assisting.',6,'arms');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Dynamic Stretch & Tone','A flowing session combining dynamic stretching with toning. Great for exploring range of motion.','follicular','flexibility',20,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Standing Roll Down',2,5,NULL,20,'Nod head and let its weight take your spine into a forward curl. Breathe at bottom. Rebuild slowly.',1,'flexibility'),
(s_id,'Lunge Hip Flexor',1,NULL,45,20,'Deep lunge, back knee lowered. Shift weight forward until you feel stretch in front of back hip.',2,'flexibility'),
(s_id,'World''s Greatest Stretch',2,5,NULL,25,'From a lunge, plant same-side hand inside front foot. Rotate opposite arm to sky.',3,'flexibility'),
(s_id,'Leg Pull Front',2,6,NULL,30,'In a plank, lift one leg with pointed toe. Rock forward and back through your toes.',4,'full_body'),
(s_id,'Pigeon Stretch',1,NULL,60,15,'Bring one shin forward parallel to mat''s short edge. Lower forward over front shin. Breathe into outer hip.',5,'flexibility');

-- ── OVULATION ────────────────────────────────────────────────

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Peak Power Core','Your peak energy phase calls for advanced core work. This session maximizes core strength and endurance.','ovulation','core',45,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Hundred',1,NULL,90,30,'Full classical hundred: curl high, legs extended to 45 degrees. Pump arms for 100 counts.',1,'core'),
(s_id,'Roll Up',4,8,NULL,25,'Classical roll up — arms overhead to start. Articulate through every vertebra both up and down.',2,'core'),
(s_id,'Single Leg Stretch',4,10,NULL,25,'Alternating single leg stretch. Both elbows wide. Maintain a consistent deep curl throughout.',3,'core'),
(s_id,'Double Leg Stretch',4,10,NULL,25,'Draw both knees in, exhale extend both legs and arms. Circle arms around to gather knees in.',4,'core'),
(s_id,'Criss Cross',4,12,NULL,25,'Rotate deeply as you extend each leg. Hold each position briefly before switching.',5,'core'),
(s_id,'Teaser',3,5,NULL,40,'Simultaneously lift both legs and torso to form a perfect V. Hold at top. Roll down slowly.',6,'core'),
(s_id,'Plank to Downdog',3,8,NULL,30,'From plank, exhale to push back through downward-facing dog. Inhale forward to plank.',7,'core');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Total Body Burn','Your most powerful session. Advanced full-body Pilates designed for ovulation''s peak energy.','ovulation','full_body',45,'advanced','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Warm Up Flow',1,8,NULL,20,'Cat-cow to child''s pose to downdog: flow 8 times to prepare your body for intensity ahead.',1,'full_body'),
(s_id,'Hundred Advanced',1,NULL,100,30,'Full hundred with legs fully extended low to mat. The lower the legs, the more abdominal work.',2,'core'),
(s_id,'Jackknife',3,5,NULL,40,'Roll legs overhead then press them straight to ceiling. Lower hips back down with control.',3,'core'),
(s_id,'Control Balance',3,4,NULL,40,'In shoulder stand, hold one leg vertical and lower other toward mat. Alternate with control.',4,'full_body'),
(s_id,'Side Kick Kneeling',3,10,NULL,30,'Kneel with one hand on mat. Lift opposite leg to hip height and kick forward and back.',5,'glutes'),
(s_id,'Push Up Series',4,10,NULL,30,'Classical Pilates push ups. Between sets, walk hands back to feet and roll up to standing.',6,'arms'),
(s_id,'Full Teaser Hold',1,NULL,30,40,'Hold the teaser V-position for 30 seconds. Breathe. Find balance between effort and ease.',7,'core'),
(s_id,'Cool Down Roll',1,6,NULL,15,'Lie on back, hug knees, roll side to side on your spine. Breathe freely.',8,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Glute Sculptor','An intermediate glute session that takes advantage of your peak strength capacity at ovulation.','ovulation','glutes',30,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Heel Press Series',3,15,NULL,25,'Face down, press one heel toward ceiling, knee bent. Squeeze glute maximally at top.',1,'glutes'),
(s_id,'Bridge with Abduction',3,10,NULL,30,'In bridge, open both knees outward against gravity, then squeeze back together. Hips stay lifted.',2,'glutes'),
(s_id,'Arabesque Pulses',3,20,NULL,25,'On all fours, extend one leg straight behind. Pulse upward with small rapid movements.',3,'glutes'),
(s_id,'Prone Hip Extension',3,8,NULL,30,'Lying face down, alternate pressing one leg higher than the other. Both glutes working.',4,'glutes'),
(s_id,'Standing Balance Kick',3,8,NULL,30,'Standing on one leg, hinge forward and extend opposite leg behind in standing arabesque.',5,'glutes'),
(s_id,'Bridge Hold & Squeeze',1,NULL,45,30,'Hold bridge at maximum height and squeeze glutes as hard as you can for 45 seconds.',6,'glutes');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Strong Arms & Back','Build impressive upper body strength using only the mat. Ovulation energy sustains the intensity.','ovulation','arms',30,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Lat Pull Down Reach',3,10,NULL,25,'Reach both arms overhead. Draw them down as if pulling a bar, squeezing shoulder blades.',1,'arms'),
(s_id,'Superman Hold',1,NULL,45,30,'Simultaneously lift arms, chest, and legs off mat. Hold. Back extensors, glutes, and shoulders all work.',2,'arms'),
(s_id,'Tricep Push Up',3,10,NULL,30,'Narrow push up with elbows tracking past hips. This variation maximally loads the triceps.',3,'arms'),
(s_id,'Swimming',1,NULL,60,25,'Face down, lift opposite arm and leg simultaneously. Alternate in a rapid flutter.',4,'full_body'),
(s_id,'Side Plank',1,NULL,30,30,'Support on one hand and outer edge of foot. Body forms one straight diagonal line.',5,'arms'),
(s_id,'Down Dog Push Up',3,8,NULL,30,'From downward dog, lower head toward mat by bending elbows. Press back to downdog.',6,'arms');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Athletic Flow','Advanced dynamic movement linking breath, core, and flow. Builds athleticism and body awareness.','ovulation','full_body',30,'advanced','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Standing Warm Up Flow',1,NULL,90,15,'Roll downs, arm circles, hip circles, and deep lunges. Move freely for 90 seconds.',1,'full_body'),
(s_id,'Plank Flow Series',3,8,NULL,30,'Plank → pike push up → downdog → single leg downdog → plank. Each transition controlled and fluid.',2,'full_body'),
(s_id,'Jumping Lunges',3,10,NULL,35,'From a lunge, jump and switch legs in the air. Land softly absorbing impact through bent knee.',3,'full_body'),
(s_id,'Rolling Like a Ball',3,8,NULL,20,'Balance on sit bones, spine in C-curve. Roll back to shoulder blades and roll back up to balance.',4,'core'),
(s_id,'Boomerang',3,4,NULL,40,'Advanced sequence moving from roll up through overhead leg crossing to balance and stretching.',5,'full_body'),
(s_id,'Full Body Burn Out',1,NULL,60,30,'Alternate 10 seconds maximum effort plank reaches with 10 seconds active recovery in child''s pose. Six rounds.',6,'full_body');

-- ── LUTEAL ───────────────────────────────────────────────────

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Grounding Evening Flow','As energy turns inward, this session anchors you in calm, grounding movement. Perfect for evenings.','luteal','flexibility',30,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Seated Breath Work',1,NULL,120,10,'Breathe in for 4 counts, hold for 4, exhale for 6. The longer exhale activates the parasympathetic nervous system.',1,'recovery'),
(s_id,'Cat-Cow Slow',1,10,NULL,20,'Move at half your normal speed. Linger at each end of the movement. Let this be a moving meditation.',2,'flexibility'),
(s_id,'Seated Spinal Rotation',2,8,NULL,25,'Sitting tall, arms crossed on chest. Slowly rotate upper body to one side on exhale, return on inhale.',3,'flexibility'),
(s_id,'Mermaid Deep Stretch',1,NULL,60,20,'Fully inhabit this lateral stretch. Breathe into the side of your ribs. Feel the space you are creating.',4,'flexibility'),
(s_id,'Hip Flexor Release',1,NULL,60,20,'In kneeling lunge, shift weight forward until stretch at front of back hip. Let go completely.',5,'flexibility'),
(s_id,'Supine Release',1,NULL,120,0,'Lie flat on your back. Legs fall naturally apart. Close your eyes. Let the mat support you completely.',6,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Mindful Core & Breathe','Intentional core work paired with deep breathing for the luteal phase. Strength without overstimulation.','luteal','core',30,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Breath Foundation',1,NULL,90,15,'Lying on your back, find the natural breath-to-core connection. Let the breath lead every movement.',1,'core'),
(s_id,'Pelvic Tilt Series',3,10,NULL,25,'Move slowly between pelvic tilt and neutral spine. Find every gradation between these two positions.',2,'core'),
(s_id,'Slow Hundred',1,NULL,100,35,'Hundred at half speed. Focus on quality of breath, depth of curl, consistency of arm pump.',3,'core'),
(s_id,'Roll Up Slow',3,6,NULL,35,'Take 8 full seconds to roll up and 8 full seconds to roll back down. Pure abdominal control.',4,'core'),
(s_id,'Scissors Controlled',3,8,NULL,30,'Both legs to ceiling. Slowly lower one leg toward mat while other stays vertical. No momentum.',5,'core'),
(s_id,'Savasana Integration',1,NULL,90,0,'Let go of all effort. Feel the intelligent core connection you have just cultivated.',6,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Hip & Glute Release','A longer session dedicated to releasing hip and glute tension — common in the luteal phase.','luteal','glutes',45,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Supine Hip Rotation',2,8,NULL,25,'Lying on back, allow one bent knee to trace large circles toward ceiling and back. Let the hip move freely.',1,'flexibility'),
(s_id,'Figure Four Stretch',1,NULL,90,20,'Cross ankle over knee. Draw legs in or place foot flat. Breathe into the outer hip and glute.',2,'flexibility'),
(s_id,'Bridge Hip Circles',3,6,NULL,30,'In bridge, slowly circle hips in a horizontal plane. Release compression while maintaining glute activation.',3,'glutes'),
(s_id,'Lateral Leg Swing',2,10,NULL,25,'Standing with support, swing one leg side to side. Let it be pendulum-like and free.',4,'glutes'),
(s_id,'Glute Stretch Prone',1,NULL,60,20,'Face down, bring one knee toward outside of hip. Breathe deeply into stretch across outer glute.',5,'flexibility'),
(s_id,'Wide Squat Hold',1,NULL,60,30,'Feet wide, toes turned out. Sink into deep squat. Place hands on inner thighs to gently open hips.',6,'flexibility'),
(s_id,'Rolling Close',1,5,NULL,0,'Lie on back and roll gently side to side. Feel the relief of all you have released.',7,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Wind Down Restoration','Gentle restorative movement for the late luteal phase. Release tension and prepare for your next cycle.','luteal','recovery',20,'beginner','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Progressive Relaxation',1,NULL,120,10,'Contract each muscle group for 3 seconds then completely release. Feet to crown. Feel the contrast.',1,'recovery'),
(s_id,'Supported Bridge Rest',1,NULL,90,15,'Place a pillow under hips in bridge. Hips passively supported. Promotes circulation. Simply breathe.',2,'recovery'),
(s_id,'Legs Up Rest',1,NULL,180,10,'Rest legs up a wall. Arms fall wide. Close your eyes. Active rest, conscious recovery.',3,'recovery'),
(s_id,'Savasana',1,NULL,120,0,'Complete stillness. Every muscle has permission to let go. Remain here as long as you need.',4,'recovery');

INSERT INTO pilates_sessions (title,description,phase,focus_area,duration_min,difficulty,equipment)
VALUES ('Intuitive Movement','A balanced full-body session for the luteal phase that moves with your body''s changing needs.','luteal','full_body',30,'intermediate','mat')
RETURNING id INTO s_id;
INSERT INTO pilates_exercises (session_id,name,sets,reps,duration_sec,rest_sec,form_cue,order_num,focus_area) VALUES
(s_id,'Body Awareness Check',1,NULL,60,10,'Close your eyes and check in with your body. Where do you carry tension? Let the answers inform your session.',1,'recovery'),
(s_id,'Fluid Spine Roll',2,6,NULL,20,'Roll your spine through all ranges: forward, back, side, and rotation. Move at the pace your body requests.',2,'flexibility'),
(s_id,'Modified Hundred',1,NULL,80,30,'Hundred at the intensity that feels right today. Legs in tabletop if needed. Stay connected to what you need.',3,'core'),
(s_id,'Intuitive Side Work',2,10,NULL,25,'Side-lying, move through side kick series at your pace. Let range of motion guide you.',4,'glutes'),
(s_id,'Upper Body Flow',2,8,NULL,30,'Move through push up variations and chest openers at a sustainable effort level.',5,'arms'),
(s_id,'Integration & Close',1,NULL,90,0,'Lie in savasana. Notice what you gave yourself today. Rest and receive the benefits.',6,'recovery');

-- ══════════════════════════════════════════════════════════════
-- CHALLENGES  (5 total)
-- ══════════════════════════════════════════════════════════════

INSERT INTO challenges (name,description,duration_days,sessions_required,phase,badge_name) VALUES
('7-Day Core Reset','One core session every day for a week to build deep abdominal strength.',7,7,NULL,'Core Warrior'),
('28-Day Foundations','A complete beginner''s journey through Pilates fundamentals.',28,20,NULL,'Foundation Builder'),
('Cycle Sync Challenge','Complete one phase-specific session per week for your full cycle.',28,8,NULL,'Cycle Syncer'),
('Menstrual Ease','Commit to gentle, restorative movement during your next menstrual phase.',7,4,'menstrual','Rest Warrior'),
('Ovulation Peak Power','Harness your peak energy with 5 challenging sessions during ovulation.',5,5,'ovulation','Peak Power');

END $$;
