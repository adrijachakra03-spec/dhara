import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"

function DistrictFieldReview() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [decision, setDecision] = useState("")
  const [remarks, setRemarks] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const projects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const foundProject = projects.find(
      (item) => item.id === projectId
    )

    setProject(foundProject || null)
  }, [projectId])

  const handleSubmit = () => {
    if (!decision) return

    const projects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const updatedProjects = projects.map((item) => {
      if (item.id !== projectId) return item

      if (decision === "verified") {
        return {
          ...item,
          stage: "State Scrutiny",
          status: "Pending State Review",
          authority: "State Authority",
          nextAction: "State Authority Review",
          districtFieldReview: "Verified",
          districtFieldReviewRemarks: remarks.trim(),
          districtFieldReviewAt: new Date().toISOString(),
        }
      }

      if (decision === "correction") {
        return {
          ...item,
          stage: "Field Verification",
          status: "Field Reverification Required",
          authority: "Field Officer",
          nextAction: "Field Officer Reverification",
          districtFieldReview: "Correction Required",
          districtFieldReviewRemarks: remarks.trim(),
          districtFieldReviewAt: new Date().toISOString(),
        }
      }

      return {
        ...item,
        stage: "District Rejected",
        status: "Rejected",
        authority: "District Authority",
        nextAction: "No Further Action",
        districtFieldReview: "Rejected",
        districtFieldReviewRemarks: remarks.trim(),
        districtFieldReviewAt: new Date().toISOString(),
      }
    })

    localStorage.setItem(
      "dhara-projects",
      JSON.stringify(updatedProjects)
    )

    setSubmitted(true)
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[var(--paper)] px-6 py-10 text-[var(--ink)]">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/portal/district")}
            className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)] transition hover:text-[var(--earth)]"
          >
            <ArrowLeft size={14} />
            Back to district authority
          </button>

          <div className="border border-[var(--line)] bg-[var(--white)] p-8">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--earth)]">
              Project not found
            </p>

            <h1 className="mt-3 font-serif text-3xl">
              No field review record available
            </h1>
          </div>
        </div>
      </main>
    )
  }

  if (submitted) {
    const successMessage =
      decision === "verified"
        ? "Field verification confirmed. The project has been forwarded to State Authority."
        : decision === "correction"
          ? "The project has been returned to the Field Officer for reverification."
          : "The project has been rejected at District Field Review."

    return (
      <main className="min-h-screen bg-[var(--paper)] px-5 py-10 text-[var(--ink)] sm:px-8">
        <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full border border-[var(--line)] bg-[var(--white)] p-8 text-center sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center border border-[var(--earth)] text-[var(--earth)]">
              {decision === "verified" ? (
                <CheckCircle2 size={28} />
              ) : decision === "correction" ? (
                <RotateCcw size={28} />
              ) : (
                <XCircle size={28} />
              )}
            </div>

            <p className="mt-7 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
              District Field Review Recorded
            </p>

            <h1 className="mt-3 font-serif text-3xl sm:text-4xl">
              Review completed
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              {successMessage}
            </p>

            <div className="mt-8 border border-[var(--line)] bg-[var(--paper)] p-5 text-left">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-soft)]">
                Project
              </p>

              <p className="mt-2 font-serif text-xl">
                {project.projectName}
              </p>

              <p className="mt-1 font-mono text-[10px] text-[var(--ink-soft)]">
                {project.id}
              </p>
            </div>

            <button
              onClick={() => navigate("/portal/district")}
              className="mt-8 inline-flex items-center gap-2 bg-[var(--ink)] px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)]"
            >
              Back to district authority
              <ArrowLeft size={14} />
            </button>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <header className="border-b border-[var(--line)] bg-[var(--white)]">
        <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
          <button
            onClick={() => navigate("/portal/district")}
            className="mb-5 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)] transition hover:text-[var(--earth)]"
          >
            <ArrowLeft size={14} />
            District Authority
          </button>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
                District Field Review
              </p>

              <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
                Review Field Verification
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                Review the Field Officer's verification findings before
                forwarding the project to State Authority.
              </p>
            </div>

            <div className="flex items-center gap-2 border border-[var(--line)] bg-[var(--paper)] px-4 py-3">
              <ShieldCheck size={15} />

              <span className="font-mono text-[10px] uppercase tracking-wider">
                District Controlled Action
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Project information */}
        <section className="space-y-6">
          <div className="border border-[var(--line)] bg-[var(--white)]">
            <div className="border-b border-[var(--line)] px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--earth)]">
                Project Record
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                {project.projectName}
              </h2>

              <p className="mt-1 font-mono text-[10px] text-[var(--ink-soft)]">
                {project.id}
              </p>
            </div>

            <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2">
              <div className="bg-[var(--white)] p-5">
                <div className="flex items-center gap-2 text-[var(--ink-soft)]">
                  <MapPin size={14} />
                  <span className="font-mono text-[9px] uppercase tracking-wider">
                    Location
                  </span>
                </div>

                <p className="mt-3 font-serif text-lg">
                  {project.district}, {project.state}
                </p>
              </div>

              <div className="bg-[var(--white)] p-5">
                <div className="flex items-center gap-2 text-[var(--ink-soft)]">
                  <LandPlot size={14} />
                  <span className="font-mono text-[9px] uppercase tracking-wider">
                    Land Requirement
                  </span>
                </div>

                <p className="mt-3 font-serif text-lg">
                  {project.landArea} acres
                </p>
              </div>

              <div className="bg-[var(--white)] p-5">
                <div className="flex items-center gap-2 text-[var(--ink-soft)]">
                  <FileText size={14} />
                  <span className="font-mono text-[9px] uppercase tracking-wider">
                    Parcels
                  </span>
                </div>

                <p className="mt-3 font-serif text-lg">
                  {project.parcels}
                </p>
              </div>

              <div className="bg-[var(--white)] p-5">
                <div className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                  Field Officer Decision
                </div>

                <p className="mt-3 font-mono text-xs uppercase text-[var(--earth)]">
                  {project.fieldVerification || "Not recorded"}
                </p>
              </div>
            </div>
          </div>

          {/* Field officer findings */}
          <div className="border border-[var(--line)] bg-[var(--white)]">
            <div className="border-b border-[var(--line)] px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--earth)]">
                Field Verification Findings
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Officer remarks
              </h2>
            </div>

            <div className="p-6">
              <div className="border-l-2 border-[var(--earth)] bg-[var(--paper)] p-5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-soft)]">
                  Recorded remarks
                </p>

                <p className="mt-3 text-sm leading-7 text-[var(--ink)]">
                  {project.fieldVerificationRemarks ||
                    "No additional remarks were recorded by the Field Officer."}
                </p>
              </div>

              {project.fieldVerificationAt && (
                <p className="mt-4 font-mono text-[9px] text-[var(--ink-soft)]">
                  Verification recorded:{" "}
                  {new Date(
                    project.fieldVerificationAt
                  ).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Decision panel */}
        <section>
          <div className="sticky top-6 border border-[var(--line)] bg-[var(--white)]">
            <div className="border-b border-[var(--line)] px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--earth)]">
                Administrative Decision
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                District review
              </h2>

              <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                Select the action to be recorded against this project.
              </p>
            </div>

            <div className="space-y-3 p-6">
              <button
                onClick={() => setDecision("verified")}
                className={`w-full border p-4 text-left transition ${
                  decision === "verified"
                    ? "border-[var(--earth)] bg-[var(--paper)]"
                    : "border-[var(--line)] hover:border-[var(--earth)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider">
                      Confirm verification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                      Accept the field findings and forward the project to
                      State Authority.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setDecision("correction")}
                className={`w-full border p-4 text-left transition ${
                  decision === "correction"
                    ? "border-[var(--earth)] bg-[var(--paper)]"
                    : "border-[var(--line)] hover:border-[var(--earth)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <RotateCcw size={18} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider">
                      Send for reverification
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                      Return the project to the Field Officer for another
                      verification.
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setDecision("reject")}
                className={`w-full border p-4 text-left transition ${
                  decision === "reject"
                    ? "border-[var(--earth)] bg-[var(--paper)]"
                    : "border-[var(--line)] hover:border-[var(--earth)]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <XCircle size={18} className="mt-0.5 shrink-0" />

                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider">
                      Reject project
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                      Record a final District rejection.
                    </p>
                  </div>
                </div>
              </button>

              <div className="pt-4">
                <label className="font-mono text-[9px] uppercase tracking-widest text-[var(--ink-soft)]">
                  District remarks
                </label>

                <textarea
                  value={remarks}
                  onChange={(event) =>
                    setRemarks(event.target.value)
                  }
                  rows={5}
                  placeholder="Record the reasoning or instructions for this decision..."
                  className="mt-2 w-full resize-none border border-[var(--line)] bg-[var(--paper)] p-4 text-sm outline-none transition focus:border-[var(--earth)]"
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!decision}
                className="mt-2 flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-5 py-4 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Record district decision
                <CheckCircle2 size={15} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DistrictFieldReview