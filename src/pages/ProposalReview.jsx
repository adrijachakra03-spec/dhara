import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
  RotateCcw,
  XCircle,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

function ProposalReview() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const storedProjects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const foundProject = storedProjects.find(
      (item) => item.id === projectId
    )

    if (foundProject) {
      setProject(foundProject)
    } else {
      setNotFound(true)
    }
  }, [projectId])

  // ACCEPT PROPOSAL
  const handleAccept = () => {
    const storedProjects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const updatedProjects = storedProjects.map((item) => {
      if (item.id !== projectId) {
        return item
      }

      return {
        ...item,
        stage: "Field Verification",
        status: "Pending Field Verification",
        authority: "Field Officer",
        nextAction: "Field Officer Verification",
        districtDecision: "Accepted",
        districtDecisionAt: new Date().toISOString(),
      }
    })

    localStorage.setItem(
      "dhara-projects",
      JSON.stringify(updatedProjects)
    )

    navigate("/portal/district")
  }

  // REQUEST CHANGES
  const handleRequestChanges = () => {
    const storedProjects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const updatedProjects = storedProjects.map((item) => {
      if (item.id !== projectId) {
        return item
      }

      return {
        ...item,
        stage: "Company Revision",
        status: "Changes Requested",
        authority: "Project Authority",
        nextAction: "Company Revision Required",
        districtDecision: "Changes Requested",
        districtDecisionAt: new Date().toISOString(),
      }
    })

    localStorage.setItem(
      "dhara-projects",
      JSON.stringify(updatedProjects)
    )

    navigate("/portal/district")
  }

  // REJECT PROPOSAL
  const handleReject = () => {
    const storedProjects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const updatedProjects = storedProjects.map((item) => {
      if (item.id !== projectId) {
        return item
      }

      return {
        ...item,
        stage: "District Rejected",
        status: "Rejected",
        authority: "District Authority",
        nextAction: "No Further Action",
        districtDecision: "Rejected",
        districtDecisionAt: new Date().toISOString(),
      }
    })

    localStorage.setItem(
      "dhara-projects",
      JSON.stringify(updatedProjects)
    )

    navigate("/portal/district")
  }

  if (notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6 text-[var(--ink)]">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
            Record not found
          </div>

          <h1 className="mt-3 font-serif text-3xl">
            Proposal unavailable
          </h1>

          <button
            onClick={() => navigate("/portal/district")}
            className="mt-6 inline-flex items-center gap-2 border border-[var(--line)] px-4 py-3 font-mono text-[10px] uppercase tracking-wider transition hover:bg-[var(--paper-deep)]"
          >
            <ArrowLeft size={13} />
            Back to district
          </button>
        </div>
      </main>
    )
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--paper)]">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
          Loading proposal...
        </div>
      </main>
    )
  }

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
              District Authority · Proposal Review
            </div>
          </div>

          <button
            onClick={() => navigate("/portal/district")}
            className="flex items-center gap-2 border border-[var(--line)] px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition hover:bg-[var(--paper-deep)]"
          >
            <ArrowLeft size={13} />
            Back
          </button>
        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* INTRO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
            <ShieldCheck size={14} />
            District Scrutiny
          </div>

          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Review proposal
            <br />
            <span className="text-[var(--ink-soft)]">
              before field verification.
            </span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            Examine the project proposal, land requirement, supporting
            documents, and submitted information before deciding whether
            the proposal should proceed to field verification.
          </p>
        </motion.div>

        {/* PROJECT HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-10 border border-[var(--line)] bg-[var(--white)]"
        >
          <div className="p-6 sm:p-8">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
              {project.id}
            </div>

            <h2 className="mt-2 font-serif text-3xl sm:text-4xl">
              {project.projectName}
            </h2>

            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--ink-soft)]">
              <MapPin size={14} />
              {project.district}, {project.state}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <StatusBadge>
                {project.stage || "District Scrutiny"}
              </StatusBadge>

              <StatusBadge>
                {project.status || "Pending"}
              </StatusBadge>
            </div>
          </div>
        </motion.div>

        {/* CORE INFORMATION */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <ReviewCard
            icon={<FileText size={17} />}
            label="Project information"
          >
            <InfoRow
              label="Project type"
              value={project.projectType}
            />

            <InfoRow
              label="Purpose"
              value={project.purpose}
            />

            <InfoRow
              label="Description"
              value={project.description}
            />
          </ReviewCard>

          <ReviewCard
            icon={<LandPlot size={17} />}
            label="Land requirement"
          >
            <InfoRow
              label="Required area"
              value={
                project.landArea
                  ? `${project.landArea} acres`
                  : "—"
              }
            />

            <InfoRow
              label="Number of parcels"
              value={project.parcels || "—"}
            />

            <InfoRow
              label="District"
              value={project.district || "—"}
            />
          </ReviewCard>

          <ReviewCard
            icon={<ShieldCheck size={17} />}
            label="Submission record"
          >
            <InfoRow
              label="Submitted by"
              value={
                project.submittedBy ||
                "Project Authority"
              }
            />

            <InfoRow
              label="Authority"
              value={
                project.authority ||
                "District Authority"
              }
            />

            <InfoRow
              label="Next action"
              value={
                project.nextAction ||
                "District Authority Review"
              }
            />
          </ReviewCard>
        </div>

        {/* DOCUMENTS */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mt-6 border border-[var(--line)] bg-[var(--white)]"
        >
          <div className="border-b border-[var(--line)] p-5 sm:p-6">
            <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
              Supporting evidence
            </div>

            <h2 className="mt-1 font-serif text-2xl">
              Submitted documents
            </h2>
          </div>

          <div className="p-5 sm:p-6">
            {project.documents?.length ? (
              <div className="space-y-3">
                {project.documents.map((document, index) => (
                  <div
                    key={`${document.name}-${index}`}
                    className="flex flex-col gap-3 border border-[var(--line)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center border border-[var(--line)]">
                        <FileText
                          size={15}
                          className="text-[var(--earth)]"
                        />
                      </div>

                      <div>
                        <div className="text-sm">
                          {document.name}
                        </div>

                        <div className="mt-1 font-mono text-[8px] uppercase tracking-wider text-[var(--ink-soft)]">
                          {document.type || "Document"}
                        </div>
                      </div>
                    </div>

                    <div className="font-mono text-[9px] text-[var(--ink-soft)]">
                      {document.size || "—"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-[var(--line-dark)] px-5 py-10 text-center">
                <FileText
                  size={23}
                  className="mx-auto mb-3 text-[var(--ink-soft)]"
                />

                <p className="font-serif text-lg">
                  No supporting documents
                </p>

                <p className="mt-1 text-sm text-[var(--ink-soft)]">
                  No documents were attached to this proposal.
                </p>
              </div>
            )}
          </div>
        </motion.section>

        {/* REVIEW DECISION */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-6 border border-[var(--line-dark)] bg-[var(--paper-deep)]"
        >
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={20}
                className="mt-0.5 text-[var(--earth)]"
              />

              <div>
                <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                  Administrative decision
                </div>

                <h2 className="mt-1 font-serif text-2xl">
                  District review required
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                  Review the submitted information and determine the
                  appropriate next step for this proposal.
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              {/* ACCEPT */}
              <button
                onClick={handleAccept}
                className="border border-[var(--line-dark)] bg-[var(--white)] px-4 py-4 text-left transition hover:border-[var(--earth)]"
              >
                <CheckCircle2
                  size={17}
                  className="mb-3 text-[var(--earth)]"
                />

                <div className="font-mono text-[9px] uppercase tracking-wider">
                  Proceed
                </div>

                <div className="mt-1 font-serif text-lg">
                  Accept proposal
                </div>

                <div className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                  Move the proposal toward field verification.
                </div>
              </button>

              {/* REQUEST CHANGES */}
              <button
                onClick={handleRequestChanges}
                className="border border-[var(--line-dark)] bg-[var(--white)] px-4 py-4 text-left transition hover:border-[var(--earth)]"
              >
                <RotateCcw
                  size={17}
                  className="mb-3 text-[var(--earth)]"
                />

                <div className="font-mono text-[9px] uppercase tracking-wider">
                  Clarification
                </div>

                <div className="mt-1 font-serif text-lg">
                  Request changes
                </div>

                <div className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                  Return the proposal to the company for additional
                  information or corrections.
                </div>
              </button>

              {/* REJECT */}
              <button
                onClick={handleReject}
                className="border border-[var(--line-dark)] bg-[var(--white)] px-4 py-4 text-left transition hover:border-[var(--earth)]"
              >
                <XCircle
                  size={17}
                  className="mb-3 text-[var(--earth)]"
                />

                <div className="font-mono text-[9px] uppercase tracking-wider">
                  Decline
                </div>

                <div className="mt-1 font-serif text-lg">
                  Reject proposal
                </div>

                <div className="mt-1 text-xs leading-5 text-[var(--ink-soft)]">
                  Close the proposal at district scrutiny.
                </div>
              </button>

            </div>
          </div>
        </motion.section>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--line)] px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)] sm:flex-row sm:justify-between">
          <span>
            DHARA · District Authority Portal
          </span>

          <span>
            Proposal review · Prototype
          </span>
        </div>
      </footer>
    </main>
  )
}

function ReviewCard({ icon, label, children }) {
  return (
    <div className="border border-[var(--line)] bg-[var(--white)]">
      <div className="flex items-center gap-2 border-b border-[var(--line)] p-5">
        {icon}

        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
          {label}
        </div>
      </div>

      <div className="space-y-5 p-5">
        {children}
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <div className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
        {label}
      </div>

      <div className="mt-1 text-sm leading-6">
        {value || "—"}
      </div>
    </div>
  )
}

function StatusBadge({ children }) {
  return (
    <div className="border border-[var(--line)] px-3 py-2 font-mono text-[9px] uppercase tracking-wider">
      {children}
    </div>
  )
}

export default ProposalReview