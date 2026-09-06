import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"
import { addLedgerEvent } from "../blockchain/dharaLedger"

const STORAGE_KEY = "dhara-projects"

function CentralProjectReview() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [decision, setDecision] = useState("")
  const [remarks, setRemarks] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const projects = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    )

    const foundProject = projects.find(
      (item) => item.id === projectId
    )

    setProject(foundProject || null)
  }, [projectId])

  const handleSubmit = async () => {
    if (!decision) return

    const projects = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    )

    const updatedProjects = projects.map((item) => {
      if (item.id !== projectId) return item

      if (decision === "approve") {
        return {
          ...item,

          stage: "Compensation",
          status: "Compensation Clearance Pending",
          authority: "Government Administration",
          nextAction: "Compensation Review",

          centralDecision: "Approved",
          centralDecisionRemarks: remarks.trim(),
          centralDecisionAt: new Date().toISOString(),
        }
      }

      if (decision === "information") {
        return {
          ...item,

          stage: "Central Oversight",
          status: "Additional Information Required",
          authority: "Project Authority",
          nextAction: "Company Information Required",

          centralDecision: "Information Required",
          centralDecisionRemarks: remarks.trim(),
          centralDecisionAt: new Date().toISOString(),
        }
      }

      return {
        ...item,

        stage: "Central Rejected",
        status: "Rejected",
        authority: "Central Authority",
        nextAction: "No Further Action",

        centralDecision: "Rejected",
        centralDecisionRemarks: remarks.trim(),
        centralDecisionAt: new Date().toISOString(),
      }
    })

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(updatedProjects)
    )

    const updatedProject = updatedProjects.find(
      (item) => item.id === projectId
    )

    if (decision === "approve") {
      await addLedgerEvent({
        projectId,
        event: "CENTRAL OVERSIGHT COMPLETED",
        authority: "Central Authority",
        details: {
          projectName: project?.projectName || project?.name || "—",
          state: project?.state || "—",
          district: project?.district || "—",
          decision: "Approved",
          remarks: remarks.trim(),
          nextStage: "Compensation",
        },
      })
    }

    setProject(updatedProject)
    setSubmitted(true)
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] flex items-center justify-center px-6">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-soft)] mb-4">
            Project record unavailable
          </p>

          <button
            onClick={() => navigate("/portal/central")}
            className="inline-flex items-center gap-2 border border-[var(--line-dark)] px-5 py-3 font-mono text-xs uppercase tracking-wider hover:bg-[var(--ink)] hover:text-[var(--paper)] transition"
          >
            <ArrowLeft size={14} />
            Back to Central Authority
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[var(--earth)] blur-[140px] opacity-10" />
        </div>

        <main className="relative min-h-screen flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-xl w-full border border-[var(--line)] bg-[var(--white)] p-8 md:p-12 text-center"
          >
            <div className="w-14 h-14 mx-auto mb-6 border border-[var(--earth)] flex items-center justify-center">
              {decision === "approve" ? (
                <CheckCircle2
                  size={25}
                  className="text-[var(--earth)]"
                />
              ) : decision === "information" ? (
                <AlertTriangle
                  size={25}
                  className="text-[var(--earth)]"
                />
              ) : (
                <XCircle
                  size={25}
                  className="text-[var(--earth)]"
                />
              )}
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--ink-soft)] mb-3">
              Central Authority Decision Recorded
            </p>

            <h1 className="font-serif text-3xl md:text-4xl mb-4">
              {decision === "approve"
                ? "Project approved."
                : decision === "information"
                ? "Information requested."
                : "Project rejected."}
            </h1>

            <p className="font-mono text-xs text-[var(--ink-soft)] leading-6 mb-8">
              {decision === "approve"
                ? "The project has been cleared for compensation review."
                : decision === "information"
                ? "The project has been returned to the Project Authority for additional information."
                : "The project has been rejected at the Central Authority level."}
            </p>

            <div className="border border-[var(--line)] p-4 text-left mb-8">
              <div className="flex justify-between gap-4 mb-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                  Project
                </span>

                <span className="font-mono text-xs">
                  {project.id}
                </span>
              </div>

              <div className="flex justify-between gap-4">
                <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)]">
                  New Stage
                </span>

                <span className="font-mono text-xs">
                  {project.stage}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/portal/central")}
              className="w-full bg-[var(--ink)] text-[var(--paper)] py-3.5 font-mono text-xs uppercase tracking-[0.18em] hover:bg-[var(--earth-dark)] transition"
            >
              Return to Central Dashboard
            </button>
          </motion.div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* ================= HEADER ================= */}
      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate("/portal/central")}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)] hover:text-[var(--ink)] transition"
            >
              <ArrowLeft size={14} />
              Central Authority
            </button>

            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              <ShieldCheck size={14} />
              National Oversight
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN ================= */}
      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* ================= TITLE ================= */}
        <section className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--earth)] mb-3">
                Central Project Review
              </p>

              <h1 className="font-serif text-4xl md:text-5xl leading-tight">
                National oversight
              </h1>

              <p className="mt-4 max-w-2xl font-mono text-xs leading-6 text-[var(--ink-soft)]">
                Review the project record and determine whether it can
                proceed toward compensation clearance and implementation
                eligibility.
              </p>
            </div>

            <div className="border border-[var(--line)] px-5 py-4 bg-[var(--white)]">
              <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                Project ID
              </p>

              <p className="font-mono text-sm mt-1">
                {project.id}
              </p>
            </div>
          </div>
        </section>

        {/* ================= PROJECT OVERVIEW ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_0.8fr] gap-6 mb-8">

          <div className="border border-[var(--line)] bg-[var(--white)]">
            <div className="border-b border-[var(--line)] px-6 py-4 flex items-center gap-3">
              <Building2 size={16} />

              <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
                Project Record
              </p>
            </div>

            <div className="p-6">
              <h2 className="font-serif text-2xl md:text-3xl mb-6">
                {project.projectName || project.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <InfoBlock
                  label="Project Type"
                  value={project.projectType || "Not specified"}
                />

                <InfoBlock
                  label="State"
                  value={project.state || "Not specified"}
                  icon={<MapPin size={13} />}
                />

                <InfoBlock
                  label="District"
                  value={project.district || "Not specified"}
                  icon={<MapPin size={13} />}
                />

                <InfoBlock
                  label="Land Requirement"
                  value={`${project.landArea || "—"} acres`}
                  icon={<LandPlot size={13} />}
                />

                <InfoBlock
                  label="Number of Parcels"
                  value={project.parcels || "—"}
                  icon={<LandPlot size={13} />}
                />

                <InfoBlock
                  label="Current Authority"
                  value={project.authority || "—"}
                />

              </div>
            </div>
          </div>

          {/* CURRENT STATUS */}
          <div className="border border-[var(--line)] bg-[var(--ink)] text-[var(--paper)]">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
                Current Workflow Position
              </p>
            </div>

            <div className="p-6">
              <p className="font-mono text-[9px] uppercase tracking-wider opacity-50 mb-2">
                Stage
              </p>

              <p className="font-serif text-2xl mb-7">
                {project.stage}
              </p>

              <p className="font-mono text-[9px] uppercase tracking-wider opacity-50 mb-2">
                Status
              </p>

              <p className="font-mono text-xs mb-7">
                {project.status}
              </p>

              <div className="border-t border-white/10 pt-5">
                <p className="font-mono text-[9px] uppercase tracking-wider opacity-50 mb-2">
                  Next Action
                </p>

                <p className="font-mono text-xs">
                  {project.nextAction}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= LAND REQUIREMENT ================= */}
        <section className="border border-[var(--line)] bg-[var(--white)] mb-8">
          <div className="border-b border-[var(--line)] px-6 py-4 flex items-center gap-3">
            <LandPlot size={16} />

            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Land Requirement & Purpose
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] mb-3">
                  Proposed Requirement
                </p>

                <p className="font-serif text-3xl">
                  {project.landArea || "—"} acres
                </p>

                <p className="font-mono text-xs text-[var(--ink-soft)] mt-2">
                  {project.parcels || "—"} parcels identified
                </p>
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] mb-3">
                  Purpose / Justification
                </p>

                <p className="font-mono text-xs leading-6 text-[var(--ink-soft)]">
                  {project.purpose ||
                    "No purpose or land requirement justification has been provided."}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ================= DESCRIPTION ================= */}
        {project.description && (
          <section className="border border-[var(--line)] bg-[var(--white)] mb-8">
            <div className="border-b border-[var(--line)] px-6 py-4 flex items-center gap-3">
              <FileText size={16} />

              <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
                Project Description
              </p>
            </div>

            <div className="p-6">
              <p className="font-mono text-xs leading-7 text-[var(--ink-soft)]">
                {project.description}
              </p>
            </div>
          </section>
        )}

        {/* ================= FIELD + DISTRICT FINDINGS ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

          {/* FIELD */}
          <ReviewPanel
            title="Field Verification"
            status={project.fieldVerification}
            remarks={project.fieldVerificationRemarks}
          />

          {/* DISTRICT */}
          <ReviewPanel
            title="District Field Review"
            status={project.districtFieldReview}
            remarks={project.districtFieldReviewRemarks}
          />

        </section>

        {/* ================= STATE DECISION ================= */}
        <section className="border border-[var(--line)] bg-[var(--white)] mb-8">
          <div className="border-b border-[var(--line)] px-6 py-4 flex items-center gap-3">
            <ShieldCheck size={16} />

            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
              State Authority Decision
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

              <div>
                <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] mb-2">
                  Decision
                </p>

                <p className="font-serif text-2xl">
                  {project.stateDecision || "Approved"}
                </p>
              </div>

              {project.stateDecisionRemarks && (
                <div className="max-w-xl">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] mb-2">
                    Remarks
                  </p>

                  <p className="font-mono text-xs leading-6 text-[var(--ink-soft)]">
                    {project.stateDecisionRemarks}
                  </p>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* ================= DECISION ================= */}
        <section className="border border-[var(--line-dark)] bg-[var(--paper-deep)]">

          <div className="border-b border-[var(--line)] px-6 py-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
              Central Authority Decision
            </p>

            <p className="font-mono text-[11px] text-[var(--ink-soft)] mt-2">
              Record the national-level decision for this project.
            </p>
          </div>

          <div className="p-6 md:p-8">

            {/* DECISION BUTTONS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-7">

              <DecisionButton
                active={decision === "approve"}
                onClick={() => setDecision("approve")}
                icon={<CheckCircle2 size={16} />}
                title="Approve"
                description="Proceed to compensation"
              />

              <DecisionButton
                active={decision === "information"}
                onClick={() => setDecision("information")}
                icon={<AlertTriangle size={16} />}
                title="Request Information"
                description="Return to company"
              />

              <DecisionButton
                active={decision === "reject"}
                onClick={() => setDecision("reject")}
                icon={<XCircle size={16} />}
                title="Reject"
                description="End project workflow"
              />

            </div>

            {/* REMARKS */}
            <div className="mb-7">
              <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)] mb-3">
                Decision Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) => setRemarks(event.target.value)}
                rows={5}
                placeholder="Enter the reasoning, conditions, or information required..."
                className="w-full resize-none border border-[var(--line-dark)] bg-[var(--white)] px-4 py-3 font-mono text-xs leading-6 outline-none focus:border-[var(--earth)] transition"
              />
            </div>

            {/* SUBMIT */}
            <button
              onClick={handleSubmit}
              disabled={!decision}
              className={`w-full py-4 font-mono text-xs uppercase tracking-[0.18em] transition ${
                decision
                  ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--earth-dark)]"
                  : "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed"
              }`}
            >
              Record Central Authority Decision
            </button>

          </div>
        </section>

      </main>
    </div>
  )
}

