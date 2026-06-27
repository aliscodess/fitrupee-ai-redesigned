import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Flame, Activity } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const journeys = [
  {
    id: 'weightloss', label: 'Weight Loss', tagline: 'Burn it. Own it.',
    desc: 'AI-curated cardio + deficit meal plans that work with Indian ingredients.',
    img: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&q=80',
    accent: '#ef4444', badge: 'Fat Burn',
  },
  {
    id: 'musclegain', label: 'Muscle Gain', tagline: 'Lift. Eat. Grow.',
    desc: 'Progressive overload plans paired with high-protein budget meals.',
    img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    accent: '#f97316', badge: 'Strength',
  },
  {
    id: 'wellness', label: 'General Wellness', tagline: 'Move. Breathe. Thrive.',
    desc: 'Yoga, mobility work, and clean eating for lasting daily energy.',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    accent: '#6b7c3a', badge: 'Wellness',
  },
];

const features = [
  { label: 'AI Workout Generator', desc: 'Personalized plans built around your body, schedule, and equipment.', bg: '#eef1e0', emoji: '🧠' },
  { label: 'Smart Meal Planner',   desc: 'Nutrition plans using affordable Indian ingredients you can find anywhere.', bg: '#d1fae5', emoji: '🍽️' },
  { label: 'Calorie Tracker',      desc: 'Log food instantly with image recognition. Know what you eat.', bg: '#ffedd5', emoji: '🔥' },
  { label: 'Progress Dashboard',   desc: 'Visual charts of weight, strength, and nutrition over time.', bg: '#dbeafe', emoji: '📊' },
  { label: 'Fitness Assistant',    desc: 'Ask anything — your AI coach answers 24/7.', bg: '#fce7f3', emoji: '💬' },
  { label: 'Goal-Based Training',  desc: 'Fat loss, muscle, or mobility — your plan adapts to you.', bg: '#fef3c7', emoji: '🎯' },
];

