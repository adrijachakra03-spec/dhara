import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  FileText,
  LandPlot,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"
import { motion } from "framer-motion"

const STORAGE_KEY = "dhara-projects"

function StateDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  const loadProjects = () => {
    try {
      const storedProjects = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      )

      const stateProjects = storedProjects.filter(
        (project) =>
          project.stage === "State Scrutiny" &&
          project.authority === "State Authority"
      )

      setProjects(stateProjects)
    } catch (error) {
      console.error("Failed to load state projects:", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProjects()

    const handleStorageChange = () => {
      loadProjects()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const totalLand = useMemo(() => {
    return projects.reduce(
      (total, project) => total + Number(project.landArea || 0),
      0
    )
  }, [projects])

  const totalParcels = useMemo(() => {
    return projects.reduce(
      (total, project) => total + Number(project.parcels || 0),
      0
    )
  }, [projects])

  const handleReview = (projectId) => {
    if (!projectId) return

    navigate(`/portal/state/project/${projectId}`)
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* HEADER */}
      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)]">
                <ShieldCheck size={18} />
              </div>

              <div>
                <p className="font-serif text-lg tracking-tight">
                  DHARA
                </p>

                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  State Authority
                </p>
              </div>
            </div>
          </div>

          <div className="hidden text-right sm:block">
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Maharashtra
            </p>

            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em]">
              State-level land scrutiny
            </p>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* PAGE INTRO */}
        <div className="mb-8 border-b border-[var(--line)] pb-7">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--earth)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--earth)]" />
                State scrutiny queue
              </div>

              <h1 className="max-w-3xl font-serif text-3xl leading-tight sm:text-4xl">
                Projects requiring state-level review.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                Review projects that have completed district-level field
                verification and have been forwarded for state scrutiny.
              </p>
            </div>

            <button
              type="button"
              onClick={loadProjects}
              className="inline-flex w-fit items-center gap-2 border border-[var(--line-dark)] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.14em] transition hover:border-[var(--ink)] hover:bg-[var(--paper-deep)]"
            >
              <RefreshCw size={13} />
              Refresh queue
            </button>
          </div>
        </div>

        {/* STAT STRIP */}
        <div className="mb-10 grid grid-cols-1 border border-[var(--line)] sm:grid-cols-3">
          <div className="border-b border-[var(--line)] p-5 sm:border-b-0 sm:border-r">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                Pending review
              </span>

              <ClipboardCheck size={15} />
            </div>

            <p className="font-serif text-3xl">{projects.length}</p>

            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Projects
            </p>
          </div>

          <div className="border-b border-[var(--line)] p-5 sm:border-b-0 sm:border-r">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                Land under scrutiny
              </span>

              <LandPlot size={15} />
            </div>

            <p className="font-serif text-3xl">
              {totalLand.toLocaleString()}
            </p>

            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Acres
            </p>
          </div>

          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                Parcels
              </span>

              <MapPin size={15} />
            </div>

            <p className="font-serif text-3xl">
              {totalParcels.toLocaleString()}
            </p>

            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
              Across submitted projects
            </p>
          </div>
        </div>

        {/* QUEUE */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Review queue
              </p>

              <h2 className="mt-1 font-serif text-2xl">
                State scrutiny
              </h2>
            </div>

            <span className="font-mono text-[10px] text-[var(--ink-soft)]">
              {projects.length.toString().padStart(2, "0")} RECORDS
            </span>
          </div>

          {loading ? (
            <div className="border border-[var(--line)] p-10 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                Loading state queue...
              </p>
            </div>
          ) : projects.length === 0 ? (
            <div className="border border-dashed border-[var(--line-dark)] p-10 text-center">
              <ShieldCheck
                size={28}
                className="mx-auto mb-4 text-[var(--ink-soft)]"
              />

              <h3 className="font-serif text-xl">
                No projects awaiting state review.
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
                Projects confirmed by the District Authority after field
                verification will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-[var(--line)] bg-[var(--white)]"
                >
                  {/* CARD TOP */}
                  <div className="border-b border-[var(--line)] p-5 sm:p-6">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="border border-[var(--earth)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--earth)]">
                            Pending State Review
                          </span>

                          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                            {project.id}
                          </span>
                        </div>

                        <h3 className="font-serif text-2xl leading-tight">
                          {project.projectName || "Untitled Project"}
                        </h3>

                        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 size={12} />
                            {project.projectType || "Project"}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={12} />
                            {project.district || "District"},{" "}
                            {project.state || "State"}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col items-start lg:items-end">
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                          Submitted
                        </span>

                        <span className="mt-1 font-mono text-[10px]">
                          {project.submittedAt
                            ? new Date(
                                project.submittedAt
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* CARD DETAILS */}
                  <div className="grid grid-cols-1 divide-y divide-[var(--line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <div className="p-5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                        Land requirement
                      </p>

                      <p className="mt-2 font-serif text-xl">
                        {project.landArea || "—"}
                      </p>

                      <p className="mt-1 font-mono text-[9px] uppercase text-[var(--ink-soft)]">
                        Acres
                      </p>
                    </div>

                    <div className="p-5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                        Parcels
                      </p>

                      <p className="mt-2 font-serif text-xl">
                        {project.parcels || "—"}
                      </p>

                      <p className="mt-1 font-mono text-[9px] uppercase text-[var(--ink-soft)]">
                        Identified parcels
                      </p>
                    </div>

                    <div className="p-5">
                      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                        Previous verification
                      </p>

                      <p className="mt-2 flex items-center gap-2 font-serif text-xl">
                        <ShieldCheck size={18} />
                        {project.districtFieldReview || "Verified"}
                      </p>

                      <p className="mt-1 font-mono text-[9px] uppercase text-[var(--ink-soft)]">
                        District field review
                      </p>
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="flex flex-col gap-4 border-t border-[var(--line)] bg-[var(--paper)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                    <div className="flex items-center gap-2">
                      <FileText size={14} />

                      <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                        Review project records and state-level findings
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleReview(project.id)}
                      className="inline-flex items-center justify-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--paper)] transition hover:bg-[var(--earth)] hover:border-[var(--earth)]"
                    >
                      Review project
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default StateDashboard