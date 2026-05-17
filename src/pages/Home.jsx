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

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-cyan-50 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 pb-16 md:px-8 md:pt-32 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 transition-colors hover:border-blue-200 hover:bg-blue-50/40"
            >
              <Sparkles className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">
                Colegio de San Juan Samar - Research Platform
              </span>
            </motion.div>

            {/* Main Headline */}
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
              Learn with{' '}
              <span className="text-slate-900">motion</span>
              ,<br className="hidden sm:block" />
              remember with{' '}
              <span className="text-slate-900">meaning</span>.
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
              <Link
                to="/grade/7"
                className="group flex items-center gap-2 rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
              >
                Start Learning
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/grade/7/math/fractions-and-decimals"
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <Play className="h-5 w-5 text-slate-500" fill="currentColor" />
                View Demo
              </Link>
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
                  className="rounded-2xl border border-slate-100 bg-white p-6 transition-colors hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                    <Icon className="h-6 w-6 text-blue-500" />
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
                  <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 transition-colors duration-200 hover:border-blue-200 hover:bg-blue-50/30">
                    {/* Grade Number */}
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500 text-2xl font-bold text-white">
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
                    <div className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100">
                      <ArrowRight className="h-5 w-5 text-blue-500" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-slate-100 bg-white p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-blue-500">8</div>
                <div className="mt-2 text-sm font-medium text-slate-600">Subjects Available</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-blue-500">32+</div>
                <div className="mt-2 text-sm font-medium text-slate-600">Interactive Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-blue-500">100+</div>
                <div className="mt-2 text-sm font-medium text-slate-600">Practice Questions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat FAB */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600"
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>
    </div>
  )
}