const foods = [
  { name: 'Quinoa Power Bowl', cal: 420, protein: 28, carbs: 48, img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80' },
  { name: 'Green Smoothie',    cal: 210, protein: 8,  carbs: 38, img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&q=80' },
  { name: 'Acai Berry Bowl',   cal: 290, protein: 10, carbs: 44, img: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=500&q=80' },
  { name: 'Egg & Avocado',     cal: 310, protein: 20, fat: 22,   img: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80' },
];

const workouts = [
  { label: 'Strength Training',  desc: 'Build real muscle with progressive overload. AI picks your weights, sets, and rest periods to push you without burning out.', img: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=1000&q=80', tag: 'Gym',         chips: ['3–5 days/week', 'All levels', 'Progressive load'] },
  { label: 'Home Workouts',      desc: 'No equipment needed. Full-body sessions that fit your living room in under 30 minutes — zero excuses, all results.',          img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1920&q=80', tag: 'Home',        chips: ['No equipment', '20–40 min', 'Bodyweight'] },
  { label: 'Cardio & Endurance', desc: 'Running plans, HIIT circuits, and cycling targets that make torching calories feel rewarding, not like a punishment.',        img: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=1000&q=80', tag: 'Cardio',      chips: ['Fat burn', 'HIIT + steady', '5× faster results'] },
  { label: 'Yoga & Mobility',    desc: 'Reduce injury risk, improve range of motion, and restore balance with guided flows built for real human bodies.',             img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1000&q=80', tag: 'Flexibility', chips: ['Recovery', 'Stress relief', 'All ages'] },
];

const dailyFlow = [
  { time: '7:00 AM',  emoji: '🍎', label: 'Healthy Breakfast', desc: 'AI-chosen high-protein start — oats, eggs, or soya — fuels the morning.',   color: '#059669', bg: '#d1fae5', img: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=500&q=80' },
  { time: '12:00 PM', emoji: '🏋️', label: 'Workout Session',   desc: 'Personalized training block matched to your energy levels and goals.',       color: '#dc2626', bg: '#fee2e2', img: 'https://images.unsplash.com/photo-1517963879433-6ad2171073a1?w=500&q=80' },
  { time: '6:00 PM',  emoji: '📈', label: 'Progress Check',     desc: "Log your meals, check calories, and see today's nutrition ring close.",      color: '#2563eb', bg: '#dbeafe', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500&q=80' },
  { time: '9:30 PM',  emoji: '🛡️', label: 'Recovery & Rest',   desc: "Wind-down stretches, sleep tips, and tomorrow's meal prep checklist.",       color: '#6b7c3a', bg: '#eef1e0', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&q=80' },
];

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
.fr2-root { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f0e8; color: #1a1a18; overflow-x: hidden; }

/* NAV */
.fr2-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; background: rgba(245,240,232,0.94); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.07); height: 58px; display: flex; align-items: center; padding: 0 48px; }
.fr2-logo { font-size: 16px; font-weight: 800; letter-spacing: -0.4px; color: #1a1a18; display: flex; align-items: center; gap: 6px; text-decoration: none; }
.fr2-logo-ai { background: #6b7c3a; color: #fff; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; }
.fr2-nav-links { display: flex; gap: 32px; margin-left: auto; }
.fr2-nav-links a { font-size: 14px; color: #3a3a32; text-decoration: none; font-weight: 500; }
.fr2-nav-links a:hover { color: #1a1a18; }
.fr2-nav-cta { display: flex; gap: 8px; align-items: center; margin-left: 32px; }
.fr2-btn-ghost { font-size: 14px; color: #4a4a40; text-decoration: none; padding: 7px 16px; font-weight: 500; }
.fr2-btn-pill { font-size: 13px; font-weight: 700; background: #1a1a18; color: #fff; padding: 9px 20px; border-radius: 100px; text-decoration: none; }

/* HERO */
.fr2-hero { position: relative; width: 100%; height: 100vh; min-height: 620px; overflow: hidden; display: flex; align-items: flex-end; }
.fr2-hero-bg { position: absolute; inset: 0; background-size: cover; background-position: center 25%; }
.fr2-hero-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,6,4,0.88) 0%, rgba(8,6,4,0.45) 45%, rgba(8,6,4,0.1) 100%); }
.fr2-hero-content { position: relative; z-index: 2; padding: 0 56px 68px; max-width: 680px; }
.fr2-hero-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; }
.fr2-eyebrow-line { width: 24px; height: 1px; background: rgba(255,255,255,0.35); flex-shrink: 0; }
.fr2-hero-h1 { font-size: clamp(52px, 7vw, 88px); font-weight: 800; line-height: 1.0; letter-spacing: -2.5px; color: #fff; margin-bottom: 22px; }
.fr2-hero-h1 em { font-style: normal; color: #c5d47a; }
.fr2-hero-sub { font-size: 18px; color: rgba(255,255,255,0.68); line-height: 1.65; margin-bottom: 36px; max-width: 420px; }
.fr2-hero-actions { display: flex; gap: 12px; }
.fr2-btn-hero-primary { background: #fff; color: #1a1a18; font-size: 15px; font-weight: 700; padding: 14px 28px; border-radius: 100px; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; }
.fr2-btn-hero-outline { border: 1.5px solid rgba(255,255,255,0.35); color: rgba(255,255,255,0.85); font-size: 15px; font-weight: 500; padding: 13px 26px; border-radius: 100px; text-decoration: none; }

.fr2-hero-stats { position: absolute; right: 56px; bottom: 68px; z-index: 2; display: flex; flex-direction: column; gap: 10px; }
.fr2-stat-card { background: rgba(255,255,255,0.08); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; padding: 14px 18px; min-width: 186px; }
.fr2-stat-label { font-size: 10px; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
.fr2-stat-big { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -0.5px; line-height: 1; }
.fr2-stat-bar-track { height: 3px; background: rgba(255,255,255,0.15); border-radius: 2px; margin-top: 10px; }
.fr2-stat-bar-fill { height: 3px; background: #c5d47a; border-radius: 2px; }
.fr2-stat-row { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; color: rgba(255,255,255,0.45); }
.fr2-stat-accent { color: #c5d47a; font-weight: 700; }
.fr2-stat-peach { color: #fb923c; }
.fr2-stat-pill { background: rgba(251,146,60,0.18); border: 1px solid rgba(251,146,60,0.35); color: #fed7aa; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 100px; }
.fr2-stat-pills { display: flex; gap: 5px; margin-top: 9px; flex-wrap: wrap; }

/* CAT NAV */
.fr2-cat-nav { background: #faf8f3; border-bottom: 1px solid rgba(0,0,0,0.07); padding: 0 56px; display: flex; }
.fr2-cat-nav a { font-size: 13px; font-weight: 500; color: #5a5a4a; text-decoration: none; padding: 15px 18px; border-bottom: 2px solid transparent; white-space: nowrap; }
.fr2-cat-nav a.active { color: #6b7c3a; border-bottom-color: #6b7c3a; font-weight: 600; }
.fr2-cat-nav a:hover { color: #1a1a18; }

/* SECTION SHARED */
.fr2-section { padding: 56px 48px; }
.fr2-section-white { background: #faf8f3; }
.fr2-section-cream { background: #f5f0e8; }
.fr2-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #6b7c3a; margin-bottom: 10px; }
.fr2-h2 { font-size: clamp(38px, 4.8vw, 58px); font-weight: 800; letter-spacing: -1.5px; line-height: 1.04; color: #1a1a18; margin-bottom: 12px; }
.fr2-h2 em { font-style: normal; color: #6b7c3a; }
.fr2-sub { font-size: 18px; color: #3d3d35; line-height: 1.6; max-width: 520px; margin-bottom: 36px; }

/* JOURNEY */
.fr2-journey-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.fr2-journey-card { background: #faf8f3; border-radius: 14px; overflow: hidden; cursor: pointer; border: 1px solid rgba(0,0,0,0.06); }
.fr2-journey-img { height: 200px; overflow: hidden; }
.fr2-journey-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s ease; display: block; }
.fr2-journey-card:hover .fr2-journey-img img { transform: scale(1.04); }
.fr2-journey-body { padding: 22px 24px 26px; }
.fr2-journey-badge { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.8px; text-transform: uppercase; padding: 4px 11px; border-radius: 100px; margin-bottom: 10px; }
.fr2-journey-title { font-size: 26px; font-weight: 800; color: #1a1a18; margin-bottom: 8px; letter-spacing: -0.5px; line-height: 1.1; }
.fr2-journey-desc { font-size: 16px; color: #3a3a32; line-height: 1.55; margin-bottom: 18px; }
.fr2-journey-cta { font-size: 15px; font-weight: 700; display: inline-flex; align-items: center; gap: 5px; text-decoration: none; }

/* FEATURES */
.fr2-features-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 2px; background: rgba(0,0,0,0.07); border-radius: 14px; overflow: hidden; }
.fr2-feature-card { background: #f5f0e8; padding: 30px 28px; transition: background .18s; }
.fr2-feature-card:hover { background: #faf8f3; }
.fr2-feature-icon { width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 14px; }
.fr2-feature-title { font-size: 19px; font-weight: 700; color: #1a1a18; margin-bottom: 8px; letter-spacing: -0.2px; }
.fr2-feature-desc { font-size: 15px; color: #3a3a32; line-height: 1.6; }

/* NUTRITION */
.fr2-nutrition-img { width: 100%; height: 340px; object-fit: cover; object-position: center 40%; display: block; }
.fr2-nutrition-label { padding: 28px 48px 22px; background: #faf8f3; }
.fr2-food-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 2px; background: rgba(0,0,0,0.06); }
.fr2-food-card { background: #faf8f3; overflow: hidden; }
.fr2-food-card:hover .fr2-food-img img { transform: scale(1.04); }
.fr2-food-img { height: 190px; overflow: hidden; }
.fr2-food-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; display: block; }
.fr2-food-body { padding: 16px 18px 20px; }
.fr2-food-name { font-size: 16px; font-weight: 700; color: #1a1a18; margin-bottom: 10px; }
.fr2-food-macros { display: flex; gap: 5px; flex-wrap: wrap; }
.fr2-macro { font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 100px; }
.fr2-macro-cal { background: #fef3c7; color: #92400e; }
.fr2-macro-p   { background: #dcfce7; color: #166534; }
.fr2-macro-c   { background: #dbeafe; color: #1e40af; }
.fr2-macro-f   { background: #fce7f3; color: #9d174d; }

/* WORKOUTS */
.fr2-workouts-section { background: #f5f0e8; padding: 56px 0 64px; }
.fr2-workouts-header { padding: 0 48px 40px; }
.fr2-workout-row { display: flex; align-items: stretch; height: 380px; margin-bottom: 10px; background: #faf8f3; overflow: hidden; }
.fr2-workout-row.rev { flex-direction: row-reverse; }
.fr2-workout-img-wrap { position: relative; width: 44%; min-width: 44%; flex-shrink: 0; overflow: hidden; }
.fr2-workout-img-wrap img { width: 100%; height: 100%; object-fit: cover; object-position: center top; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1); display: block; }
.fr2-workout-row:hover .fr2-workout-img-wrap img { transform: scale(1.05); }
.fr2-workout-tag { position: absolute; top: 16px; left: 16px; background: rgba(255,255,255,0.96); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; padding: 5px 12px; border-radius: 100px; color: #1a1a18; }
.fr2-workout-copy { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 40px 52px; overflow: hidden; }
.fr2-workout-num { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #6b7c3a; margin-bottom: 12px; }
.fr2-workout-title { font-size: 36px; font-weight: 800; letter-spacing: -1px; color: #111; margin-bottom: 12px; line-height: 1.08; }
.fr2-workout-desc { font-size: 16px; color: #3a3a32; line-height: 1.65; margin-bottom: 22px; max-width: 400px; }
.fr2-workout-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 26px; }
.fr2-workout-chip { font-size: 12px; font-weight: 600; padding: 5px 13px; border-radius: 100px; background: #eef1e0; color: #4a5a1e; border: 1px solid #d4dba8; }
.fr2-btn-workout { display: inline-flex; align-items: center; gap: 7px; background: #1a1a18; color: #fff; font-size: 14px; font-weight: 700; padding: 12px 24px; border-radius: 100px; text-decoration: none; align-self: flex-start; transition: background 0.2s; }
.fr2-btn-workout:hover { background: #6b7c3a; }

/* DAILY FLOW */
.fr2-flow-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
.fr2-flow-card { background: #f5f0e8; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.06); }
.fr2-flow-card:hover .fr2-flow-img img { transform: scale(1.04); }
.fr2-flow-img { height: 155px; position: relative; overflow: hidden; }
.fr2-flow-img img { width: 100%; height: 100%; object-fit: cover; transition: transform .4s; display: block; }
.fr2-flow-time-badge { position: absolute; top: 10px; left: 10px; font-size: 11px; font-weight: 700; background: rgba(255,255,255,0.95); padding: 4px 10px; border-radius: 100px; color: #1a1a18; }
.fr2-flow-body { padding: 18px 18px 22px; }
.fr2-flow-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 10px; }
.fr2-flow-label { font-size: 17px; font-weight: 700; color: #1a1a18; margin-bottom: 6px; letter-spacing: -0.2px; }
.fr2-flow-desc { font-size: 14px; color: #3a3a32; line-height: 1.6; }

/* CTA */
.fr2-cta-section { background: #1a1a18; padding: 64px 48px; display: flex; align-items: center; justify-content: space-between; gap: 40px; }
.fr2-cta-left { max-width: 600px; }
.fr2-cta-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 14px; }
.fr2-cta-h2 { font-size: clamp(38px, 4.8vw, 62px); font-weight: 800; color: #fff; letter-spacing: -1.8px; line-height: 1.02; margin-bottom: 14px; }
.fr2-cta-h2 em { font-style: normal; color: #c5d47a; }
.fr2-cta-sub { font-size: 18px; color: rgba(255,255,255,0.52); line-height: 1.6; }
.fr2-cta-right { flex-shrink: 0; }
.fr2-btn-cta { display: inline-flex; align-items: center; gap: 10px; background: #fff; color: #1a1a18; font-size: 16px; font-weight: 700; padding: 17px 34px; border-radius: 100px; text-decoration: none; white-space: nowrap; }

/* FOOTER */
.fr2-footer { background: #111; color: rgba(255,255,255,0.4); padding: 22px 48px; display: flex; align-items: center; gap: 24px; font-size: 13px; }
.fr2-footer-logo { color: rgba(255,255,255,0.8); font-weight: 700; font-size: 15px; margin-right: auto; }
.fr2-footer a { color: rgba(255,255,255,0.4); text-decoration: none; }
.fr2-footer a:hover { color: rgba(255,255,255,0.8); }
`;

function Navbar() {
  return (
    <nav className="fr2-nav">
      <Link to="/" className="fr2-logo">
        <Zap size={14} /> FitRupee AI
      </Link>
      <div className="fr2-nav-links">
        {['Features', 'Nutrition', 'Workouts'].map((l) => (
          <a key={l} href={`#${l.toLowerCase()}`}>{l}</a>
        ))}
      </div>
      <div className="fr2-nav-cta">
        <Link to="/login" className="fr2-btn-ghost">Log in</Link>
        <Link to="/register" className="fr2-btn-pill">Start free</Link>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="fr2-hero">
      <div
        className="fr2-hero-bg"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1920&q=85')" }}
      />
      <div className="fr2-hero-overlay" />
      <motion.div
        className="fr2-hero-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
      
        <h1 className="fr2-hero-h1">
          Your coach<br />for a <em>healthier</em><br />life
        </h1>
        <p className="fr2-hero-sub">
          Personalized workouts, smart meal planning, and daily guidance — built for India, optimized for your budget.
        </p>
        <div className="fr2-hero-actions">
          <Link to="/register" className="fr2-btn-hero-primary">
            Start your journey <ArrowRight size={16} />
          </Link>
          <a href="#features" className="fr2-btn-hero-outline">Explore plans</a>
        </div>
      </motion.div>
      <motion.div
        className="fr2-hero-stats"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, delay: 0.35 }}
      >
        <div className="fr2-stat-card">
          <div className="fr2-stat-label"><Flame size={9} style={{ display:'inline', marginRight:4 }} />Today's Calories</div>
          <div className="fr2-stat-big">1,842</div>
          <div className="fr2-stat-bar-track">
            <div className="fr2-stat-bar-fill" style={{ width:'74%' }} />
          </div>
          <div className="fr2-stat-row">
            <span>Goal: 2,200 kcal</span>
            <span className="fr2-stat-accent">74%</span>
          </div>
        </div>
        <div className="fr2-stat-card">
          <div className="fr2-stat-label"><Activity size={9} style={{ display:'inline', marginRight:4 }} />Protein Today</div>
          <div className="fr2-stat-big fr2-stat-peach">
            98<span style={{ fontSize:14, color:'rgba(255,255,255,0.35)', fontWeight:400 }}> / 120g</span>
          </div>
          <div className="fr2-stat-pills">
            {['Soya','Eggs','Dal','Peanuts'].map((s) => (
              <span key={s} className="fr2-stat-pill">{s}</span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function CatNav() {
  return (
    <div className="fr2-cat-nav">
      {[['All','#journeys'],['Strength','#workouts'],['Cardio','#workouts'],['Home Workouts','#workouts'],['Yoga','#workouts'],['Nutrition','#nutrition']].map(([l, h], i) => (
        <a key={l} href={h} className={i === 0 ? 'active' : ''}>{l}</a>
      ))}
    </div>
  );
}

function JourneySection() {
  return (
    <section id="journeys" className="fr2-section fr2-section-cream">
      <h2 className="fr2-h2">Your journey, <em>your way</em></h2>
      <p className="fr2-sub">Every goal gets its own AI-crafted plan.</p>
      <div className="fr2-journey-grid">
        {journeys.map((j, i) => (
          <motion.div
            key={j.id} className="fr2-journey-card"
            variants={fadeUp} custom={i} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <div className="fr2-journey-img">
              <img src={j.img} alt={j.label} loading="lazy" />
            </div>
            <div className="fr2-journey-body">
              <div className="fr2-journey-badge" style={{ background: `${j.accent}18`, color: j.accent }}>
                {j.badge}
              </div>
              <div className="fr2-journey-title">{j.label}</div>
              <div className="fr2-journey-desc">{j.desc}</div>
              <Link to="/register" className="fr2-journey-cta" style={{ color: j.accent }}>
                Get my plan <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="fr2-section fr2-section-white">
      <div className="fr2-eyebrow">Capabilities</div>
      <h2 className="fr2-h2">Everything your <em>coach needs</em></h2>
      <p className="fr2-sub">Six powerful tools. One seamless fitness experience.</p>
      <div className="fr2-features-grid">
        {features.map((f, i) => (
          <motion.div
            key={f.label} className="fr2-feature-card"
            variants={fadeUp} custom={i * 0.3} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <div className="fr2-feature-icon" style={{ background: f.bg }}>{f.emoji}</div>
            <div className="fr2-feature-title">{f.label}</div>
            <div className="fr2-feature-desc">{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function NutritionSection() {
  return (
    <section id="nutrition" className="fr2-section-cream" style={{ padding: 0 }}>
      <img
        className="fr2-nutrition-img"
        src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1600&q=85"
        alt="Healthy Food"
      />
      <div className="fr2-nutrition-label">
        <div className="fr2-eyebrow">Smart Nutrition</div>
        <h2 className="fr2-h2">Food that <em>fuels you</em></h2>
        <p className="fr2-sub" style={{ marginBottom: 0 }}>
          Real, delicious meals with macros that match your goals — at prices that don't break the budget.
        </p>
      </div>
      <div className="fr2-food-grid">
        {foods.map((food, i) => (
          <motion.div
            key={food.name} className="fr2-food-card"
            variants={fadeUp} custom={i * 0.2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <div className="fr2-food-img">
              <img src={food.img} alt={food.name} loading="lazy" />
            </div>
            <div className="fr2-food-body">
              <div className="fr2-food-name">{food.name}</div>
              <div className="fr2-food-macros">
                <span className="fr2-macro fr2-macro-cal">🔥 {food.cal} cal</span>
                <span className="fr2-macro fr2-macro-p">{food.protein}g protein</span>
                {food.carbs && <span className="fr2-macro fr2-macro-c">{food.carbs}g carbs</span>}
                {food.fat   && <span className="fr2-macro fr2-macro-f">{food.fat}g fat</span>}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function WorkoutsSection() {
  return (
    <section id="workouts" className="fr2-workouts-section">
      <div className="fr2-workouts-header">
        <div className="fr2-eyebrow">Workout Experience</div>
        <h2 className="fr2-h2">Train smarter, <em>not harder</em></h2>
        <p className="fr2-sub" style={{ marginBottom: 0 }}>Every session designed by AI for your level, schedule, and goals.</p>
      </div>
      {workouts.map((w, i) => {
        const isRev = i % 2 === 1;
        return (
          <div key={w.label} className={`fr2-workout-row${isRev ? ' rev' : ''}`}>
            <motion.div
              className="fr2-workout-img-wrap"
              initial={{ opacity: 0, x: isRev ? 60 : -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <img src={w.img} alt={w.label} loading="lazy" />
              <span className="fr2-workout-tag">{w.tag}</span>
            </motion.div>
            <motion.div
              className="fr2-workout-copy"
              initial={{ opacity: 0, x: isRev ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="fr2-workout-num">0{i + 1} — {w.tag}</div>
              <div className="fr2-workout-title">{w.label}</div>
              <div className="fr2-workout-desc">{w.desc}</div>
              <div className="fr2-workout-chips">
                {w.chips.map((c) => <span key={c} className="fr2-workout-chip">{c}</span>)}
              </div>
              <Link to="/register" className="fr2-btn-workout">
                Try this workout <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        );
      })}
    </section>
  );
}

function DailyFlowSection() {
  return (
    <section className="fr2-section fr2-section-white">
      <div className="fr2-eyebrow">Daily Rhythm</div>
      <h2 className="fr2-h2">One perfect <em>fitness day</em></h2>
      <p className="fr2-sub">FitRupee AI structures your entire day — from first meal to final stretch.</p>
      <div className="fr2-flow-grid">
        {dailyFlow.map((step, i) => (
          <motion.div
            key={step.label} className="fr2-flow-card"
            variants={fadeUp} custom={i * 0.2} initial="hidden" whileInView="visible" viewport={{ once: true }}
          >
            <div className="fr2-flow-img">
              <img src={step.img} alt={step.label} loading="lazy" />
              <div className="fr2-flow-time-badge">{step.time}</div>
            </div>
            <div className="fr2-flow-body">
              <div className="fr2-flow-icon" style={{ background: step.bg }}>{step.emoji}</div>
              <div className="fr2-flow-label">{step.label}</div>
              <div className="fr2-flow-desc">{step.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="fr2-cta-section">
      <div className="fr2-cta-left">
        <div className="fr2-cta-eyebrow">Your transformation starts now</div>
        <h2 className="fr2-cta-h2">
          Start building<br />better <em>habits today</em>
        </h2>
        <p className="fr2-cta-sub">Fitness is not about perfection. It's about consistency.</p>
      </div>
      <div className="fr2-cta-right">
        <Link to="/register" className="fr2-btn-cta">
          Start your transformation <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="fr2-footer">
      <div className="fr2-footer-logo"><Zap size={13} style={{ display:'inline', marginRight:4 }} />FitRupee AI</div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="fr2-root">
      <style>{CSS}</style>
      <Navbar />
      <Hero />
      <CatNav />
      <JourneySection />
      <FeaturesSection />
      <NutritionSection />
      <WorkoutsSection />
      <DailyFlowSection />
      <FinalCTA />
      <Footer />
    </div>
  );
}