/* =========================================================
   INFO BLOCK
========================================================= */

function InfoBlock({ label, value, icon }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] mb-2">
        {label}
      </p>

      <div className="flex items-center gap-2">
        {icon && (
          <span className="text-[var(--earth)]">
            {icon}
          </span>
        )}

        <p className="font-mono text-xs">
          {value}
        </p>
      </div>
    </div>
  )
}

/* =========================================================
   REVIEW PANEL
========================================================= */

function ReviewPanel({ title, status, remarks }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--white)]">
      <div className="border-b border-[var(--line)] px-6 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]">
          {title}
        </p>
      </div>

      <div className="p-6">
        <div className="mb-5">
          <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] mb-2">
            Finding
          </p>

          <p className="font-serif text-xl">
            {status || "Not recorded"}
          </p>
        </div>

        <div>
          <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] mb-2">
            Remarks
          </p>

          <p className="font-mono text-xs leading-6 text-[var(--ink-soft)]">
            {remarks || "No remarks recorded."}
          </p>
        </div>
      </div>
    </div>
  )
}

/* =========================================================
   DECISION BUTTON
========================================================= */

function DecisionButton({
  active,
  onClick,
  icon,
  title,
  description,
}) {
  return (
    <button
      onClick={onClick}
      className={`text-left border p-4 transition ${
        active
          ? "border-[var(--earth)] bg-[var(--white)]"
          : "border-[var(--line)] bg-transparent hover:border-[var(--line-dark)]"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={
            active
              ? "text-[var(--earth)]"
              : "text-[var(--ink-soft)]"
          }
        >
          {icon}
        </span>

        <div>
          <p className="font-mono text-xs uppercase tracking-wider">
            {title}
          </p>

          <p className="font-mono text-[9px] text-[var(--ink-soft)] mt-1">
            {description}
          </p>
        </div>
      </div>
    </button>
  )
}

export default CentralProjectReview