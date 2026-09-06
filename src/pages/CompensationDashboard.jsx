import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  FileText,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { addLedgerEvent } from "../blockchain/dharaLedger"

const STORAGE_KEY = "dhara-projects"

const fallbackProjects = [
  {
    id: "WB-2048",
    projectName: "Eastern Freight Corridor",
    name: "Eastern Freight Corridor",
    state: "West Bengal",
    district: "Kolkata",
    landArea: "248 acres",
    parcels: 248,
    stage: "Compensation",
    status: "Compensation Review Pending",
    authority: "SLCO",
    nextAction: "SLCO Review",
    centralDecision: "Approved",
    compensationStatus: "Pending",
    compensationApprovalStatus: "Pending",
    compensationPaymentStatus: "Pending",
    citizenAcknowledgementStatus: "Pending",
    compensationAmount: "₹18.4 Cr",
    affectedParcels: 248,
    implementationStatus: "Locked",
  },
  {
    id: "MH-7731",
    projectName: "Industrial Corridor",
    name: "Industrial Corridor",
    state: "Maharashtra",
    district: "Mumbai",
    landArea: "391 acres",
    parcels: 391,
    stage: "Compensation",
    status: "Compensation Review Pending",
    authority: "SLCO",
    nextAction: "SLCO Review",
    centralDecision: "Approved",
    compensationStatus: "Pending",
    compensationApprovalStatus: "Pending",
    compensationPaymentStatus: "Pending",
    citizenAcknowledgementStatus: "Pending",
    compensationAmount: "₹27.8 Cr",
    affectedParcels: 391,
    implementationStatus: "Locked",
  },
]

function readProjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function getProjectName(project) {
  return project?.projectName || project?.name || "Unnamed Project"
}

function getCompensationAmount(project) {
  return (
    project?.compensationAmount ||
    project?.compensationEstimate ||
    project?.estimatedCompensation ||
    "₹42.6 Cr"
  )
}

