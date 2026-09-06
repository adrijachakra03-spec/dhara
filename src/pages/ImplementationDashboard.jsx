import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  PlayCircle,
  CircleDollarSign,
  UserCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { addLedgerEvent } from "../blockchain/dharaLedger"

const STORAGE_KEY = "dhara-projects"

function readProjects() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    )

    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function getProjectName(project) {
  return project?.projectName || project?.name || "Unnamed Project"
}

function formatDate(value) {
  if (!value) return "—"

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "—"
  }
}

function hasCompensationApproval(project) {
  return (
    project?.compensationApprovalStatus === "Approved" ||
    project?.compensationApproved === true
  )
}

function hasCompensationPayment(project) {
  return (
    project?.compensationPaymentStatus === "Paid" ||
    project?.compensationPaid === true
  )
}

function hasCitizenAcknowledgement(project) {
  return (
    project?.citizenAcknowledgementStatus ===
      "Acknowledged" ||
    project?.citizenAcknowledged === true
  )
}

function isImplementationEligible(project) {
  return (
    project?.implementationStatus === "Eligible" ||
    project?.implementationEligible === true
  )
}

function passesImplementationGate(project) {
  return (
    hasCompensationApproval(project) &&
    hasCompensationPayment(project) &&
    hasCitizenAcknowledgement(project) &&
    isImplementationEligible(project)
  )
}

function ImplementationDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [remarks, setRemarks] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const storedProjects = readProjects()

    /*
      ==========================================================
      IMPLEMENTATION GATE
      ==========================================================

      A project becomes implementation-eligible only when:

      1. Compensation has been approved
      2. Compensation has been paid
      3. Citizen has acknowledged compensation
      4. Implementation has been marked Eligible
    */

    const eligibleProjects = storedProjects.filter(
      (project) =>
        project.stage === "Possession / Implementation" &&
        passesImplementationGate(project)
    )

    setProjects(eligibleProjects)
  }, [])

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  )

  const handleStartImplementation = async () => {
    if (!selectedProject || processing) {
      return
    }

    /*
      ==========================================================
      HARD IMPLEMENTATION GATE
      ==========================================================

      Government implementation cannot start unless:

      COMPENSATION APPROVED
              +
      COMPENSATION PAID
              +
      CITIZEN ACKNOWLEDGED
              +
      IMPLEMENTATION ELIGIBLE
    */

    if (!passesImplementationGate(selectedProject)) {
      return
    }

    setProcessing(true)

    try {
      const storedProjects = readProjects()

      /*
        Re-check against the latest localStorage state.

        This prevents implementation from starting from stale
        state if another portal changed the project after this
        page was opened.
      */

      const latestProject = storedProjects.find(
        (project) => project.id === selectedProject.id
      )

      if (!latestProject || !passesImplementationGate(latestProject)) {
        setProcessing(false)
        return
      }

      const startedAt = new Date().toISOString()

      const updatedProjects = storedProjects.map((project) => {
        if (project.id !== selectedProject.id) {
          return project
        }

        return {
          ...project,

          /*
            Government implementation has now started.
          */
          stage: "Possession / Implementation",

          status: "Implementation Started",

          authority:
            "Government Implementation Authority",

          nextAction: "Project Completion",

          implementationStatus: "In Progress",

          implementationEligible: false,

          implementationStarted: true,

          implementationStartedAt: startedAt,

          implementationRemarks: remarks.trim(),

          /*
            Preserve completed upstream gates.
          */
          compensationApprovalStatus:
            project.compensationApprovalStatus ||
            "Approved",

          compensationPaymentStatus:
            project.compensationPaymentStatus ||
            "Paid",

          citizenAcknowledgementStatus:
            project.citizenAcknowledgementStatus ||
            "Acknowledged",

          /*
            Company-facing notification.
          */
          companyNotification: {
            type: "IMPLEMENTATION_STARTED",
            message:
              "Government implementation has officially started.",
            createdAt: startedAt,
          },

          companyNotificationStatus: "Unread",
        }
      })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProjects)
      )

      /*
        ========================================================
        BLOCK #10
        ========================================================
      */

      await addLedgerEvent({
        projectId: selectedProject.id,

        event: "IMPLEMENTATION STARTED",

        authority:
          "Government Implementation Authority",

        details: {
          projectName:
            getProjectName(selectedProject),

          state:
            selectedProject.state || "—",

          district:
            selectedProject.district || "—",

          compensationApprovalStatus:
            latestProject.compensationApprovalStatus ||
            "Approved",

          compensationPaymentStatus:
            latestProject.compensationPaymentStatus ||
            "Paid",

          citizenAcknowledgementStatus:
            latestProject.citizenAcknowledgementStatus ||
            "Acknowledged",

          implementationStatus:
            "In Progress",

          remarks:
            remarks.trim(),

          startedAt,
        },
      })

      /*
        Update visible queue so the project immediately
        disappears from the eligible implementation queue.
      */
      setProjects((currentProjects) =>
        currentProjects.filter(
          (project) =>
            project.id !== selectedProject.id
        )
      )

      setSelectedProjectId("")

      setSubmitted(true)
    } catch (error) {
      console.error(
        "Implementation start failed:",
        error
      )
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[var(--line)]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] transition hover:text-[var(--earth)]"
          >
            <ArrowLeft size={14} />
            DHARA
          </button>

          <div className="text-right">

            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
              Government Portal
            </p>

            <p className="mt-1 font-mono text-[8px] text-[var(--ink-soft)]">
              Implementation Authority
            </p>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {/* ===================================================
            INTRO
        =================================================== */}

        <section className="mb-10 grid gap-8 lg:grid-cols-[1fr_320px]">

          <div>

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center border border-[var(--earth)] text-[var(--earth)]">
                <PlayCircle size={18} />
              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
                Government Implementation / Stage 10
              </span>

            </div>

            <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              Implementation
              <br />
              <span className="text-[var(--ink-soft)]">
                authorization.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl font-mono text-xs leading-6 text-[var(--ink-soft)]">
              Government implementation begins only after
              compensation has been approved, payment has been
              recorded, and the citizen has acknowledged receipt.
              Every implementation start is recorded in the
              verified administrative history.
            </p>

          </div>

          {/* =================================================
              IMPLEMENTATION GATE
          ================================================= */}

          <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-6">

            <div className="mb-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
              <LockKeyhole size={13} />
              Implementation Gate
            </div>

            <div className="space-y-4">

              <div>

                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Required conditions
                </div>

                <div className="mt-1 font-serif text-xl">
                  Approval + Payment + Acknowledgement
                </div>

              </div>

              <div className="h-px bg-[var(--line)]" />

              <div>

                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Execution state
                </div>

                <div className="mt-1 font-mono text-xs text-[var(--earth)]">
                  ELIGIBLE
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            SUCCESS STATE
        ===================================================== */}

        {submitted && (

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 border border-[var(--line)] bg-[var(--white)]"
          >

            <div className="flex flex-col items-center p-10 text-center">

              <CheckCircle2
                size={40}
                className="mb-5 text-[var(--earth)]"
              />

              <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                Block #10 Recorded
              </div>

              <h2 className="mt-3 font-serif text-3xl">
                Implementation started.
              </h2>

              <p className="mx-auto mt-4 max-w-lg font-mono text-xs leading-6 text-[var(--ink-soft)]">
                Government implementation has been formally
                initiated. The implementation start has been
                recorded in the verified administrative history.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">

                <button
                  onClick={() => setSubmitted(false)}
                  className="inline-flex items-center justify-center gap-2 border border-[var(--line-dark)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition hover:bg-[var(--paper-deep)]"
                >
                  <ArrowLeft size={14} />
                  Implementation Queue
                </button>

                <button
                  onClick={() =>
                    navigate("/portal/blockchain")
                  }
                  className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--white)] transition hover:bg-[var(--earth)]"
                >
                  <ShieldCheck size={14} />
                  View Verified History
                </button>

              </div>

            </div>

          </motion.section>

        )}

        {/* =====================================================
            EMPTY STATE
        ===================================================== */}

        {!submitted && projects.length === 0 ? (

          <section className="border border-[var(--line)] bg-[var(--white)] p-10 text-center">

            <LockKeyhole
              size={30}
              className="mx-auto mb-4 text-[var(--earth)]"
            />

            <h2 className="font-serif text-2xl">
              No projects are implementation-eligible.
            </h2>

            <p className="mx-auto mt-3 max-w-lg font-mono text-xs leading-6 text-[var(--ink-soft)]">
              A project will appear here only after compensation
              has been approved and paid, and the citizen has
              formally acknowledged the compensation record.
            </p>

            <button
              onClick={() => navigate("/")}
              className="mt-7 inline-flex items-center gap-2 border border-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition hover:bg-[var(--ink)] hover:text-[var(--white)]"
            >
              <ArrowLeft size={14} />
              Return to DHARA
            </button>

          </section>

        ) : !submitted ? (

          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">

            {/* =================================================
                QUEUE
            ================================================= */}

            <section>

              <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Eligible Projects / {projects.length}
              </div>

              <div className="space-y-2">

                {projects.map((project) => {

                  const active =
                    project.id === selectedProjectId

                  return (

                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProjectId(project.id)
                        setSubmitted(false)
                        setRemarks("")
                      }}
                      className={`w-full border p-5 text-left transition ${
                        active
                          ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                          : "border-[var(--line)] bg-[var(--white)] hover:border-[var(--line-dark)]"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <div className="font-serif text-xl">
                            {getProjectName(project)}
                          </div>

                          <div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                            <MapPin size={11} />

                            {project.district || "District"} ·{" "}
                            {project.state || "State"}
                          </div>

                        </div>

                        <span className="font-mono text-[9px] text-[var(--earth)]">
                          {project.id}
                        </span>

                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4 font-mono text-[9px] uppercase tracking-[0.1em]">

                        <span className="text-[var(--ink-soft)]">
                          Gate
                        </span>

                        <span className="text-[var(--earth)]">
                          Passed
                        </span>

                      </div>

                    </button>

                  )
                })}

              </div>

            </section>

            {/* =================================================
                REVIEW
            ================================================= */}

            <section className="border border-[var(--line)] bg-[var(--white)]">

              {!selectedProject ? (

                <div className="flex min-h-[500px] items-center justify-center p-10 text-center">

                  <div>

                    <FileText
                      size={30}
                      className="mx-auto mb-4 text-[var(--earth)]"
                    />

                    <h2 className="font-serif text-2xl">
                      Select an eligible project
                    </h2>

                    <p className="mt-3 max-w-md font-mono text-xs leading-6 text-[var(--ink-soft)]">
                      Select a project to verify that all
                      compensation and citizen acknowledgement
                      conditions have been satisfied before
                      beginning government implementation.
                    </p>

                  </div>

                </div>

              ) : (

                <>

                  {/* =================================================
                      HEADER
                  ================================================= */}

                  <div className="border-b border-[var(--line)] p-6 sm:p-8">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row">

                      <div>

                        <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                          Government Implementation Authorization
                        </div>

                        <h2 className="mt-2 font-serif text-3xl">
                          {getProjectName(selectedProject)}
                        </h2>

                        <div className="mt-3 font-mono text-[10px] text-[var(--ink-soft)]">
                          Reference / {selectedProject.id}
                        </div>

                      </div>

                      <div className="flex h-fit items-center gap-2 border border-[var(--earth)] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--earth)]">

                        <CheckCircle2 size={12} />

                        All Gates Passed

                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      STATUS GRID
                  ================================================= */}

                  <div className="grid border-b border-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">

                    <div className="border-b border-[var(--line)] p-6 sm:border-r lg:border-b-0">

                      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        State
                      </div>

                      <div className="mt-2 font-serif text-lg">
                        {selectedProject.state || "—"}
                      </div>

                    </div>

                    <div className="border-b border-[var(--line)] p-6 lg:border-r lg:border-b-0">

                      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        District
                      </div>

                      <div className="mt-2 font-serif text-lg">
                        {selectedProject.district || "—"}
                      </div>

                    </div>

                    <div className="border-b border-[var(--line)] p-6 sm:border-r sm:border-b-0">

                      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        Payment
                      </div>

                      <div className="mt-2 font-mono text-sm text-[var(--earth)]">
                        Paid
                      </div>

                    </div>

                    <div className="p-6">

                      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        Citizen
                      </div>

                      <div className="mt-2 font-mono text-sm text-[var(--earth)]">
                        Acknowledged
                      </div>

                    </div>

                  </div>

                  {/* =================================================
                      GATE CONFIRMATION
                  ================================================= */}

                  <div className="p-6 sm:p-8">

                    <div className="border border-[var(--line)] bg-[var(--paper)] p-6">

                      <div className="flex gap-4">

                        <ShieldCheck
                          size={20}
                          className="mt-0.5 shrink-0 text-[var(--earth)]"
                        />

                        <div>

                          <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--earth)]">
                            Government Execution Gate Passed
                          </div>

                          <p className="mt-3 font-mono text-xs leading-6 text-[var(--ink-soft)]">
                            Compensation has been approved and paid,
                            and the citizen has acknowledged the
                            compensation record. This project is now
                            eligible for government implementation.
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        GATE DETAILS
                    ================================================= */}

                    <div className="mt-6 grid gap-4 sm:grid-cols-3">

                      {/* COMPENSATION */}

                      <div className="border border-[var(--line)] p-5">

                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">

                          <CircleDollarSign size={12} />

                          Compensation

                        </div>

                        <div className="mt-2 font-mono text-xs text-[var(--earth)]">
                          Approved
                        </div>

                        <div className="mt-2 font-mono text-[8px] text-[var(--ink-soft)]">
                          {formatDate(
                            selectedProject.compensationApprovedAt
                          )}
                        </div>

                      </div>

                      {/* PAYMENT */}

                      <div className="border border-[var(--line)] p-5">

                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">

                          <CircleDollarSign size={12} />

                          Payment

                        </div>

                        <div className="mt-2 font-mono text-xs text-[var(--earth)]">
                          Paid
                        </div>

                        <div className="mt-2 font-mono text-[8px] text-[var(--ink-soft)]">
                          {formatDate(
                            selectedProject.compensationPaidAt
                          )}
                        </div>

                      </div>

                      {/* CITIZEN */}

                      <div className="border border-[var(--line)] p-5">

                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">

                          <UserCheck size={12} />

                          Citizen

                        </div>

                        <div className="mt-2 font-mono text-xs text-[var(--earth)]">
                          Acknowledged
                        </div>

                        <div className="mt-2 font-mono text-[8px] text-[var(--ink-soft)]">
                          {formatDate(
                            selectedProject.citizenAcknowledgedAt
                          )}
                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        REMARKS
                    ================================================= */}

                    <div className="mt-8">

                      <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Implementation Remarks
                      </label>

                      <textarea
                        value={remarks}
                        onChange={(event) =>
                          setRemarks(event.target.value)
                        }
                        rows={5}
                        placeholder="Record implementation commencement, site handover or other administrative remarks..."
                        className="mt-3 w-full resize-none border border-[var(--line)] bg-[var(--paper)] px-4 py-4 font-mono text-xs leading-6 outline-none transition placeholder:text-[var(--ink-soft)]/60 focus:border-[var(--earth)]"
                      />

                    </div>

                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <div className="mt-8">

                      <button
                        onClick={handleStartImplementation}
                        disabled={processing}
                        className="inline-flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-6 py-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--white)] transition hover:bg-[var(--earth)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >

                        <PlayCircle size={15} />

                        {processing
                          ? "Recording..."
                          : "Start Government Implementation"}

                      </button>

                    </div>

                    {/* =================================================
                        LEDGER NOTE
                    ================================================= */}

                    <div className="mt-5 flex items-start gap-2 font-mono text-[9px] leading-5 text-[var(--ink-soft)]">

                      <ShieldCheck
                        size={13}
                        className="mt-0.5 shrink-0"
                      />

                      Starting implementation creates the{" "}
                      <span className="text-[var(--ink)]">
                        IMPLEMENTATION STARTED
                      </span>{" "}
                      ledger event.

                    </div>

                  </div>

                </>

              )}

            </section>

          </div>

        ) : null}

      </main>

    </div>
  )
}

export default ImplementationDashboard