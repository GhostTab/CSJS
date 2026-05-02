import { motion } from 'framer-motion'
import { Atom, ArrowRight, Hash, Type, Globe2, Calculator } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 15 }
  }
}

export default function AnimatedConcept({ type, labels = [] }) {
  // Particle animation for science/matter concepts
  if (type === 'particles') {
    return (
      <div className="relative h-40 overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-4 w-4 rounded-full"
              style={{
                background: i % 2 === 0 
                  ? 'linear-gradient(135deg, #3b82f6, #06b6d4)' 
                  : 'linear-gradient(135deg, #8b5cf6, #ec4899)',
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 60 - 30, Math.random() * 60 - 30, 0],
                scale: [1, 1.2, 0.8, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600">
            <Atom className="h-3 w-3" />
            Particle Motion
          </span>
        </div>
      </div>
    )
  }

  // Math steps animation
  if (type === 'math_steps') {
    const steps = [
      { icon: Hash, label: 'Identify Values', color: 'from-blue-400 to-blue-500' },
      { icon: ArrowRight, label: 'Apply Rules', color: 'from-violet-400 to-violet-500' },
      { icon: Calculator, label: 'Calculate', color: 'from-emerald-400 to-emerald-500' },
    ]

    return (
      <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-between"
        >
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div key={i} variants={itemVariants} className="flex flex-col items-center gap-2">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.color} text-white`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-slate-600">{step.label}</span>
                {i < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.2 }}
                    className="absolute"
                    style={{ marginLeft: '80px' }}
                  >
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    )
  }

  // Sentence highlight animation for English
  if (type === 'sentence_highlight') {
    const baseLabels = labels.length > 0 ? labels : ['Key Idea', 'Evidence', 'Context', 'Meaning']
    const palette = [
      'from-amber-400 to-orange-500',
      'from-blue-400 to-cyan-500',
      'from-violet-400 to-purple-500',
      'from-emerald-400 to-teal-500',
    ]
    const words = baseLabels.map((label, index) => ({
      text: label,
      color: palette[index % palette.length],
    }))

    return (
      <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
        <div className="flex flex-wrap gap-2">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0.4, scale: 0.9 }}
              animate={{ 
                opacity: [0.4, 1, 0.4],
                scale: [0.9, 1, 0.9],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              className={`rounded-lg bg-gradient-to-r ${word.color} px-3 py-1.5 text-xs font-semibold text-white`}
            >
              {word.text}
            </motion.span>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-amber-700">
          <Type className="h-3 w-3" />
          Highlighted Concepts
        </div>
      </div>
    )
  }

  // Timeline animation for Araling Panlipunan
  if (type === 'timeline') {
    const events = [
      { label: 'Pre-Colonial', icon: '1' },
      { label: 'Spanish Era', icon: '2' },
      { label: 'American Period', icon: '3' },
      { label: 'Present Day', icon: '4' },
    ]

    return (
      <div className="rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 p-4">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-300 to-purple-300" />
          <div className="space-y-4">
            {events.map((event, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                className="flex items-center gap-3 pl-1"
              >
                <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-lg">
                  {event.icon}
                </div>
                <span className="text-sm font-medium text-slate-700">{event.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1 text-xs text-violet-700">
          <Globe2 className="h-3 w-3" />
          Historical Timeline
        </div>
      </div>
    )
  }

  return null
}