function getAffectedParcels(project) {
  return (
    project?.affectedParcels ||
    project?.parcels ||
    project?.parcelsCompensated ||
    "—"
  )
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

function isEligibleAuthority(project) {
  return [
    "SLCO",
    "Special Land Acquisition Officer",
    "Special Land Acquisition Officer (SLCO)",
    "Government Administration",
  ].includes(project?.authority)
}

function isCompensationStage(project) {
  return project?.stage === "Compensation"
}

function isAwaitingApproval(project) {
  return (
    isCompensationStage(project) &&
    isEligibleAuthority(project) &&
    !hasCompensationApproval(project)
  )
}

function isAwaitingPayment(project) {
  return (
    isCompensationStage(project) &&
    isEligibleAuthority(project) &&
    hasCompensationApproval(project) &&
    !hasCompensationPayment(project)
  )
}

function isCompensationProject(project) {
  return (
    isAwaitingApproval(project) ||
    isAwaitingPayment(project)
  )
}

export default function CompensationDashboard() {
  const navigate = useNavigate()

  const [dharaId, setDharaId] = useState("")
  const [selectedProject, setSelectedProject] = useState(null)
  const [projects, setProjects] = useState([])
  const [searchError, setSearchError] = useState("")
  const [remarks, setRemarks] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [decisionType, setDecisionType] = useState(null)
  const [processing, setProcessing] = useState(false)

  /* ============================================================
     SEARCH PROJECT
  ============================================================ */

  const handleSearch = () => {
    const searchId = dharaId.trim()

    setSearchError("")
    setSelectedProject(null)
    setSubmitted(false)
    setDecisionType(null)
    setRemarks("")

    if (!searchId) {
      setSearchError("Enter a valid DHARA ID.")
      return
    }

    const storedProjects = readProjects()

    const sourceProjects =
      storedProjects.length > 0
        ? storedProjects
        : fallbackProjects

    const matchingProject = sourceProjects.find(
      (project) => {
        const projectId = String(
          project?.id || ""
        ).trim()

        const referenceId = String(
          project?.dharaReference || ""
        ).trim()

        return (
          projectId === searchId ||
          referenceId === searchId
        )
      }
    )

    if (!matchingProject) {
      setSearchError(
        "No project was found for this DHARA ID."
      )
      return
    }

    if (!isCompensationProject(matchingProject)) {
      setSearchError(
        "This project is not currently awaiting SLCO compensation action."
      )
      return
    }

    setProjects(sourceProjects)
    setSelectedProject(matchingProject)
  }

  /* ============================================================
     CLEAR SEARCH
  ============================================================ */

  const handleClearSearch = () => {
    setDharaId("")
    setSelectedProject(null)
    setProjects([])
    setSearchError("")
    setRemarks("")
    setSubmitted(false)
    setDecisionType(null)
  }

  /* ============================================================
     BLOCK #7 — COMPENSATION APPROVED
  ============================================================ */

  const handleApproveCompensation = async () => {
    if (!selectedProject || processing) {
      return
    }

    if (hasCompensationApproval(selectedProject)) {
      return
    }

    setProcessing(true)
    setSearchError("")

    try {
      const storedProjects = readProjects()

      const sourceProjects =
        storedProjects.length > 0
          ? storedProjects
          : fallbackProjects

      const latestProject = sourceProjects.find(
        (project) =>
          project.id === selectedProject.id
      )

      if (
        !latestProject ||
        !isAwaitingApproval(latestProject)
      ) {
        setSearchError(
          "This project is no longer awaiting compensation approval."
        )

        setProcessing(false)
        return
      }

      const approvedAt =
        new Date().toISOString()

      const updatedProjects =
        sourceProjects.map((project) => {
          if (
            project.id !== selectedProject.id
          ) {
            return project
          }

          return {
            ...project,

            stage: "Compensation",

            status:
              "Compensation Approved — Payment Pending",

            authority: "SLCO",

            nextAction:
              "Compensation Payment",

            /* BLOCK #7 */

            compensationApprovalStatus:
              "Approved",

            compensationApproved: true,

            compensationApprovedAt:
              approvedAt,

            compensationDecision:
              "Approved",

            compensationRemarks:
              remarks.trim(),

            /* BLOCK #8 PENDING */

            compensationPaymentStatus:
              "Pending",

            compensationPaid: false,

            /* CITIZEN WAITS FOR PAYMENT */

            citizenAcknowledgementStatus:
              "Pending",

            citizenAcknowledged: false,

            /* IMPLEMENTATION LOCKED */

            implementationStatus:
              "Locked",

            implementationEligible:
              false,
          }
        })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProjects)
      )

      const updatedProject =
        updatedProjects.find(
          (project) =>
            project.id === selectedProject.id
        )

      setProjects(updatedProjects)

      setSelectedProject(
        updatedProject || selectedProject
      )

      /* BLOCK #7 LEDGER EVENT */

      await addLedgerEvent({
        projectId: selectedProject.id,

        event:
          "COMPENSATION APPROVED",

        authority:
          "Special Land Acquisition Officer (SLCO)",

        details: {
          projectName:
            getProjectName(selectedProject),

          state:
            selectedProject?.state || "—",

          district:
            selectedProject?.district || "—",

          compensationAmount:
            getCompensationAmount(
              selectedProject
            ),

          affectedParcels:
            getAffectedParcels(
              selectedProject
            ),

          decision: "Approved",

          remarks:
            remarks.trim(),

          approvedAt,

          nextStage:
            "Compensation Payment",

          paymentStatus:
            "Pending",

          citizenAcknowledgementStatus:
            "Pending",

          implementationStatus:
            "Locked",
        },
      })

      setDecisionType("approved")
      setSubmitted(true)
    } catch (error) {
      console.error(
        "Compensation approval failed:",
        error
      )

      setSearchError(
        "The compensation approval could not be recorded. Please try again."
      )
    } finally {
      setProcessing(false)
    }
  }

  /* ============================================================
     BLOCK #8 — COMPENSATION PAID
  ============================================================ */

  const handleRecordPayment = async () => {
    if (!selectedProject || processing) {
      return
    }

    /* PAYMENT ONLY AFTER APPROVAL */

    if (
      !hasCompensationApproval(
        selectedProject
      ) ||
      hasCompensationPayment(
        selectedProject
      )
    ) {
      return
    }

    setProcessing(true)
    setSearchError("")

    try {
      const storedProjects = readProjects()

      const sourceProjects =
        storedProjects.length > 0
          ? storedProjects
          : fallbackProjects

      const latestProject =
        sourceProjects.find(
          (project) =>
            project.id === selectedProject.id
        )

      if (
        !latestProject ||
        !isAwaitingPayment(latestProject)
      ) {
        setSearchError(
          "This project is not currently awaiting compensation payment."
        )

        setProcessing(false)
        return
      }

      const paidAt =
        new Date().toISOString()

      const updatedProjects =
        sourceProjects.map((project) => {
          if (
            project.id !== selectedProject.id
          ) {
            return project
          }

          return {
            ...project,

            stage: "Compensation",

            status:
              "Compensation Paid — Citizen Acknowledgement Pending",

            authority: "SLCO",

            nextAction:
              "Citizen Acknowledgement",

            /* APPROVAL REMAINS COMPLETED */

            compensationApprovalStatus:
              "Approved",

            compensationApproved:
              true,

            /* BLOCK #8 */

            compensationPaymentStatus:
              "Paid",

            compensationPaid:
              true,

            compensationPaidAt:
              paidAt,

            paymentStatus:
              "Paid",

            /* CITIZEN ACKNOWLEDGEMENT */

            citizenAcknowledgementStatus:
              "Pending",

            citizenAcknowledged:
              false,

            /* IMPLEMENTATION LOCKED */

            implementationStatus:
              "Locked",

            implementationEligible:
              false,

            /* CITIZEN NOTIFICATION */

            citizenNotification: {
              type:
                "COMPENSATION_PAID",

              message:
                "Compensation has been approved and payment has been recorded. Please acknowledge receipt in the Citizen Portal.",

              createdAt:
                paidAt,
            },

            /* COMPANY NOTIFICATION */

            companyNotification: {
              type:
                "COMPENSATION_PAID",

              message:
                "Compensation payment has been recorded. Citizen acknowledgement is pending before implementation.",

              createdAt:
                paidAt,
            },

            companyNotificationStatus:
              "Unread",
          }
        })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProjects)
      )

      const updatedProject =
        updatedProjects.find(
          (project) =>
            project.id === selectedProject.id
        )

      setProjects(updatedProjects)

      setSelectedProject(
        updatedProject || selectedProject
      )

      /* BLOCK #8 LEDGER EVENT */

      await addLedgerEvent({
        projectId:
          selectedProject.id,

        event:
          "COMPENSATION PAID",

        authority:
          "Special Land Acquisition Officer (SLCO)",

        details: {
          projectName:
            getProjectName(selectedProject),

          state:
            selectedProject?.state || "—",

          district:
            selectedProject?.district || "—",

          compensationAmount:
            getCompensationAmount(
              selectedProject
            ),

          affectedParcels:
            getAffectedParcels(
              selectedProject
            ),

          approvalStatus:
            "Approved",

          paymentStatus:
            "Paid",

          paidAt,

          citizenAcknowledgementStatus:
            "Pending",

          implementationStatus:
            "Locked",

          nextStage:
            "Citizen Acknowledgement",
        },
      })

      setDecisionType("paid")
      setSubmitted(true)
    } catch (error) {
      console.error(
        "Compensation payment failed:",
        error
      )

      setSearchError(
        "The compensation payment could not be recorded. Please try again."
      )
    } finally {
      setProcessing(false)
    }
  }

  /* ============================================================
     COMPENSATION REVIEW — HOLD
  ============================================================ */

  const handleHold = async () => {
    if (!selectedProject || processing) {
      return
    }

    /* HOLD ONLY BEFORE APPROVAL */

    if (
      hasCompensationApproval(
        selectedProject
      )
    ) {
      return
    }

    setProcessing(true)
    setSearchError("")

    try {
      const storedProjects = readProjects()

      const sourceProjects =
        storedProjects.length > 0
          ? storedProjects
          : fallbackProjects

      const heldAt =
        new Date().toISOString()

      const updatedProjects =
        sourceProjects.map((project) => {
          if (
            project.id !== selectedProject.id
          ) {
            return project
          }

          return {
            ...project,

            stage:
              "Compensation",

            status:
              "Compensation Review On Hold",

            authority:
              "SLCO",

            nextAction:
              "SLCO Review",

            compensationApprovalStatus:
              "Exception",

            compensationApproved:
              false,

            compensationDecision:
              "On Hold",

            compensationRemarks:
              remarks.trim(),

            compensationExceptionAt:
              heldAt,

            compensationPaymentStatus:
              "Pending",

            compensationPaid:
              false,

            citizenAcknowledgementStatus:
              "Pending",

            citizenAcknowledged:
              false,

            implementationStatus:
              "Locked",

            implementationEligible:
              false,
          }
        })

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedProjects)
      )

      const updatedProject =
        updatedProjects.find(
          (project) =>
            project.id === selectedProject.id
        )

      setProjects(updatedProjects)

      setSelectedProject(
        updatedProject || selectedProject
      )

      /* COMPENSATION EXCEPTION LEDGER EVENT */

      await addLedgerEvent({
        projectId:
          selectedProject.id,

        event:
          "COMPENSATION EXCEPTION",

        authority:
          "Special Land Acquisition Officer (SLCO)",

        details: {
          projectName:
            getProjectName(selectedProject),

          state:
            selectedProject?.state || "—",

          district:
            selectedProject?.district || "—",

          compensationAmount:
            getCompensationAmount(
              selectedProject
            ),

          affectedParcels:
            getAffectedParcels(
              selectedProject
            ),

          decision:
            "On Hold",

          remarks:
            remarks.trim(),

          nextStage:
            "SLCO Review",

          paymentStatus:
            "Pending",

          implementationStatus:
            "Locked",
        },
      })

      setDecisionType("hold")
      setSubmitted(true)
    } catch (error) {
      console.error(
        "Compensation hold failed:",
        error
      )

      setSearchError(
        "The compensation review could not be placed on hold. Please try again."
      )
    } finally {
      setProcessing(false)
    }
  }

  /* ============================================================
     DERIVED VALUES
  ============================================================ */

  const projectName = selectedProject
    ? getProjectName(selectedProject)
    : "Compensation Review"

  const compensationAmount =
    selectedProject
      ? getCompensationAmount(
          selectedProject
        )
      : "—"

  const affectedParcels =
    selectedProject
      ? getAffectedParcels(
          selectedProject
        )
      : "—"

  const isApproved =
    selectedProject &&
    hasCompensationApproval(
      selectedProject
    )

  const isPaid =
    selectedProject &&
    hasCompensationPayment(
      selectedProject
    )

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="border-b border-[var(--line)] bg-[var(--paper)]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">

          <div>

            <button
              onClick={() =>
                navigate("/portal/slco")
              }
              className="mb-3 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink-soft)] transition hover:text-[var(--ink)]"
            >
              <ArrowLeft size={13} />
              SLCO Portal
            </button>

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center border border-[var(--line-dark)] bg-[var(--paper-deep)]">
                <CircleDollarSign size={17} />
              </div>

              <div>

                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                  SLCO / Special Land Acquisition Officer
                </p>

                <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">
                  Compensation processing.
                </h1>

              </div>

            </div>

          </div>

          <div className="hidden items-center gap-2 border border-[var(--line)] px-3 py-2 sm:flex">

            <LockKeyhole size={13} />

            <span className="font-mono text-[9px] uppercase tracking-[0.16em]">
              Implementation Gate
            </span>

            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--earth)]">
              Locked
            </span>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">

        {/* ====================================================
            INTRO
        ==================================================== */}

        <section className="mb-8 max-w-3xl">

          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--earth)]">
            Compensation / Stages 07–08
          </p>

          <h2 className="font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
            Review and process the compensation record.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
            The project has completed central oversight and is now
            with the Special Land Acquisition Officer. Compensation
            approval and payment are recorded as separate verified
            events. Payment cannot occur until compensation has been
            approved.
          </p>

        </section>

        {/* ====================================================
            SEARCH
        ==================================================== */}

        <section className="mb-8 border border-[var(--line)] bg-[var(--white)]">

          <div className="border-b border-[var(--line)] px-5 py-4 sm:px-6">

            <div className="flex items-center gap-2">

              <Search size={15} />

              <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
                Locate project
              </p>

            </div>

          </div>

          <div className="p-5 sm:p-6">

            <div className="flex flex-col gap-3 sm:flex-row">

              <div className="relative flex-1">

                <input
                  type="text"
                  value={dharaId}
                  onChange={(event) => {
                    setDharaId(
                      event.target.value
                    )

                    setSearchError("")
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch()
                    }
                  }}
                  placeholder="Enter DHARA ID"
                  className="w-full border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3 font-mono text-xs uppercase tracking-[0.08em] outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--earth)]"
                />

              </div>

              <button
                onClick={handleSearch}
                className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--white)] transition hover:bg-[var(--earth-dark)]"
              >
                Search
                <ArrowRight size={13} />
              </button>

            </div>

            {searchError && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -4,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="mt-4 flex items-start gap-3 border border-[var(--earth)] bg-[var(--paper-deep)] p-4"
              >

                <AlertTriangle
                  size={15}
                  className="mt-0.5 shrink-0 text-[var(--earth)]"
                />

                <p className="font-mono text-[10px] leading-5 text-[var(--ink-soft)]">
                  {searchError}
                </p>

              </motion.div>
            )}

          </div>

        </section>

        {/* ====================================================
            PROJECT
        ==================================================== */}

        {selectedProject && (

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="space-y-6"
          >

            {/* =================================================
                PROJECT IDENTITY
            ================================================= */}

            <section className="border border-[var(--line)] bg-[var(--white)]">

              <div className="flex flex-col gap-5 border-b border-[var(--line)] p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">

                <div>

                  <div className="mb-3 flex flex-wrap items-center gap-2">

                    <span className="border border-[var(--line-dark)] bg-[var(--paper-deep)] px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em]">
                      DHARA ID
                    </span>

                    <span className="px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                      {selectedProject.id}
                    </span>

                  </div>

                  <h3 className="font-serif text-3xl tracking-tight">
                    {projectName}
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-4 text-[var(--ink-soft)]">

                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em]">

                      <MapPin size={12} />

                      {selectedProject.district ||
                        "—"}
                      ,{" "}
                      {selectedProject.state ||
                        "—"}

                    </span>

                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em]">

                      <FileText size={12} />

                      {selectedProject.landArea ||
                        "—"}

                    </span>

                  </div>

                </div>

                <div className="flex shrink-0 items-center gap-2 border border-[var(--earth)] bg-[var(--paper-deep)] px-3 py-2">

                  <LockKeyhole
                    size={13}
                    className="text-[var(--earth)]"
                  />

                  <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                    Implementation Locked
                  </span>

                </div>

              </div>

              {/* STATUS GRID */}

              <div className="grid grid-cols-2 divide-x divide-[var(--line)] sm:grid-cols-4">

                <div className="p-5">

                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    Compensation
                  </p>

                  <p className="mt-2 font-serif text-2xl">
                    {compensationAmount}
                  </p>

                </div>

                <div className="p-5">

                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    Affected Parcels
                  </p>

                  <p className="mt-2 font-serif text-2xl">
                    {affectedParcels}
                  </p>

                </div>

                <div className="border-t border-[var(--line)] p-5 sm:border-t-0">

                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    Approval
                  </p>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--earth)]">
                    {isApproved
                      ? "Approved"
                      : "Pending"}
                  </p>

                </div>

                <div className="border-t border-[var(--line)] p-5 sm:border-t-0">

                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                    Payment
                  </p>

                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--earth)]">
                    {isPaid
                      ? "Paid"
                      : "Pending"}
                  </p>

                </div>

              </div>

            </section>

            {/* =================================================
                ACTION AREA
            ================================================= */}

            {!submitted && (

              <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">

                {/* APPROVAL / PAYMENT */}

                <div className="border border-[var(--line)] bg-[var(--white)]">

                  <div className="border-b border-[var(--line)] p-5 sm:p-6">

                    <div className="flex items-center gap-3">

                      <div className="flex h-9 w-9 items-center justify-center border border-[var(--line-dark)] bg-[var(--paper-deep)]">

                        {isApproved ? (
                          <CheckCircle2
                            size={16}
                          />
                        ) : (
                          <CircleDollarSign
                            size={16}
                          />
                        )}

                      </div>

                      <div>

                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                          SLCO action
                        </p>

                        <h4 className="font-serif text-xl">

                          {isApproved
                            ? "Compensation payment"
                            : "Compensation decision"}

                        </h4>

                      </div>

                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    {/* APPROVAL PENDING */}

                    {!isApproved && (

                      <>

                        <div className="mb-6 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-2">

                          <div className="bg-[var(--paper)] p-4">

                            <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--ink-soft)]">
                              Central decision
                            </p>

                            <p className="mt-2 font-mono text-xs uppercase tracking-[0.08em]">
                              {selectedProject.centralDecision ||
                                "Approved"}
                            </p>

                          </div>

                          <div className="bg-[var(--paper)] p-4">

                            <p className="font-mono text-[9px] uppercase tracking-[0.13em] text-[var(--ink-soft)]">
                              Current authority
                            </p>

                            <p className="mt-2 font-mono text-xs uppercase tracking-[0.08em]">
                              SLCO
                            </p>

                          </div>

                        </div>

                        <label className="block">

                          <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                            SLCO Review Remarks
                          </span>

                          <textarea
                            value={remarks}
                            onChange={(event) =>
                              setRemarks(
                                event.target.value
                              )
                            }
                            rows={5}
                            placeholder="Record the compensation review, observations, or decision basis..."
                            className="w-full resize-none border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--earth)]"
                          />

                        </label>

                        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                          <button
                            onClick={handleHold}
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 border border-[var(--line-dark)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] transition hover:bg-[var(--paper-deep)] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <AlertTriangle
                              size={13}
                            />

                            Hold Review

                          </button>

                          <button
                            onClick={
                              handleApproveCompensation
                            }
                            disabled={processing}
                            className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white)] transition hover:bg-[var(--earth-dark)] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <ShieldCheck
                              size={13}
                            />

                            {processing
                              ? "Recording..."
                              : "Approve Compensation"}

                            <ArrowRight
                              size={13}
                            />

                          </button>

                        </div>

                        <p className="mt-4 border-t border-[var(--line)] pt-4 font-mono text-[9px] leading-5 tracking-[0.04em] text-[var(--ink-soft)]">

                          Approval creates Block #7.
                          Payment must be recorded separately
                          as Block #8.

                        </p>

                      </>

                    )}

                    {/* PAYMENT PENDING */}

                    {isApproved && !isPaid && (

                      <>

                        <div className="border border-[var(--line)] bg-[var(--paper)] p-5">

                          <div className="flex items-start gap-4">

                            <CheckCircle2
                              size={20}
                              className="mt-0.5 shrink-0 text-[var(--earth)]"
                            />

                            <div>

                              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--earth)]">
                                Compensation approved
                              </p>

                              <h4 className="mt-1 font-serif text-2xl">
                                Ready for payment.
                              </h4>

                              <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
                                Compensation approval has already
                                been recorded. The next permitted
                                action is to record the actual
                                compensation payment.
                              </p>

                            </div>

                          </div>

                        </div>

                        <label className="mt-6 block">

                          <span className="mb-2 block font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                            Payment Remarks
                          </span>

                          <textarea
                            value={remarks}
                            onChange={(event) =>
                              setRemarks(
                                event.target.value
                              )
                            }
                            rows={4}
                            placeholder="Record payment reference, transfer confirmation or other payment remarks..."
                            className="w-full resize-none border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-[var(--ink-soft)] focus:border-[var(--earth)]"
                          />

                        </label>

                        <div className="mt-5">

                          <button
                            onClick={
                              handleRecordPayment
                            }
                            disabled={processing}
                            className="inline-flex w-full items-center justify-center gap-2 bg-[var(--ink)] px-5 py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white)] transition hover:bg-[var(--earth-dark)] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                          >

                            <CircleDollarSign
                              size={14}
                            />

                            {processing
                              ? "Recording Payment..."
                              : "Record Compensation Payment"}

                            <ArrowRight
                              size={13}
                            />

                          </button>

                        </div>

                        <p className="mt-4 border-t border-[var(--line)] pt-4 font-mono text-[9px] leading-5 tracking-[0.04em] text-[var(--ink-soft)]">

                          Recording payment creates Block #8.
                          The project remains in Compensation until
                          the citizen acknowledges receipt.

                        </p>

                      </>

                    )}

                  </div>

                </div>

                {/* DOWNSTREAM GATE */}

                <div className="border border-[var(--line)] bg-[var(--paper-deep)]">

                  <div className="border-b border-[var(--line)] p-5 sm:p-6">

                    <div className="flex items-center justify-between">

                      <div>

                        <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                          Downstream control
                        </p>

                        <h4 className="mt-1 font-serif text-xl">
                          Implementation gate
                        </h4>

                      </div>

                      <LockKeyhole
                        size={19}
                        className="text-[var(--earth)]"
                      />

                    </div>

                  </div>

                  <div className="p-5 sm:p-6">

                    <div className="border border-[var(--line-dark)] bg-[var(--white)] p-5">

                      <div className="mb-4 flex items-center gap-3">

                        <div className="h-2.5 w-2.5 rounded-full bg-[var(--earth)]" />

                        <span className="font-mono text-[10px] uppercase tracking-[0.15em]">
                          Locked
                        </span>

                      </div>

                      <p className="text-sm leading-6 text-[var(--ink-soft)]">
                        Implementation remains locked until
                        compensation is paid and the citizen
                        acknowledges receipt.
                      </p>

                    </div>

                    <div className="mt-5 space-y-3">

                      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">

                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                          Compensation approval
                        </span>

                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--earth)]">

                          {isApproved
                            ? "Approved"
                            : "Pending"}

                        </span>

                      </div>

                      <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">

                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                          Compensation payment
                        </span>

                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--earth)]">

                          {isPaid
                            ? "Paid"
                            : "Pending"}

                        </span>

                      </div>

                      <div className="flex items-center justify-between">

                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--ink-soft)]">
                          Citizen acknowledgement
                        </span>

                        <span className="font-mono text-[9px] uppercase tracking-[0.1em]">
                          Pending
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              </section>

            )}

            {/* ====================================================
                RESULT
            ==================================================== */}

            {submitted && (

              <motion.section
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="border border-[var(--line)] bg-[var(--white)]"
              >

                <div className="p-6 sm:p-8">

                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--line-dark)] bg-[var(--paper-deep)]">

                      {decisionType === "hold" ? (
                        <AlertTriangle
                          size={23}
                          className="text-[var(--earth)]"
                        />
                      ) : decisionType === "paid" ? (
                        <CircleDollarSign
                          size={23}
                        />
                      ) : (
                        <CheckCircle2
                          size={23}
                        />
                      )}

                    </div>

                    <div className="flex-1">

                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">

                        {decisionType ===
                        "approved"
                          ? "Block #7 Recorded"
                          : decisionType ===
                            "paid"
                          ? "Block #8 Recorded"
                          : "Compensation Exception"}

                      </p>

                      <h3 className="mt-2 font-serif text-3xl tracking-tight">

                        {decisionType ===
                        "approved"
                          ? "Compensation approved."
                          : decisionType ===
                            "paid"
                          ? "Compensation paid."
                          : "Compensation review is on hold."}

                      </h3>

                      <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">

                        {decisionType ===
                        "approved"
                          ? "The compensation decision has been recorded by the SLCO. Payment is now the next permitted workflow action. Citizen acknowledgement and implementation remain locked."
                          : decisionType ===
                            "paid"
                          ? "Compensation payment has been recorded. The citizen has now been notified and must acknowledge receipt before the project becomes eligible for government implementation."
                          : "The compensation review has been placed on hold. Payment, citizen acknowledgement, and implementation remain locked until the SLCO resumes and resolves the review."}

                      </p>

                      {/* STATUS */}

                      <div className="mt-6 grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">

                        <div className="bg-[var(--paper)] p-4">

                          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                            Approval
                          </p>

                          <p className="mt-2 font-mono text-[10px] uppercase">

                            {decisionType ===
                              "approved" ||
                            decisionType ===
                              "paid"
                              ? "Approved"
                              : "On Hold"}

                          </p>

                        </div>

                        <div className="bg-[var(--paper)] p-4">

                          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                            Payment
                          </p>

                          <p className="mt-2 font-mono text-[10px] uppercase">

                            {decisionType ===
                            "paid"
                              ? "Paid"
                              : "Pending"}

                          </p>

                        </div>

                        <div className="bg-[var(--paper)] p-4">

                          <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                            Citizen
                          </p>

                          <p className="mt-2 font-mono text-[10px] uppercase">
                            Pending
                          </p>

                        </div>

                      </div>

                      {/* NEXT ACTION */}

                      {decisionType ===
                        "approved" && (

                        <div className="mt-6 border border-[var(--line)] bg-[var(--paper-deep)] p-5">

                          <div className="flex gap-3">

                            <CircleDollarSign
                              size={17}
                              className="mt-0.5 shrink-0 text-[var(--earth)]"
                            />

                            <div>

                              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--earth)]">
                                Next workflow action
                              </p>

                              <p className="mt-2 font-serif text-xl">
                                Record Compensation Payment
                              </p>

                              <p className="mt-2 font-mono text-[10px] leading-5 text-[var(--ink-soft)]">
                                Search the same DHARA ID to
                                record Block #8.
                              </p>

                            </div>

                          </div>

                        </div>

                      )}

                      {decisionType ===
                        "paid" && (

                        <div className="mt-6 border border-[var(--line)] bg-[var(--paper-deep)] p-5">

                          <div className="flex gap-3">

                            <UserCheck
                              size={17}
                              className="mt-0.5 shrink-0 text-[var(--earth)]"
                            />

                            <div>

                              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--earth)]">
                                Next workflow action
                              </p>

                              <p className="mt-2 font-serif text-xl">
                                Citizen Acknowledgement
                              </p>

                              <p className="mt-2 font-mono text-[10px] leading-5 text-[var(--ink-soft)]">
                                The citizen can now open the
                                Citizen Portal, review the paid
                                compensation record, and
                                acknowledge receipt.
                              </p>

                            </div>

                          </div>

                        </div>

                      )}

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                        <button
                          onClick={
                            handleClearSearch
                          }
                          className="inline-flex items-center justify-center gap-2 border border-[var(--line-dark)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] transition hover:bg-[var(--paper-deep)]"
                        >

                          <ArrowLeft
                            size={13}
                          />

                          Review Another DHARA ID

                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              "/portal/slco"
                            )
                          }
                          className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--white)] transition hover:bg-[var(--earth-dark)]"
                        >

                          Return to SLCO Portal

                          <ArrowRight
                            size={13}
                          />

                        </button>

                      </div>

                    </div>

                  </div>

                </div>

              </motion.section>

            )}

            {/* ====================================================
                WORKFLOW NOTICE
            ==================================================== */}

            <section className="border border-[var(--line)] bg-[var(--paper-deep)] p-5 sm:p-6">

              <div className="flex gap-4">

                <ShieldCheck
                  size={17}
                  className="mt-0.5 shrink-0"
                />

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                    Workflow integrity
                  </p>

                  <p className="mt-2 max-w-4xl text-xs leading-6 text-[var(--ink-soft)]">

                    Compensation approval creates{" "}

                    <strong className="font-medium text-[var(--ink)]">
                      BLOCK #7 — COMPENSATION APPROVED
                    </strong>
                    .

                    {" "}Payment is a separate event:

                    {" "}

                    <strong className="font-medium text-[var(--ink)]">
                      BLOCK #8 — COMPENSATION PAID
                    </strong>
                    .

                    {" "}After payment, the citizen receives a
                    notification and can acknowledge compensation.
                    Only after that acknowledgement does the project
                    become eligible for government implementation.

                  </p>

                </div>

              </div>

            </section>

          </motion.div>

        )}

      </main>

    </div>
  )
}