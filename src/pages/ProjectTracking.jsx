import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

const workflowStages = [
  {
    title: "Proposal Submitted",
    authority: "Project Authority",
    description:
      "Project proposal and land requirement submitted to DHARA.",
  },
  {
    title: "District Scrutiny",
    authority: "District Authority",
    description:
      "Proposal and land records are reviewed by the district administration.",
  },
  {
    title: "Field Verification",
    authority: "Field Officer",
    description:
      "Ground-level verification and parcel evidence are recorded.",
  },
  {
    title: "District Field Review",
    authority: "District Authority",
    description:
      "Field verification findings are reviewed by the district administration.",
  },
  {
    title: "State Scrutiny",
    authority: "State Authority",
    description:
      "District progress and project requirements are reviewed at state level.",
  },
  {
    title: "Central Oversight",
    authority: "Central Authority",
    description:
      "National-level monitoring and project intelligence.",
  },
  {
    title: "Acquisition",
    authority: "Government",
    description:
      "Approved project land moves through acquisition and implementation.",
  },
  {
    title: "Completed",
    authority: "System Authority",
    description:
      "Project lifecycle is closed after the required process is completed.",
  },
]

function getProjects() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function ProjectTracking() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)

  useEffect(() => {
    const loadProject = () => {
      const projects = getProjects()

      const foundProject = projects.find(
        (item) => item.id === projectId
      )

      if (foundProject) {
        setProject(foundProject)
        return
      }

      try {
        const latest = JSON.parse(
          localStorage.getItem("dhara-latest-proposal") || "null"
        )

        if (latest?.id === projectId) {
          setProject(latest)
        } else {
          setProject(null)
        }
      } catch {
        setProject(null)
      }
    }

    loadProject()
  }, [projectId])

  if (!project) {
    return (
      <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
        <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-12">
          <div className="w-full border border-[var(--line)] bg-[var(--white)] p-8 text-center sm:p-12">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center border border-[var(--line)]">
              <FileText
                size={22}
                strokeWidth={1.5}
              />
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Project record unavailable
            </p>

            <h1 className="mt-3 font-serif text-3xl">
              We couldn't find this project.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[var(--ink-soft)]">
              The project may not have been submitted from this browser,
              or its local prototype record may no longer exist.
            </p>

            <button
              onClick={() => navigate("/portal/company")}
              className="mt-8 inline-flex items-center gap-2 border border-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] transition hover:bg-[var(--ink)] hover:text-[var(--white)]"
            >
              <ArrowLeft size={14} />
              Back to company portal
            </button>

          </div>
        </div>
      </main>
    )
  }

  /*
    Company revision state.

    This appears when the Field Officer has found an issue
    and sent the project back to the Project Authority.
  */

  const needsRevision =
    project.stage === "Company Revision" ||
    project.status === "Field Verification Issue"

  const currentStageIndex = Math.max(
    workflowStages.findIndex(
      (stage) => stage.title === project.stage
    ),
    0
  )

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* HEADER */}

      <header className="border-b border-[var(--line)] bg-[var(--paper)]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">

          <button
            onClick={() => navigate("/portal/company")}
            className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform group-hover:-translate-x-1"
            />

            Company portal
          </button>

          <div className="flex items-center gap-2">

            <ShieldCheck
              size={15}
              strokeWidth={1.5}
            />

            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              DHARA / Project Record
            </span>

          </div>

        </div>

      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-14">

        {/* PROJECT IDENTITY */}

        <section className="border border-[var(--line)] bg-[var(--white)]">

          <div className="grid lg:grid-cols-[1fr_auto]">

            <div className="p-6 sm:p-8 lg:p-10">

              <div className="flex flex-wrap items-center gap-3">

                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                  Project tracking
                </span>

                <span className="h-px w-8 bg-[var(--line)]" />

                <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  {project.id}
                </span>

              </div>

              <h1 className="mt-5 max-w-3xl font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl">
                {project.projectName ||
                  project.name ||
                  "Untitled project"}
              </h1>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                <div className="flex items-start gap-3">

                  <MapPin
                    size={17}
                    strokeWidth={1.5}
                    className="mt-0.5 text-[var(--earth)]"
                  />

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Location
                    </p>

                    <p className="mt-1 text-sm">
                      {project.district ||
                        project.location ||
                        "—"}

                      {project.district && project.state
                        ? `, ${project.state}`
                        : ""}
                    </p>

                  </div>

                </div>

                <div className="flex items-start gap-3">

                  <LandPlot
                    size={17}
                    strokeWidth={1.5}
                    className="mt-0.5 text-[var(--earth)]"
                  />

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Land requirement
                    </p>

                    <p className="mt-1 text-sm">
                      {project.landArea ||
                        project.land ||
                        "—"}

                      {project.landArea
                        ? " acres"
                        : ""}

                      {" · "}

                      {project.parcels || "—"} parcels
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* STATUS */}

            <div className="border-t border-[var(--line)] p-6 sm:p-8 lg:w-72 lg:border-l lg:border-t-0">

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Current status
              </p>

              <div className="mt-5 flex items-center gap-3">

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    needsRevision
                      ? "bg-[var(--earth)]"
                      : "bg-[var(--earth)]"
                  }`}
                />

                <span className="font-mono text-xs uppercase tracking-[0.14em]">
                  {project.status || "Pending"}
                </span>

              </div>

              <div className="mt-7 border-t border-[var(--line)] pt-5">

                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  With
                </p>

                <p className="mt-2 text-sm">
                  {project.authority ||
                    "DHARA Authority"}
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* REVISION ALERT */}

        {needsRevision && (
          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-6 border border-[var(--earth)] bg-[var(--white)]"
          >

            <div className="flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--earth)]">
                  <AlertTriangle
                    size={18}
                    strokeWidth={1.5}
                    className="text-[var(--earth)]"
                  />
                </div>

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                    Action required
                  </p>

                  <h2 className="mt-2 font-serif text-xl sm:text-2xl">
                    Field verification issue reported
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                    The Field Officer identified an issue with the
                    project during verification. Review the findings
                    and submit the required correction.
                  </p>

                </div>

              </div>

              <button
                onClick={() =>
                  navigate(
                    `/portal/company/project/${project.id}/revise`
                  )
                }
                className="flex shrink-0 items-center justify-center gap-2 bg-[var(--earth)] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--white)] transition hover:bg-[var(--earth-dark)]"
              >
                Revise & Resubmit
                <ArrowRight size={14} />
              </button>

            </div>

          </motion.section>
        )}

        {/* TIMELINE */}

        <section className="mt-8">

          <div className="mb-5">

            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
              Acquisition lifecycle
            </p>

            <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
              Where your project stands
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              DHARA connects the project proposal with the government
              workflow. Each stage is handled by the authority responsible
              for that part of the process.
            </p>

          </div>

          <div className="border border-[var(--line)] bg-[var(--white)]">

            {workflowStages.map((stage, index) => {

              const isCompleted =
                index < currentStageIndex

              const isCurrent =
                index === currentStageIndex

              const isUpcoming =
                index > currentStageIndex

              return (
                <motion.div
                  key={stage.title}
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.06,
                  }}
                  className={`relative grid gap-4 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:p-6 ${
                    isCurrent
                      ? "bg-[var(--paper)]"
                      : ""
                  }`}
                >

                  {/* STAGE NUMBER */}

                  <div className="flex items-center gap-3 sm:block">

                    <div
                      className={`flex h-9 w-9 items-center justify-center border ${
                        isCompleted
                          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--white)]"
                          : isCurrent
                            ? "border-[var(--earth)] text-[var(--earth)]"
                            : "border-[var(--line)] text-[var(--ink-soft)]"
                      }`}
                    >

                      {isCompleted ? (
                        <Check size={15} />
                      ) : (
                        <span className="font-mono text-[10px]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      )}

                    </div>

                    {isCurrent && (
                      <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--earth)] sm:hidden">
                        Current
                      </span>
                    )}

                  </div>

                  {/* INFORMATION */}

                  <div>

                    <div className="flex flex-wrap items-center gap-3">

                      <h3
                        className={`font-serif text-lg ${
                          isUpcoming
                            ? "text-[var(--ink-soft)]"
                            : ""
                        }`}
                      >
                        {stage.title}
                      </h3>

                      {isCurrent && (
                        <span className="hidden border border-[var(--earth)] px-2 py-1 font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--earth)] sm:inline-block">
                          Current stage
                        </span>
                      )}

                    </div>

                    <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--ink-soft)]">
                      {stage.authority}
                    </p>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                      {stage.description}
                    </p>

                  </div>

                  {/* STATUS */}

                  <div className="flex items-center gap-2 sm:justify-end">

                    {isCompleted && (
                      <>
                        <CheckCircle2
                          size={15}
                          strokeWidth={1.5}
                        />

                        <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                          Completed
                        </span>
                      </>
                    )}

                    {isCurrent && (
                      <>
                        <Clock3
                          size={15}
                          strokeWidth={1.5}
                          className="text-[var(--earth)]"
                        />

                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--earth)]">
                          In progress
                        </span>
                      </>
                    )}

                    {isUpcoming && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                        Upcoming
                      </span>
                    )}

                  </div>

                </motion.div>
              )
            })}

          </div>

        </section>

        {/* FIELD FINDINGS */}

        {needsRevision && (
          <section className="mt-8 border border-[var(--line)] bg-[var(--white)] p-6 sm:p-8">

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
              Field verification findings
            </p>

            <h2 className="mt-2 font-serif text-xl sm:text-2xl">
              Remarks from Field Officer
            </h2>

            <div className="mt-5 border-l-2 border-[var(--earth)] bg-[var(--paper)] p-5">

              <p className="text-sm leading-7 text-[var(--ink-soft)]">
                {project.fieldVerificationRemarks ||
                  "No detailed field remarks were recorded."}
              </p>

            </div>

          </section>
        )}

        {/* PROPOSAL INFORMATION */}

        <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">

          <div className="border border-[var(--line)] bg-[var(--white)] p-6 sm:p-8">

            <div className="flex items-center gap-3">

              <FileText
                size={18}
                strokeWidth={1.5}
              />

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Submitted proposal
                </p>

                <h2 className="mt-1 font-serif text-xl">
                  Project information
                </h2>

              </div>

            </div>

            <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Project type
                </p>

                <p className="mt-1 text-sm">
                  {project.projectType ||
                    "Not specified"}
                </p>

              </div>

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Purpose
                </p>

                <p className="mt-1 text-sm">
                  {project.purpose ||
                    "Not specified"}
                </p>

              </div>

              <div className="sm:col-span-2">

                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Description
                </p>

                <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">
                  {project.description ||
                    "No description provided."}
                </p>

              </div>

            </div>

          </div>

          {/* SYSTEM NOTE */}

          <aside className="border border-[var(--line)] bg-[var(--ink)] p-6 text-[var(--white)] sm:p-7">

            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--line)]">
              System note
            </p>

            <h3 className="mt-4 font-serif text-xl">
              Your proposal is now inside the DHARA workflow.
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#c7c2b8]">
              Government authorities review and progress the proposal
              according to their assigned responsibilities. The company
              can track the status but cannot perform government actions.
            </p>

            <div className="mt-7 border-t border-[#45443e] pt-5">

              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={17}
                  strokeWidth={1.5}
                  className="mt-0.5"
                />

                <p className="font-mono text-[9px] leading-5 tracking-[0.08em] text-[#c7c2b8]">
                  ACCESS / PROJECT AUTHORITY
                  <br />
                  VIEW + TRACK ONLY
                </p>

              </div>

            </div>

          </aside>

        </section>

        {/* BOTTOM ACTIONS */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <button
            onClick={() =>
              navigate("/portal/company")
            }
            className="inline-flex items-center justify-center gap-2 border border-[var(--ink)] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] transition hover:bg-[var(--ink)] hover:text-[var(--white)]"
          >

            <ArrowLeft size={14} />

            Back to company portal

          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 border border-[var(--line)] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >

            DHARA overview

            <ArrowRight size={14} />

          </button>

        </div>

      </div>

    </main>
  )
}

export default ProjectTracking