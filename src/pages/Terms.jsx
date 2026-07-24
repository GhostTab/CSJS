import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText } from 'lucide-react'
import schoolLogo from '../assets/CSJS.png'

const lastUpdated = 'July 24, 2026'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50/40 to-white px-4 pb-20 pt-8 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-3xl"
      >
        <Link
          to="/register"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Register
        </Link>

        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-500 px-6 py-8 text-white md:px-10">
            <div className="mb-4 flex items-center gap-3">
              <img
                src={schoolLogo}
                alt="Colegio de San Juan Samar"
                className="h-12 w-auto rounded-full bg-white/90 object-contain p-1"
              />
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                <FileText className="h-3.5 w-3.5" />
                Legal
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Terms and Conditions</h1>
            <p className="mt-2 text-sm text-white/85">
              CSJS Learn — Colegio de San Juan Samar interactive learning platform
            </p>
            <p className="mt-1 text-xs text-white/70">Last updated: {lastUpdated}</p>
          </div>

          <div className="space-y-8 px-6 py-8 text-sm leading-relaxed text-slate-700 md:px-10 md:py-10 md:text-[15px]">
            <p>
              By creating an account or using <strong>CSJS Learn</strong> (“the Platform”), you agree
              to these Terms and Conditions. If you do not agree, do not register or use the Platform.
            </p>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">1. About the Platform</h2>
              <p>
                CSJS Learn is an educational website for <strong>Grades 7–10</strong> learners at{' '}
                <strong>Colegio de San Juan Samar</strong>. It provides interactive lessons, activities,
                practice quizzes, progress tracking, and optional school rankings. Teacher accounts may
                manage supplemental lesson videos. The Platform is a learning aid and does{' '}
                <strong>not</strong> replace official school records, report cards, or DepEd grading.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">2. Eligibility and accounts</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  You must provide a valid email address and a password of at least six (6) characters.
                </li>
                <li>
                  You are responsible for keeping your login credentials confidential and for activity
                  under your account.
                </li>
                <li>
                  Students under the age of majority should register with a parent, guardian, or teacher
                  awareness, as required by school policy.
                </li>
                <li>
                  Teacher or admin roles are granted only by authorized school personnel. Do not attempt
                  to access teacher tools without permission.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">3. What you may use</h2>
              <p className="mb-2">Registered and guest users may, as available:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Browse grades, subjects, and lesson content (text, media, and activities).</li>
                <li>Complete quizzes and activities; lesson quizzes may contribute points toward rankings.</li>
                <li>View a personal dashboard and local or synced learning progress.</li>
                <li>Appear on public rankings based on quiz-related scores when signed in.</li>
                <li>
                  Teachers with approved accounts may upload or manage extra lesson videos within school
                  storage limits and policies.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">4. Acceptable use</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Cheat, share quiz answers in a way that undermines fair learning, or manipulate rankings.</li>
                <li>Harass others, post harmful content, or misuse messaging or uploaded media.</li>
                <li>
                  Upload illegal, copyrighted (without rights), or inappropriate videos or files through
                  teacher tools.
                </li>
                <li>Attempt to hack, scrape excessively, disrupt, or reverse-engineer the Platform.</li>
                <li>Impersonate another student, teacher, or school official.</li>
                <li>Use the Platform for commercial purposes unrelated to school learning.</li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">5. Content and intellectual property</h2>
              <p>
                Lesson materials, branding, logos, and Platform design are owned by Colegio de San Juan
                Samar and/or its contributors, or used under appropriate licenses. You may use content
                for personal learning only. You may not copy, redistribute, or republish curriculum
                materials for sale or public distribution without written permission.
              </p>
              <p className="mt-2">
                Videos or materials uploaded by teachers remain subject to school policy; by uploading,
                teachers confirm they have the right to share that media for educational use on the
                Platform.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">6. Progress, scores, and rankings</h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  Some progress may be stored in your browser; signed-in quiz results may be stored in
                  our connected database for rankings and history.
                </li>
                <li>
                  Rankings reflect Platform activity only and are not official academic standings.
                </li>
                <li>
                  Practice quizzes may not count toward ranking points. We may correct errors, remove
                  fraudulent scores, or reset rankings if abuse is detected.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">7. Privacy</h2>
              <p>
                We collect account information such as email, role (e.g. student or teacher), and
                learning-related data (for example quiz attempts and scores) needed to operate
                authentication, progress, and rankings. Data is processed through our hosting and
                authentication providers for educational purposes. Do not submit sensitive personal data
                beyond what the Platform asks for. For school-specific privacy questions, contact your
                school administrator.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">8. Availability and disclaimer</h2>
              <p>
                The Platform is provided “as is” for educational support. We do not guarantee
                uninterrupted access, perfect accuracy of all content, or that every lesson matches
                every classroom lesson plan. External links (including social media or video hosts) are
                not under our control. To the fullest extent allowed by law, Colegio de San Juan Samar
                and Platform operators are not liable for learning outcomes, lost data, or damages
                arising from use of the Platform.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">9. Suspension and termination</h2>
              <p>
                We may suspend or delete accounts that violate these Terms, school rules, or applicable
                law. You may stop using the Platform at any time. Features may change or be discontinued
                as the school updates the learning site.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">10. Changes to these Terms</h2>
              <p>
                We may update these Terms to reflect new features (for example rankings, teacher uploads,
                or authentication changes). Continued use after updates means you accept the revised
                Terms. The “Last updated” date at the top will change when we revise this page.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-lg font-bold text-slate-900">11. Contact</h2>
              <p>
                For questions about these Terms or CSJS Learn, contact Colegio de San Juan Samar through
                official school channels or the school’s Facebook page linked from the Platform.
              </p>
            </section>

            <p className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-slate-600">
              By checking “I agree to the Terms and Conditions” on the registration form, you confirm
              that you have read and accepted this agreement.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/register"
                className="btn-gradient inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-semibold text-white"
              >
                Return to Register
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
