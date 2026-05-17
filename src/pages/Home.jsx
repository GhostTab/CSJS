import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Target,
  Zap,
  Award,
  Users,
  MessageCircle
} from 'lucide-react'
import gradesData from '../data/grades.json'
import schoolLogo from '../assets/CSJS.png'
import { buttonPop, cardHover, fabPop, statPop } from '../utils/motionPresets'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
}

const features = [
  { icon: Target, title: 'Personalized Learning', desc: 'Adaptive content tailored to your pace' },
  { icon: Zap, title: 'Interactive Lessons', desc: 'Engaging animations and activities' },
  { icon: Award, title: 'Track Progress', desc: 'Earn badges and track achievements' },
  { icon: Users, title: 'Grade 7-10 Focus', desc: 'Aligned with DepEd curriculum' }
]

const logoCardVariants = {
  rest: {
    scale: 1,
    y: 0,
    rotate: 0,
    boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.08)',
  },
  hover: {
    scale: 1.07,
    y: -8,
    rotate: -1.5,
    boxShadow: '0 22px 45px -14px rgba(59, 130, 246, 0.35)',
    transition: { type: 'spring', stiffness: 380, damping: 18 },
  },
  tap: { scale: 0.97, y: 0, rotate: 0 },
}

const logoGlowVariants = {
  rest: { opacity: 0 },
  hover: { opacity: 1, transition: { duration: 0.2 } },
}

const logoImageVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: {
    scale: 1.05,
    rotate: 2,
    transition: { type: 'spring', stiffness: 400, damping: 16 },
  },
}

export default function Home() {
  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="hero-mesh relative overflow-hidden px-4 pt-24 pb-16 md:px-8 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* School logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mb-8 flex justify-center"
            >
              <motion.div
                className="group relative cursor-pointer rounded-2xl bg-white/90 p-3 ring-1 ring-slate-200/80 transition-[box-shadow,ring-color] hover:ring-blue-300/70 sm:p-4"
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={logoCardVariants}
              >
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl"
                  variants={logoGlowVariants}
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(34,211,238,0.1))',
                  }}
                />
                <motion.img
                  src={schoolLogo}
                  alt="Colegio de San Juan Samar logo"
                  className="relative z-10 h-20 w-auto max-w-[220px] object-contain sm:h-24 sm:max-w-[260px] md:h-28 md:max-w-[300px]"
                  variants={logoImageVariants}
                />
              </motion.div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.04, y: -2 }}
              className="mb-6 inline-flex cursor-default items-center gap-2 rounded-full border border-blue-100/80 bg-gradient-to-r from-white to-sky-50/80 px-4 py-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Colegio de San Juan Samar - Research Platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              Learn with{' '}
              <span className="gradient-text">motion</span>
              ,<br className="hidden sm:block" />
              remember with{' '}
              <span className="gradient-text">meaning</span>.
            </h1>

            {/* Subtitle */}
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 md:text-xl">
              A learning experience for Grades 7-10 where each concept is delivered as an interactive scene, not a static lecture.
            </p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <motion.div {...buttonPop}>
                <Link
                  to="/grade/7"
                  className="btn-gradient group flex items-center gap-2 rounded-full px-8 py-4 text-lg font-semibold text-white"
                >
                  Start Learning
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
              <motion.div {...buttonPop}>
                <Link
                  to="/grade/7/math/fractions-and-decimals"
                  className="btn-gradient-outline group flex items-center gap-2 rounded-full px-6 py-4 text-lg font-semibold text-slate-700"
                >
                  <Play className="h-5 w-5 text-slate-500 transition-transform group-hover:scale-110" fill="currentColor" />
                  View Demo
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 22 }}
                  className="surface-card cursor-pointer rounded-2xl p-6"
                >
                  <div className="icon-gradient mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.desc}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Grade Selection Section */}
      <section id="grades" className="px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Choose Your Grade Level
            </h2>
            <p className="mt-3 text-slate-600">
              Select your grade to explore subjects and start learning
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {gradesData.map((grade) => (
              <motion.div key={grade.grade} variants={itemVariants}>
                <Link
                  to={`/grade/${grade.grade}`}
                  onClick={() => localStorage.setItem('csjs-last-grade', grade.grade)}
                  className="group block"
                >
                  <motion.div
                    className="surface-card relative overflow-hidden rounded-2xl p-6"
                    initial="rest"
                    whileHover="hover"
                    whileTap="tap"
                    variants={cardHover}
                  >
                    {/* Grade Number */}
                    <div className="icon-gradient mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md">
                      {grade.grade}
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900">Grade {grade.grade}</h3>
                    <p className="mt-2 text-sm text-slate-500">
                      {grade.subjects.length} subjects • Interactive lessons
                    </p>

                    {/* Subject Preview Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {grade.subjects.slice(0, 3).map((subject) => (
                        <span
                          key={subject.id}
                          className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700"
                        >
                          {subject.name}
                        </span>
                      ))}
                      {grade.subjects.length > 3 && (
                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition-colors group-hover:bg-blue-100 group-hover:text-blue-700">
                          +{grade.subjects.length - 3}
                        </span>
                      )}
                    </div>

                    {/* Hover Arrow */}
                    <motion.div
                      className="absolute right-4 top-4 text-blue-500 opacity-0 group-hover:opacity-100"
                      transition={{ duration: 0.2 }}
                    >
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="stat-gradient rounded-3xl p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              <motion.div className="stat-item cursor-default text-center" initial="rest" whileHover="hover" variants={statPop}>
                <div className="gradient-text text-4xl font-extrabold">4</div>
                <div className="mt-2 text-sm font-medium text-slate-600">Subjects Available</div>
              </motion.div>
              <motion.div className="stat-item cursor-default text-center" initial="rest" whileHover="hover" variants={statPop}>
                <div className="gradient-text text-4xl font-extrabold">32+</div>
                <div className="mt-2 text-sm font-medium text-slate-600">Interactive Lessons</div>
              </motion.div>
              <motion.div className="stat-item cursor-default text-center" initial="rest" whileHover="hover" variants={statPop}>
                <div className="gradient-text text-4xl font-extrabold">100+</div>
                <div className="mt-2 text-sm font-medium text-slate-600">Practice Questions</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        {...fabPop}
        className="btn-gradient fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </div>
  )
}

