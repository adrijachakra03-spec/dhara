import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
  SearchCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

function DistrictDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [fieldReviewProjects, setFieldReviewProjects] = useState([])

  useEffect(() => {
    const loadProjects = () => {
      const storedProjects = JSON.parse(
        localStorage.getItem("dhara-projects") || "[]"
      )

      const pendingProjects = storedProjects.filter(
        (project) =>
          project.stage === "District Scrutiny" &&
          project.authority === "District Authority"
      )

      const projectsForFieldReview = storedProjects.filter(
        (project) =>
          project.stage === "District Field Review" &&
          project.authority === "District Authority"
      )

      setProjects(pendingProjects)
      setFieldReviewProjects(projectsForFieldReview)
    }

    loadProjects()

    window.addEventListener("storage", loadProjects)

    return () => {
      window.removeEventListener("storage", loadProjects)
    }
  }, [])

  const totalLandUnderReview =
    projects.reduce(
      (total, project) =>
        total + Number(project.landArea || 0),
      0
    ) +
    fieldReviewProjects.reduce(
      (total, project) =>
        total + Number(project.landArea || 0),
      0
    )

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* HEADER */}
      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <div>
            <div className="font-serif text-xl font-semibold">
              DHARA
            </div>

            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              District Authority Portal
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 border border-[var(--line)] px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition hover:bg-[var(--paper-deep)]"
          >
            <ArrowLeft size={13} />
            Exit
          </button>

        </div>
      </header>


      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">

        {/* INTRO */}
        <div className="mb-10 max-w-3xl">

          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
            <ShieldCheck size={14} />
            Administrative Layer
          </div>

          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            District review
            <br />
            <span className="text-[var(--ink-soft)]">
              begins here.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Review project proposals submitted by Project Authorities,
            examine field verification findings, and move eligible
            projects through the administrative workflow.
          </p>

        </div>


        {/* STAT CARDS */}
        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            icon={<ClipboardList size={17} />}
            label="Pending proposals"
            value={projects.length}
          />

          <StatCard
            icon={<LandPlot size={17} />}
            label="Land under review"
            value={`${totalLandUnderReview} acres`}
          />

          <StatCard
            icon={<SearchCheck size={17} />}
            label="Field reviews"
            value={fieldReviewProjects.length}
          />

        </div>


        {/* ================= FIELD REVIEW QUEUE ================= */}

        {fieldReviewProjects.length > 0 && (
          <div className="mt-12">

            <div className="mb-5 flex items-end justify-between border-b border-[var(--line)] pb-4">

              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                  Field verification complete
                </div>

                <h2 className="mt-1 font-serif text-2xl">
                  District Field Review
                </h2>
              </div>

              <div className="font-mono text-[10px] text-[var(--ink-soft)]">
                {fieldReviewProjects.length} RECORDS
              </div>

            </div>


            <div className="space-y-4">

              {fieldReviewProjects.map((project, index) => (

                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="border border-[var(--line)] bg-[var(--white)]"
                >

                  <div className="p-5 sm:p-6">

                    {/* TOP */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                          {project.id}
                        </div>

                        <h3 className="mt-2 font-serif text-2xl">
                          {project.projectName}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                          <MapPin size={13} />
                          {project.district}, {project.state}
                        </div>

                      </div>

                      <div className="w-fit border border-[var(--line)] px-3 py-2 font-mono text-[9px] uppercase tracking-wider">
                        District Field Review
                      </div>

                    </div>


                    {/* DETAILS */}
                    <div className="mt-6 grid gap-4 border-t border-[var(--line)] pt-5 sm:grid-cols-4">

                      <Detail
                        label="Land requirement"
                        value={`${project.landArea || "—"} acres`}
                      />

                      <Detail
                        label="Parcels"
                        value={project.parcels || "—"}
                      />

                      <Detail
                        label="Field decision"
                        value={project.fieldVerification || "Verified"}
                      />

                      <Detail
                        label="Authority"
                        value="District Authority"
                      />

                    </div>


                    {/* FIELD FINDINGS */}
                    <div className="mt-6 border-t border-[var(--line)] pt-5">

                      <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        Field Officer remarks
                      </div>

                      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--ink-soft)]">
                        {project.fieldVerificationRemarks ||
                          "No additional remarks recorded."}
                      </p>

                    </div>


                    {/* ACTION */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        Next action · District field review
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/portal/district/field-review/${project.id}`
                          )
                        }
                        className="flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)]"
                      >
                        Review field verification
                        <ArrowRight size={14} />
                      </button>

                    </div>

                  </div>

                </motion.article>

              ))}

            </div>

          </div>
        )}


        {/* ================= PROPOSAL QUEUE ================= */}

        <div className="mt-12">

          <div className="mb-5 flex items-end justify-between border-b border-[var(--line)] pb-4">

            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Incoming work
              </div>

              <h2 className="mt-1 font-serif text-2xl">
                Pending proposals
              </h2>
            </div>

            <div className="font-mono text-[10px] text-[var(--ink-soft)]">
              {projects.length} RECORDS
            </div>

          </div>


          {projects.length === 0 ? (

            <div className="border border-dashed border-[var(--line-dark)] px-6 py-16 text-center">

              <ClipboardList
                size={25}
                className="mx-auto mb-4 text-[var(--ink-soft)]"
              />

              <h3 className="font-serif text-xl">
                No proposals awaiting review
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
                New project proposals submitted by Project Authorities
                will appear here when they enter District Scrutiny.
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

                  <div className="p-5 sm:p-6">

                    {/* TOP */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                          {project.id}
                        </div>

                        <h3 className="mt-2 font-serif text-2xl">
                          {project.projectName}
                        </h3>

                        <div className="mt-2 flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                          <MapPin size={13} />
                          {project.district}, {project.state}
                        </div>

                      </div>

                      <div className="w-fit border border-[var(--line)] px-3 py-2 font-mono text-[9px] uppercase tracking-wider">
                        District Scrutiny
                      </div>

                    </div>


                    {/* DETAILS */}
                    <div className="mt-6 grid gap-4 border-t border-[var(--line)] pt-5 sm:grid-cols-4">

                      <Detail
                        label="Project type"
                        value={project.projectType || "—"}
                      />

                      <Detail
                        label="Land requirement"
                        value={`${project.landArea || "—"} acres`}
                      />

                      <Detail
                        label="Parcels"
                        value={project.parcels || "—"}
                      />

                      <Detail
                        label="Submitted by"
                        value={project.submittedBy || "Project Authority"}
                      />

                    </div>


                    {/* ACTION */}
                    <div className="mt-6 flex flex-col gap-3 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                        Next action · Review proposal
                      </div>

                      <button
                        onClick={() =>
                          navigate(
                            `/portal/district/proposal/${project.id}`
                          )
                        }
                        className="flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)]"
                      >
                        Review proposal
                        <ArrowRight size={14} />
                      </button>

                    </div>

                  </div>

                </motion.article>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-[var(--line)] px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] sm:flex-row sm:justify-between">
          <span>
            DHARA · District Authority Portal
          </span>

          <span>
            Administrative access · Prototype
          </span>
        </div>
      </footer>

    </main>
  )
}


function StatCard({ icon, label, value }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--white)] p-5">

      <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
        {icon}
        {label}
      </div>

      <div className="mt-4 font-serif text-3xl">
        {value}
      </div>

    </div>
  )
}


function Detail({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
        {label}
      </div>

      <div className="mt-1 text-sm">
        {value}
      </div>
    </div>
  )
}


export default DistrictDashboard