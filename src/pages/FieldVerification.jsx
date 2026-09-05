import { useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { motion } from "framer-motion"

function FieldVerification() {
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
          stage: "District Field Review",
          status: "Field Verification Completed",
          authority: "District Authority",
          nextAction: "District Authority Review",
          fieldVerification: "Verified",
          fieldVerificationRemarks: remarks.trim(),
          fieldVerificationAt: new Date().toISOString(),
        }
      }

      return {
        ...item,
        stage: "Company Revision",
        status: "Field Verification Issue",
        authority: "Project Authority",
        nextAction: "Company Revision Required",
        fieldVerification: "Issue Found",
        fieldVerificationRemarks: remarks.trim(),
        fieldVerificationAt: new Date().toISOString(),
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
      <main className="min-h-screen bg-[var(--paper)] px-6 py-12 text-[var(--ink)]">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/portal/field")}
            className="mb-8 flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)]"
          >
            <ArrowLeft size={14} />
            Back to field officer portal
          </button>

          <div className="border border-[var(--line)] bg-[var(--white)] p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--earth)]">
              Record not found
            </p>

            <h1 className="mt-3 font-serif text-3xl">
              Project could not be located.
            </h1>
          </div>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[var(--paper)] px-6 py-12 text-[var(--ink)]">
        <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full border border-[var(--line)] bg-[var(--white)] p-8 text-center md:p-12"
          >
            <CheckCircle2
              size={42}
              strokeWidth={1.4}
              className="mx-auto text-[var(--earth)]"
            />

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
              Verification submitted
            </p>

            <h1 className="mt-3 font-serif text-3xl md:text-4xl">
              Field report recorded.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              The field verification has been submitted and the
              project has been returned to the District Authority
              for review.
            </p>

            <button
              onClick={() => navigate("/portal/field")}
              className="mt-8 bg-[var(--ink)] px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)]"
            >
              Back to field portal
            </button>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* HEADER */}

      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <button
            onClick={() => navigate("/portal/field")}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)] transition hover:text-[var(--earth)]"
          >
            <ArrowLeft size={14} />
            Field Officer Portal
          </button>

          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-[var(--ink-soft)]">
            <ShieldCheck size={14} />
            Field verification
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">

        {/* PROJECT HEADER */}

        <section className="border-b border-[var(--line)] pb-8">
          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--earth)]">
            Assigned verification · {project.id}
          </p>

          <h1 className="mt-3 max-w-4xl font-serif text-3xl leading-tight md:text-5xl">
            {project.projectName || project.name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
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
        </section>

        {/* INFORMATION */}

        <section className="grid gap-6 py-8 md:grid-cols-2">

          <div className="border border-[var(--line)] bg-[var(--white)] p-6">
            <div className="flex items-center gap-3">
              <LandPlot
                size={18}
                strokeWidth={1.4}
                className="text-[var(--earth)]"
              />

              <h2 className="font-serif text-xl">
                Land requirement
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">

              <div className="border-t border-[var(--line)] pt-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                  Required area
                </p>

                <p className="mt-1 font-serif text-2xl">
                  {project.landArea || project.land}
                </p>

                <p className="font-mono text-[9px] text-[var(--ink-soft)]">
                  acres
                </p>
              </div>

              <div className="border-t border-[var(--line)] pt-3">
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                  Parcels
                </p>

                <p className="mt-1 font-serif text-2xl">
                  {project.parcels || 0}
                </p>

                <p className="font-mono text-[9px] text-[var(--ink-soft)]">
                  identified
                </p>
              </div>

            </div>
          </div>

          <div className="border border-[var(--line)] bg-[var(--white)] p-6">
            <div className="flex items-center gap-3">
              <FileText
                size={18}
                strokeWidth={1.4}
                className="text-[var(--earth)]"
              />

              <h2 className="font-serif text-xl">
                Project purpose
              </h2>
            </div>

            <p className="mt-6 text-sm leading-7 text-[var(--ink-soft)]">
              {project.purpose ||
                "No project purpose has been recorded."}
            </p>
          </div>

        </section>

        {/* VERIFICATION */}

        <section className="border border-[var(--line)] bg-[var(--white)]">

          <div className="border-b border-[var(--line)] p-6 md:p-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
              Verification decision
            </p>

            <h2 className="mt-2 font-serif text-2xl md:text-3xl">
              Record field findings
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              Confirm whether the submitted land requirement and
              identified parcels correspond with the field findings.
            </p>
          </div>

          <div className="space-y-6 p-6 md:p-8">

            <div className="grid gap-4 md:grid-cols-2">

              <button
                type="button"
                onClick={() => setDecision("verified")}
                className={`border p-5 text-left transition ${
                  decision === "verified"
                    ? "border-[var(--earth)] bg-[var(--paper)]"
                    : "border-[var(--line)] hover:border-[var(--line-dark)]"
                }`}
              >
                <CheckCircle2
                  size={22}
                  strokeWidth={1.4}
                  className="text-[var(--earth)]"
                />

                <h3 className="mt-4 font-serif text-xl">
                  Verified
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  Land and parcel information is consistent with
                  field findings.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setDecision("issue")}
                className={`border p-5 text-left transition ${
                  decision === "issue"
                    ? "border-[var(--earth)] bg-[var(--paper)]"
                    : "border-[var(--line)] hover:border-[var(--line-dark)]"
                }`}
              >
                <XCircle
                  size={22}
                  strokeWidth={1.4}
                  className="text-[var(--earth)]"
                />

                <h3 className="mt-4 font-serif text-xl">
                  Issue found
                </h3>

                <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
                  A discrepancy or issue requires correction or
                  further action.
                </p>
              </button>

            </div>

            {/* REMARKS */}

            <div>
              <label className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                Field remarks
              </label>

              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={5}
                placeholder="Record observations, discrepancies, parcel findings, or verification notes..."
                className="mt-2 w-full resize-none border border-[var(--line)] bg-[var(--paper)] p-4 text-sm outline-none transition focus:border-[var(--earth)]"
              />
            </div>

            {/* SUBMIT */}

            <div className="flex flex-col justify-between gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center">

              <p className="max-w-md font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                This action records the field officer's finding
                against the project workflow.
              </p>

              <button
                type="button"
                disabled={!decision}
                onClick={handleSubmit}
                className="flex items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Submit verification
                <ArrowLeft
                  size={14}
                  className="rotate-180"
                />
              </button>

            </div>

          </div>
        </section>

      </div>
    </main>
  )
}

export default FieldVerification