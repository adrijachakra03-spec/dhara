import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  LandPlot,
  MapPin,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"

function FieldOfficerDashboard() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])

  useEffect(() => {
    const loadProjects = () => {
      const storedProjects = JSON.parse(
        localStorage.getItem("dhara-projects") || "[]"
      )

      const assignedProjects = storedProjects.filter(
        (project) =>
          project.stage === "Field Verification" &&
          project.authority === "Field Officer"
      )

      setProjects(assignedProjects)
    }

    loadProjects()

    window.addEventListener("storage", loadProjects)

    return () => {
      window.removeEventListener("storage", loadProjects)
    }
  }, [])

  const totalParcels = projects.reduce(
    (total, project) => total + Number(project.parcels || 0),
    0
  )

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* HEADER */}

      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">

          <button
            onClick={() => navigate("/signin")}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)] transition hover:text-[var(--earth)]"
          >
            <ArrowLeft size={14} />
            Sign out
          </button>

          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-soft)]">
            <ShieldCheck size={14} />
            Field Officer
          </div>

        </div>
      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">

        {/* INTRO */}

        <section className="border-b border-[var(--line)] pb-8">

          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--earth)]">
            Field verification unit
          </p>

          <h1 className="mt-3 font-serif text-3xl leading-tight md:text-5xl">
            Assigned field verification
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Review projects assigned for field verification and
            record findings against the submitted land requirement.
          </p>

        </section>

        {/* STATS */}

        <section className="mt-8 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">

          <div className="bg-[var(--white)] p-6">
            <ClipboardList
              size={20}
              strokeWidth={1.4}
              className="text-[var(--earth)]"
            />

            <p className="mt-5 font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
              Assigned projects
            </p>

            <p className="mt-2 font-serif text-3xl">
              {projects.length}
            </p>
          </div>

          <div className="bg-[var(--white)] p-6">
            <LandPlot
              size={20}
              strokeWidth={1.4}
              className="text-[var(--earth)]"
            />

            <p className="mt-5 font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
              Parcels to verify
            </p>

            <p className="mt-2 font-serif text-3xl">
              {totalParcels}
            </p>
          </div>

          <div className="bg-[var(--white)] p-6">
            <ShieldCheck
              size={20}
              strokeWidth={1.4}
              className="text-[var(--earth)]"
            />

            <p className="mt-5 font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
              Current stage
            </p>

            <p className="mt-2 font-serif text-2xl">
              Field Review
            </p>
          </div>

        </section>

        {/* ASSIGNMENTS */}

        <section className="mt-10">

          <div className="mb-5 flex flex-col gap-2 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-end sm:justify-between">

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                Current assignments
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Projects requiring verification
              </h2>
            </div>

            <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
              {projects.length} assignment
              {projects.length !== 1 ? "s" : ""}
            </span>

          </div>

          {projects.length === 0 ? (

            <div className="border border-[var(--line)] bg-[var(--white)] p-8 md:p-10">

              <ShieldCheck
                size={28}
                strokeWidth={1.3}
                className="text-[var(--earth)]"
              />

              <h3 className="mt-5 font-serif text-2xl">
                No pending field assignments
              </h3>

              <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
                Projects accepted by the District Authority will
                appear here when they are assigned for field
                verification.
              </p>

            </div>

          ) : (

            <div className="space-y-4">

              {projects.map((project, index) => (

                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="border border-[var(--line)] bg-[var(--white)]"
                >

                  <div className="p-6 md:p-8">

                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--earth)]">
                            {project.id}
                          </span>

                          <span className="border border-[var(--line)] px-2 py-1 font-mono text-[8px] uppercase tracking-wider text-[var(--ink-soft)]">
                            Pending verification
                          </span>

                        </div>

                        <h3 className="mt-3 font-serif text-2xl">
                          {project.projectName || project.name}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-4 font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">

                          <span className="flex items-center gap-2">
                            <MapPin size={13} />
                            {project.district}, {project.state}
                          </span>

                          <span className="flex items-center gap-2">
                            <LandPlot size={13} />
                            {project.landArea || project.land} acres
                          </span>

                          <span>
                            {project.parcels || 0} parcels
                          </span>

                        </div>

                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/portal/field/project/${project.id}`
                          )
                        }
                        className="flex shrink-0 items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)]"
                      >
                        Open verification
                        <ArrowRight size={14} />
                      </button>

                    </div>

                    <div className="mt-6 border-t border-[var(--line)] pt-5">

                      <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        Project purpose
                      </p>

                      <p className="mt-2 max-w-4xl text-sm leading-6 text-[var(--ink-soft)]">
                        {project.purpose ||
                          "No project purpose has been recorded."}
                      </p>

                    </div>

                  </div>

                </motion.article>

              ))}

            </div>

          )}

        </section>

      </div>
    </main>
  )
}

export default FieldOfficerDashboard