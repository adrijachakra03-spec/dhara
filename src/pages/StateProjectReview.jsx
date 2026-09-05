import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  MessageSquare,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"

const STORAGE_KEY = "dhara-projects"

function StateProjectReview() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [decision, setDecision] = useState("")
  const [remarks, setRemarks] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    try {
      const projects = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      )

      const foundProject = projects.find(
        (item) => item.id === projectId
      )

      setProject(foundProject || null)
    } catch (error) {
      console.error("Failed to load project:", error)
      setProject(null)
    }
  }, [projectId])

  const handleSubmit = () => {
    if (!decision) return

    try {
      const projects = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      )

      const updatedProjects = projects.map((item) => {
        if (item.id !== projectId) return item

        if (decision === "approve") {
          return {
            ...item,
            stage: "Central Oversight",
            status: "Pending Central Review",
            authority: "Central Authority",
            nextAction: "Central Authority Review",
            stateDecision: "Approved",
            stateDecisionRemarks: remarks.trim(),
            stateDecisionAt: new Date().toISOString(),
          }
        }

        if (decision === "information") {
          return {
            ...item,
            stage: "State Scrutiny",
            status: "Additional Information Required",
            authority: "Project Authority",
            nextAction: "State Authority Information Request",
            stateDecision: "Information Required",
            stateDecisionRemarks: remarks.trim(),
            stateDecisionAt: new Date().toISOString(),
          }
        }

        return {
          ...item,
          stage: "State Rejected",
          status: "Rejected",
          authority: "State Authority",
          nextAction: "No Further Action",
          stateDecision: "Rejected",
          stateDecisionRemarks: remarks.trim(),
          stateDecisionAt: new Date().toISOString(),
        }
      })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProjects)
      )

      setSubmitted(true)
    } catch (error) {
      console.error("Failed to record state decision:", error)
    }
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
        <div className="mx-auto max-w-4xl px-5 py-10 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/portal/state")}
            className="mb-8 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)] hover:text-[var(--ink)]"
          >
            <ArrowLeft size={14} />
            Back to state dashboard
          </button>

          <div className="border border-[var(--line)] p-10 text-center">
            <XCircle
              size={30}
              className="mx-auto mb-4 text-[var(--earth)]"
            />

            <h1 className="font-serif text-2xl">
              Project record not found.
            </h1>

            <p className="mt-2 text-sm text-[var(--ink-soft)]">
              The requested project could not be loaded from DHARA.
            </p>
          </div>
        </div>
      </main>
    )
  }

  if (submitted) {
    const decisionText =
      decision === "approve"
        ? "Project forwarded to Central Authority."
        : decision === "information"
          ? "Additional information has been requested."
          : "Project has been rejected at state level."

    return (
      <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-5 py-10 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full border border-[var(--line)] bg-[var(--white)]"
          >
            <div className="border-b border-[var(--line)] p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center border border-[var(--earth)] text-[var(--earth)]">
                  <CheckCircle2 size={20} />
                </div>

                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--earth)]">
                    Decision recorded
                  </p>

                  <h1 className="mt-1 font-serif text-2xl">
                    State review completed.
                  </h1>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <p className="text-sm leading-6 text-[var(--ink-soft)]">
                {decisionText}
              </p>

              <div className="mt-6 border border-[var(--line)] bg-[var(--paper)] p-5">
                <p className="font-serif text-lg">
                  {project.projectName}
                </p>

                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  {project.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/portal/state")}
                className="mt-6 inline-flex items-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--paper)] transition hover:border-[var(--earth)] hover:bg-[var(--earth)]"
              >
                Return to state dashboard
                <ArrowLeft size={14} />
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* HEADER */}
      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/portal/state")}
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
          >
            <ArrowLeft size={14} />
            State dashboard
          </button>

          <div className="text-right">
            <p className="font-serif text-lg">DHARA</p>

            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              State Project Review
            </p>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        {/* INTRO */}
        <div className="mb-8 border-b border-[var(--line)] pb-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--earth)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--earth)]" />
                State-level scrutiny
              </div>

              <h1 className="font-serif text-3xl leading-tight sm:text-4xl">
                Review project for state-level clearance.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                Review the project proposal and district-confirmed field
                findings before deciding whether the project should proceed
                to central oversight.
              </p>
            </div>

            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              {project.id}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* PROJECT RECORD */}
            <section className="border border-[var(--line)] bg-[var(--white)]">
              <div className="border-b border-[var(--line)] p-5 sm:p-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Project record
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  {project.projectName}
                </h2>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                  <span className="inline-flex items-center gap-2">
                    <Building2 size={13} />
                    {project.projectType || "Project"}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <MapPin size={13} />
                    {project.district}, {project.state}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 divide-y divide-[var(--line)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                <div className="p-5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    Land requirement
                  </p>

                  <p className="mt-2 font-serif text-2xl">
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

                  <p className="mt-2 font-serif text-2xl">
                    {project.parcels || "—"}
                  </p>

                  <p className="mt-1 font-mono text-[9px] uppercase text-[var(--ink-soft)]">
                    Identified parcels
                  </p>
                </div>
              </div>
            </section>

            {/* PURPOSE */}
            <section className="border border-[var(--line)] bg-[var(--white)] p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-2">
                <FileText size={15} />

                <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                  Land requirement & purpose
                </p>
              </div>

              <p className="text-sm leading-7 text-[var(--ink-soft)]">
                {project.purpose ||
                  "No land requirement justification was provided."}
              </p>

              {project.description && (
                <div className="mt-5 border-t border-[var(--line)] pt-5">
                  <p className="mb-2 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    Project description
                  </p>

                  <p className="text-sm leading-7 text-[var(--ink-soft)]">
                    {project.description}
                  </p>
                </div>
              )}
            </section>

            {/* FIELD FINDINGS */}
            <section className="border border-[var(--line)] bg-[var(--white)]">
              <div className="border-b border-[var(--line)] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center border border-[var(--earth)] text-[var(--earth)]">
                    <LandPlot size={17} />
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      District field review
                    </p>

                    <h2 className="mt-1 font-serif text-xl">
                      Verified field findings
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <ShieldCheck
                    size={18}
                    className="text-[var(--earth)]"
                  />

                  <span className="font-mono text-[10px] uppercase tracking-[0.12em]">
                    {project.fieldVerification || "Verified"}
                  </span>
                </div>

                {project.fieldVerificationRemarks ? (
                  <div className="mt-5 border-l-2 border-[var(--earth)] pl-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      Field officer remarks
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {project.fieldVerificationRemarks}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[var(--ink-soft)]">
                    No additional field officer remarks were recorded.
                  </p>
                )}

                {project.districtFieldReviewRemarks && (
                  <div className="mt-5 border-t border-[var(--line)] pt-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      District Authority confirmation
                    </p>

                    <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                      {project.districtFieldReviewRemarks}
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT */}
          <aside>
            <div className="sticky top-6 border border-[var(--line-dark)] bg-[var(--white)]">
              <div className="border-b border-[var(--line)] bg-[var(--paper)] p-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  State decision
                </p>

                <h2 className="mt-1 font-serif text-xl">
                  Record review outcome
                </h2>
              </div>

              <div className="p-5">
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setDecision("approve")}
                    className={`w-full border p-4 text-left transition ${
                      decision === "approve"
                        ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                        : "border-[var(--line)] hover:border-[var(--line-dark)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
                          Approve for central oversight
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                          Forward the project to the Central Authority for
                          national-level oversight.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision("information")}
                    className={`w-full border p-4 text-left transition ${
                      decision === "information"
                        ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                        : "border-[var(--line)] hover:border-[var(--line-dark)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
                          Request information
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                          Return the project to the Project Authority for
                          additional information.
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDecision("reject")}
                    className={`w-full border p-4 text-left transition ${
                      decision === "reject"
                        ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                        : "border-[var(--line)] hover:border-[var(--line-dark)]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <XCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
                          Reject project
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                          Record a state-level rejection and close the
                          government workflow.
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="mt-6">
                  <label className="mb-2 block font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    Review remarks
                  </label>

                  <textarea
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    rows={6}
                    placeholder="Record the reasoning, observations, or information required..."
                    className="w-full resize-none border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--earth)]"
                  />
                </div>

                <button
                  type="button"
                  disabled={!decision}
                  onClick={handleSubmit}
                  className="mt-4 flex w-full items-center justify-center gap-3 border border-[var(--ink)] bg-[var(--ink)] px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--paper)] transition hover:border-[var(--earth)] hover:bg-[var(--earth)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Record state decision
                  <CheckCircle2 size={14} />
                </button>

                <p className="mt-4 text-center font-mono text-[8px] uppercase leading-4 tracking-[0.1em] text-[var(--ink-soft)]">
                  Decision will update the shared DHARA project record
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}

export default StateProjectReview