import { readFileSync, writeFileSync } from 'fs';

const c = readFileSync('src/pages/Landing.tsx', 'utf8');
const lines = c.split(/\r?\n/);

const heroNew = `      <section className="relative bg-slate-900 text-white pt-24 pb-28 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-accent-400/5 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65, ease: 'easeOut' }}>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-brand-500/15 text-brand-300 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-8 border border-brand-500/25"
            >
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              Smart Campus Event Management
            </motion.span>
            <h1 className="font-display text-5xl md:text-[4.5rem] font-extrabold leading-[1.1] mb-6 text-white tracking-tight">
              Every campus event,{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #2dd4bf 0%, #facc15 100%)', backgroundSize: '200% 200%', animation: 'gradient-shift 4s ease infinite' }}>
                in one place.
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              Discover workshops, seminars, sports, and cultural events. Register in seconds, get your QR ticket, and never miss what's happening on campus.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/role-selection')}
                className="w-full sm:w-auto bg-brand-500 hover:bg-brand-400 text-white font-bold text-base px-8 py-3.5 rounded-2xl shadow-lg shadow-brand-500/25 transition-all inline-flex items-center justify-center gap-2">
                Browse Events
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.03, y: -1 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/auth?role=organizer')}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-3.5 rounded-2xl border border-white/15 transition-all">
                I'm an Organizer
              </motion.button>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-16 flex items-center justify-center gap-10 flex-wrap">
            {[
              { value: '500+', label: 'Students' },
              { value: '80+',  label: 'Events' },
              { value: '12+',  label: 'Clubs' },
            ].map((stat, i) => (
              <div key={stat.label} className="text-center flex items-center gap-4">
                {i > 0 && <div className="w-px h-8 bg-slate-700 hidden sm:block" />}
                <div>
                  <p className="font-display text-3xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-slate-500 text-xs mt-0.5 uppercase tracking-wide">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>`.split('\n');

const testimonialsNew = `      <section className="bg-white border-b border-slate-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by students &amp; organizers</p>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              { quote: "Registered for three workshops in under a minute. The QR ticket made check-in instant.", name: "Aisha K.", role: "2nd Year, CSE", avatar: "A" },
              { quote: "As an organizer, tracking attendance used to take hours. Now it's done before the event ends.", name: "Rohan M.", role: "Tech Club Lead", avatar: "R" },
            ].map((t) => (
              <div key={t.name} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col gap-4">
                <p className="text-slate-700 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-brand-100 rounded-full flex items-center justify-center text-brand-700 font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>`.split('\n');

const featuresNew = `        <section className="mt-20 mb-4">
          <div className="text-center mb-10">
            <h2 className="font-display text-2xl font-bold text-slate-900 mb-2">Everything you need for campus events</h2>
            <p className="text-slate-500 text-sm">Built for students and organizers alike</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Calendar, title: 'Event Management',  desc: 'Create and publish events in minutes with AI-generated descriptions.', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
              { icon: QrCode,   title: 'QR Tickets',        desc: 'Every participant gets a unique QR code. Scan to mark attendance instantly.', color: 'bg-violet-50 text-violet-600', border: 'border-violet-100' },
              { icon: Zap,      title: 'Real-time Updates', desc: 'Live registration counts, attendance tracking, and community discussions.', color: 'bg-amber-50 text-amber-600', border: 'border-amber-100' },
              { icon: Shield,   title: 'Moderation Tools',  desc: 'Organizers can pin, report, and manage community content with ease.', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
            ].map((f, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 + 0.2 }}
                className={\`bg-white rounded-2xl p-6 border \${f.border} hover:shadow-md transition-shadow\`}>
                <div className={\`w-11 h-11 \${f.color} rounded-xl flex items-center justify-center mb-4\`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-slate-900 mb-1.5">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>`.split('\n');

const newLines = [
  ...lines.slice(0, 103),
  ...heroNew,
  ...lines.slice(179, 181),
  ...testimonialsNew,
  ...lines.slice(197, 427),
  ...featuresNew,
  ...lines.slice(454),
];

writeFileSync('src/pages/Landing.tsx', newLines.join('\n'), 'utf8');
console.log('Done. Total lines:', newLines.length);
