import { motion } from "framer-motion"
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  MapPin,
  ShieldCheck,
  Trophy,
  CircleDollarSign,
  UserCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { addLedgerEvent } from "../blockchain/dharaLedger"

const STORAGE_KEY = "dhara-projects"

/* ============================================================
   STORAGE
   ============================================================ */

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
  return (
    project?.projectName ||
    project?.name ||
    "Unnamed Project"
  )
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

/* ============================================================
   COMPLETION GATES
   ============================================================ */

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

function hasImplementationStarted(project) {
  return (
    project?.implementationStatus === "In Progress" ||
    project?.implementationStarted === true
  )
}

function passesCompletionGate(project) {
  return (
    hasCompensationApproval(project) &&
    hasCompensationPayment(project) &&
    hasCitizenAcknowledgement(project) &&
    hasImplementationStarted(project)
  )
}

/* ============================================================
   DASHBOARD
   ============================================================ */

function ProjectCompletionDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] =
    useState("")
  const [remarks, setRemarks] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [processing, setProcessing] = useState(false)

  /* ============================================================
     LOAD PROJECTS
     ============================================================ */

  const loadProjects = () => {
    const storedProjects = readProjects()

    /*
      FINAL COMPLETION GATE

      A project appears here only when:

      1. Compensation Approved
      2. Compensation Paid
      3. Citizen Acknowledged
      4. Government Implementation Started

      We do NOT depend on one particular stage label.
    */

    const activeProjects = storedProjects.filter(
      (project) =>
        hasImplementationStarted(project) &&
        passesCompletionGate(project)
    )

    setProjects(activeProjects)
  }

  /* ============================================================
     INITIAL LOAD + LIVE REFRESH
     ============================================================ */

  useEffect(() => {
    loadProjects()

    /*
      Refresh when returning to this tab.
    */

    const handleFocus = () => {
      loadProjects()
    }

    /*
      Refresh when another tab updates localStorage.
    */

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        loadProjects()
      }
    }

    /*
      Small polling interval makes the prototype feel
      connected even when implementation and completion
      are opened in different tabs.
    */

    const refreshInterval = setInterval(() => {
      loadProjects()
    }, 2000)

    window.addEventListener("focus", handleFocus)
    window.addEventListener(
      "storage",
      handleStorage
    )

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      )

      window.removeEventListener(
        "storage",
        handleStorage
      )

      clearInterval(refreshInterval)
    }
  }, [])

  const selectedProject = projects.find(
    (project) =>
      project.id === selectedProjectId
  )

  /* ============================================================
     COMPLETE PROJECT
     ============================================================ */

  const handleCompleteProject = async () => {
    if (!selectedProject || processing) {
      return
    }

    /*
      HARD COMPLETION GATE
    */

    if (!passesCompletionGate(selectedProject)) {
      return
    }

    setProcessing(true)

    try {
      const storedProjects = readProjects()

      /*
        Re-read latest project from localStorage.
      */

      const latestProject = storedProjects.find(
        (project) =>
          project.id === selectedProject.id
      )

      if (
        !latestProject ||
        !passesCompletionGate(latestProject)
      ) {
        setProcessing(false)
        loadProjects()
        return
      }

      const completedAt =
        new Date().toISOString()

      /* ========================================================
         UPDATE PROJECT
         ======================================================== */

      const updatedProjects =
        storedProjects.map((project) => {
          if (
            project.id !== selectedProject.id
          ) {
            return project
          }

          return {
            ...project,

            /*
              FINAL PROJECT STATE
            */

            stage: "Completed",

            status: "Project Completed",

            authority:
              "Government Implementation Authority",

            nextAction: "Completed",

            /*
              Implementation is now closed.
            */

            implementationStatus:
              "Completed",

            implementationEligible: false,

            implementationStarted: true,

            projectCompleted: true,

            projectCompletedAt: completedAt,

            completionRemarks:
              remarks.trim(),

            /*
              Preserve upstream gates.
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
              Final company notification.
            */

            companyNotification: {
              type: "PROJECT_COMPLETED",

              message:
                "Government implementation has been completed and the project lifecycle is now formally closed.",

              createdAt: completedAt,
            },

            companyNotificationStatus:
              "Unread",
          }
        })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProjects)
      )

      /* ========================================================
         BLOCK #11
         ======================================================== */

      await addLedgerEvent({
        projectId: selectedProject.id,

        event: "PROJECT COMPLETED",

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
            "Completed",

          decision: "Completed",

          remarks:
            remarks.trim(),

          completedAt,

          nextStage: "Completed",
        },
      })

      /*
        Remove completed project from active queue.
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
        "Project completion failed:",
        error
      )
    } finally {
      setProcessing(false)
    }
  }

  /* ============================================================
     UI
     ============================================================ */

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[var(--line)]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <button
            onClick={() =>
              navigate("/portal/implementation")
            }
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] transition hover:text-[var(--earth)]"
          >
            <ArrowLeft size={14} />
            Implementation
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

      {/* ======================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-14">

        {/* ====================================================
            INTRO
        ==================================================== */}

        <section className="mb-10 grid gap-8 lg:grid-cols-[1fr_320px]">

          <div>

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center border border-[var(--earth)] text-[var(--earth)]">

                <Trophy size={18} />

              </div>

              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
                Project Completion / Stage 11
              </span>

            </div>

            <h1 className="max-w-3xl font-serif text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">

              Project

              <br />

              <span className="text-[var(--ink-soft)]">
                completion.
              </span>

            </h1>

            <p className="mt-6 max-w-2xl font-mono text-xs leading-6 text-[var(--ink-soft)]">

              Final government confirmation that the
              implementation lifecycle has been completed.
              Completion closes the operational workflow and
              records the final event in the verified
              administrative history.

            </p>

          </div>

          {/* ==================================================
              FINAL GATE
          ================================================== */}

          <div className="border border-[var(--line)] bg-[var(--paper-deep)] p-6">

            <div className="mb-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">

              <ShieldCheck size={13} />

              Final Gate

            </div>

            <div className="space-y-4">

              <div>

                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Required conditions
                </div>

                <div className="mt-1 font-serif text-xl">
                  Implementation In Progress
                </div>

              </div>

              <div className="h-px bg-[var(--line)]" />

              <div>

                <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Final state
                </div>

                <div className="mt-1 font-mono text-xs text-[var(--earth)]">
                  READY FOR COMPLETION
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ====================================================
            SUCCESS
        ==================================================== */}

        {submitted && (

          <motion.section
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="border border-[var(--line)] bg-[var(--white)]"
          >

            <div className="flex min-h-[500px] items-center justify-center p-10 text-center">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
              >

                <Trophy
                  size={44}
                  className="mx-auto mb-5 text-[var(--earth)]"
                />

                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                  Block #11 Recorded
                </div>

                <h2 className="mt-3 font-serif text-3xl">
                  Project completed.
                </h2>

                <p className="mx-auto mt-4 max-w-lg font-mono text-xs leading-6 text-[var(--ink-soft)]">

                  The project lifecycle has been formally
                  closed. The final completion event has been
                  added to the verified administrative history.

                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">

                  <button
                    onClick={() =>
                      navigate(
                        "/portal/implementation"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 border border-[var(--line-dark)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition hover:bg-[var(--paper-deep)]"
                  >

                    <ArrowLeft size={14} />

                    Implementation Portal

                  </button>

                  <button
                    onClick={() =>
                      navigate(
                        "/portal/blockchain"
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--white)] transition hover:bg-[var(--earth)]"
                  >

                    <ShieldCheck size={14} />

                    View Verified History

                  </button>

                </div>

              </motion.div>

            </div>

          </motion.section>

        )}

        {/* ====================================================
            EMPTY STATE
        ==================================================== */}

        {!submitted &&
        projects.length === 0 ? (

          <section className="border border-[var(--line)] bg-[var(--white)] p-10 text-center">

            <CheckCircle2
              size={30}
              className="mx-auto mb-4 text-[var(--earth)]"
            />

            <h2 className="font-serif text-2xl">
              No projects awaiting completion.
            </h2>

            <p className="mx-auto mt-3 max-w-lg font-mono text-xs leading-6 text-[var(--ink-soft)]">

              Projects with active government implementation
              will appear here once they are ready for final
              completion confirmation.

            </p>

            <button
              onClick={() =>
                navigate(
                  "/portal/implementation"
                )
              }
              className="mt-7 inline-flex items-center gap-2 border border-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.15em] transition hover:bg-[var(--ink)] hover:text-[var(--white)]"
            >

              <ArrowLeft size={14} />

              Return to Implementation

            </button>

          </section>

        ) : !submitted ? (

          <div className="grid gap-8 lg:grid-cols-[340px_1fr]">

            {/* ==================================================
                ACTIVE PROJECT QUEUE
            ================================================== */}

            <section>

              <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Active Projects / {projects.length}
              </div>

              <div className="space-y-2">

                {projects.map((project) => {

                  const active =
                    project.id ===
                    selectedProjectId

                  return (

                    <button
                      key={project.id}
                      onClick={() => {

                        setSelectedProjectId(
                          project.id
                        )

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
                            {getProjectName(
                              project
                            )}
                          </div>

                          <div className="mt-2 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">

                            <MapPin size={11} />

                            {project.district ||
                              "District"}

                            {" · "}

                            {project.state ||
                              "State"}

                          </div>

                        </div>

                        <span className="font-mono text-[9px] text-[var(--earth)]">
                          {project.id}
                        </span>

                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-[var(--line)] pt-4 font-mono text-[9px] uppercase tracking-[0.1em]">

                        <span className="text-[var(--ink-soft)]">
                          Implementation
                        </span>

                        <span className="text-[var(--earth)]">
                          In Progress
                        </span>

                      </div>

                    </button>

                  )
                })}

              </div>

            </section>

            {/* ==================================================
                REVIEW
            ================================================== */}

            <section className="border border-[var(--line)] bg-[var(--white)]">

              {!selectedProject ? (

                <div className="flex min-h-[500px] items-center justify-center p-10 text-center">

                  <div>

                    <FileText
                      size={30}
                      className="mx-auto mb-4 text-[var(--earth)]"
                    />

                    <h2 className="font-serif text-2xl">
                      Select a project
                    </h2>

                    <p className="mt-3 max-w-md font-mono text-xs leading-6 text-[var(--ink-soft)]">

                      Select an active implementation
                      project to complete the final
                      government workflow step.

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
                          Final Completion Review
                        </div>

                        <h2 className="mt-2 font-serif text-3xl">
                          {getProjectName(
                            selectedProject
                          )}
                        </h2>

                        <div className="mt-3 font-mono text-[10px] text-[var(--ink-soft)]">
                          Reference /{" "}
                          {selectedProject.id}
                        </div>

                      </div>

                      <div className="flex h-fit items-center gap-2 border border-[var(--earth)] px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--earth)]">

                        <CheckCircle2 size={12} />

                        Implementation Active

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
                        {selectedProject.state ||
                          "—"}
                      </div>

                    </div>

                    <div className="border-b border-[var(--line)] p-6 lg:border-r lg:border-b-0">

                      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        District
                      </div>

                      <div className="mt-2 font-serif text-lg">
                        {selectedProject.district ||
                          "—"}
                      </div>

                    </div>

                    <div className="border-b border-[var(--line)] p-6 sm:border-r sm:border-b-0">

                      <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        Compensation
                      </div>

                      <div className="mt-2 font-mono text-sm text-[var(--earth)]">
                        Approved & Paid
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
                      FINAL GATE
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
                            Final Completion Gate Passed
                          </div>

                          <p className="mt-3 font-mono text-xs leading-6 text-[var(--ink-soft)]">

                            Compensation has been approved
                            and paid, the citizen has
                            acknowledged the compensation
                            record, and government
                            implementation is currently in
                            progress. The project is ready
                            for final completion confirmation.

                          </p>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        GATE DETAILS
                    ================================================= */}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

                      {/* IMPLEMENTATION */}

                      <div className="border border-[var(--line)] p-5">

                        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">

                          <CheckCircle2 size={12} />

                          Implementation

                        </div>

                        <div className="mt-2 font-mono text-xs text-[var(--earth)]">
                          In Progress
                        </div>

                        <div className="mt-2 font-mono text-[8px] text-[var(--ink-soft)]">

                          {formatDate(
                            selectedProject.implementationStartedAt
                          )}

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        REMARKS
                    ================================================= */}

                    <div className="mt-8">

                      <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">

                        Completion Remarks

                      </label>

                      <textarea
                        value={remarks}
                        onChange={(event) =>
                          setRemarks(
                            event.target.value
                          )
                        }
                        rows={5}
                        placeholder="Record final implementation completion, site handover, operational closure or other administrative remarks..."
                        className="mt-3 w-full resize-none border border-[var(--line)] bg-[var(--paper)] px-4 py-4 font-mono text-xs leading-6 outline-none transition placeholder:text-[var(--ink-soft)]/60 focus:border-[var(--earth)]"
                      />

                    </div>

                    {/* =================================================
                        ACTION
                    ================================================= */}

                    <div className="mt-8">

                      <button
                        onClick={
                          handleCompleteProject
                        }
                        disabled={processing}
                        className="inline-flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-6 py-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--white)] transition hover:bg-[var(--earth)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >

                        <Trophy size={15} />

                        {processing
                          ? "Recording..."
                          : "Mark Project Completed"}

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

                      Completion creates the final{" "}

                      <span className="text-[var(--ink)]">
                        PROJECT COMPLETED
                      </span>{" "}

                      ledger event and permanently closes the
                      workflow.

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

export default ProjectCompletionDashboard