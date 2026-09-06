import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Bell,
  ReceiptText,
} from "lucide-react"
import { addLedgerEvent } from "../blockchain/dharaLedger"

const STORAGE_KEY = "dhara-projects"

const fallbackProjects = [
  {
    id: "WB-2048",
    projectName: "Eastern Freight Corridor",
    projectType: "Transport Infrastructure",
    state: "West Bengal",
    district: "Kolkata",
    landArea: "248 acres",
    parcels: 42,
    stage: "Compensation",
    status: "Compensation Approved — Payment Pending",
    compensationStatus: "Approved",
    compensationApprovalStatus: "Approved",
    compensationPaymentStatus: "Pending",
    compensationAmount: "₹8,40,000",
    paymentStatus: "Payment Pending",
    citizenAcknowledgementStatus: "Pending",
    implementationStatus: "Implementation Locked",
    surveyNumber: "WB-KOL-2048-17",
  },
  {
    id: "MH-7731",
    projectName: "Industrial Corridor",
    projectType: "Industrial Development",
    state: "Maharashtra",
    district: "Pune",
    landArea: "391 acres",
    parcels: 68,
    stage: "Central Oversight",
    status: "Pending Compensation Processing",
    compensationStatus: "Not Initiated",
    compensationApprovalStatus: "Pending",
    compensationPaymentStatus: "Pending",
    compensationAmount: "₹6,75,000",
    paymentStatus: "Awaiting Processing",
    citizenAcknowledgementStatus: "Pending",
    implementationStatus: "Implementation Locked",
    surveyNumber: "MH-PUN-7731-08",
  },
  {
    id: "OD-0912",
    projectName: "Coastal Infrastructure Project",
    projectType: "Infrastructure",
    state: "Odisha",
    district: "Khordha",
    landArea: "164 acres",
    parcels: 27,
    stage: "District Scrutiny",
    status: "Under District Review",
    compensationStatus: "Not Started",
    compensationApprovalStatus: "Pending",
    compensationPaymentStatus: "Pending",
    compensationAmount: "—",
    paymentStatus: "Not Applicable Yet",
    citizenAcknowledgementStatus: "Pending",
    implementationStatus: "Not Eligible",
    surveyNumber: "OD-KHD-0912-04",
  },
]

function getProjects() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    )

    if (Array.isArray(stored) && stored.length > 0) {
      return stored
    }

    return fallbackProjects
  } catch {
    return fallbackProjects
  }
}

function getProjectName(project) {
  return (
    project?.projectName ||
    project?.name ||
    "Unnamed Project"
  )
}

function getCompensationStatus(project) {
  if (
    project?.compensationApprovalStatus ===
    "Approved"
  ) {
    return "Approved"
  }

  return (
    project?.compensationStatus ||
    project?.compensation?.status ||
    "Not Available"
  )
}

function getCompensationAmount(project) {
  return (
    project?.compensationAmount ||
    project?.compensation?.amount ||
    "Not Available"
  )
}

function getPaymentStatus(project) {
  return (
    project?.compensationPaymentStatus ||
    project?.paymentStatus ||
    project?.compensation?.paymentStatus ||
    "Not Available"
  )
}

function getImplementationStatus(project) {
  if (
    project?.implementationStatus ===
      "Eligible" ||
    project?.implementationEligible === true
  ) {
    return "Implementation Eligible"
  }

  if (
    project?.implementationStatus ===
    "In Progress"
  ) {
    return "Implementation In Progress"
  }

  if (
    project?.implementationStatus ===
    "Completed"
  ) {
    return "Completed"
  }

  return (
    project?.implementationStatus ||
    "Implementation Locked"
  )
}

function isCompensationApproved(project) {
  return (
    project?.compensationApprovalStatus ===
      "Approved" ||
    project?.compensationApproved === true ||
    project?.compensationStatus === "Approved"
  )
}

function isPaymentCompleted(project) {
  return (
    project?.compensationPaymentStatus ===
      "Paid" ||
    project?.compensationPaid === true ||
    project?.paymentStatus ===
      "Payment Completed" ||
    project?.paymentStatus === "Paid"
  )
}

function isCitizenAcknowledged(project) {
  return (
    project?.citizenAcknowledgementStatus ===
      "Acknowledged" ||
    project?.citizenAcknowledged === true
  )
}

function CitizenDashboard() {
  const navigate = useNavigate()

  const [dharaId, setDharaId] = useState("")
  const [record, setRecord] = useState(null)
  const [error, setError] = useState("")
  const [acknowledging, setAcknowledging] =
    useState(false)

  // NEW:
  // Transaction ID entered by the citizen after
  // compensation payment has been recorded.
  const [transactionId, setTransactionId] =
    useState("")

  // =====================================================
  // SEARCH DHARA RECORD
  // =====================================================

  const handleSearch = () => {
    const enteredId = dharaId
      .trim()
      .toUpperCase()

    setError("")
    setRecord(null)
    setTransactionId("")

    if (!enteredId) {
      setError(
        "Enter your DHARA ID to continue."
      )
      return
    }

    const projects = getProjects()

    const matchedProject = projects.find(
      (project) => {
        const projectId = String(
          project?.id || ""
        )
          .trim()
          .toUpperCase()

        const referenceId = String(
          project?.dharaReference || ""
        )
          .trim()
          .toUpperCase()

        return (
          projectId === enteredId ||
          referenceId === enteredId
        )
      }
    )

    if (!matchedProject) {
      setError(
        "No DHARA record was found for this ID. Please check the DHARA ID and try again."
      )
      return
    }

    setRecord(matchedProject)

    // If a transaction ID was already recorded,
    // restore it when the citizen searches again.
    setTransactionId(
      matchedProject?.citizenTransactionId ||
        ""
    )
  }

  // =====================================================
  // CITIZEN APPROVE IMPLEMENTATION
  // =====================================================

  const handleAcknowledgeCompensation =
    async () => {
      if (!record || acknowledging) {
        return
      }

      // Payment must be completed first.
      if (!isPaymentCompleted(record)) {
        setError(
          "Compensation payment has not yet been recorded. You can approve implementation only after payment is completed."
        )
        return
      }

      // Prevent duplicate acknowledgement.
      if (isCitizenAcknowledged(record)) {
        return
      }

      // Transaction ID is mandatory.
      const cleanedTransactionId =
        transactionId.trim()

      if (!cleanedTransactionId) {
        setError(
          "Enter the transaction ID received with your compensation payment."
        )
        return
      }

      setAcknowledging(true)
      setError("")

      try {
        const storedProjects = (() => {
          try {
            const stored = JSON.parse(
              localStorage.getItem(
                STORAGE_KEY
              ) || "[]"
            )

            return Array.isArray(stored)
              ? stored
              : []
          } catch {
            return []
          }
        })()

        const sourceProjects =
          storedProjects.length > 0
            ? storedProjects
            : fallbackProjects

        const acknowledgedAt =
          new Date().toISOString()

        const updatedProjects =
          sourceProjects.map(
            (project) => {
              const matchesProject =
                project.id === record.id ||
                project.dharaReference ===
                  record.dharaReference

              if (!matchesProject) {
                return project
              }

              return {
                ...project,

                // =========================================
                // CITIZEN PAYMENT CONFIRMATION
                // =========================================

                citizenTransactionId:
                  cleanedTransactionId,

                citizenTransactionSubmittedAt:
                  acknowledgedAt,

                // =========================================
                // CITIZEN IMPLEMENTATION APPROVAL
                // =========================================

                citizenAcknowledgementStatus:
                  "Acknowledged",

                citizenAcknowledged: true,

                citizenAcknowledgedAt:
                  acknowledgedAt,

                citizenImplementationApproval:
                  "Approved",

                // =========================================
                // IMPLEMENTATION ELIGIBILITY
                // =========================================

                implementationStatus:
                  "Eligible",

                implementationEligible:
                  true,

                stage:
                  "Possession / Implementation",

                status:
                  "Implementation Eligible",

                authority:
                  "Government Implementation Authority",

                nextAction:
                  "Implementation Start",

                // =========================================
                // COMPANY NOTIFICATION
                // =========================================

                companyNotification: {
                  type:
                    "CITIZEN_ACKNOWLEDGED",
                  message:
                    "Citizen has confirmed receipt of compensation and approved implementation. The project is now eligible for government implementation.",
                  createdAt:
                    acknowledgedAt,
                },

                companyNotificationStatus:
                  "Unread",
              }
            }
          )

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(
            updatedProjects
          )
        )

        const updatedProject =
          updatedProjects.find(
            (project) =>
              project.id === record.id
          )

        setRecord(
          updatedProject || record
        )

        await addLedgerEvent({
          projectId: record.id,
          event:
            "CITIZEN IMPLEMENTATION ACKNOWLEDGED",
          authority: "Citizen",
          details: {
            projectName:
              getProjectName(record),

            state:
              record?.state || "—",

            district:
              record?.district || "—",

            compensationAmount:
              getCompensationAmount(record),

            paymentStatus: "Paid",

            transactionId:
              cleanedTransactionId,

            acknowledgement:
              "Approved",

            acknowledgementAt:
              acknowledgedAt,

            implementationStatus:
              "Eligible",

            nextStage:
              "Government Implementation",
          },
        })
      } catch (
        acknowledgementError
      ) {
        console.error(
          "Citizen implementation approval failed:",
          acknowledgementError
        )

        setError(
          "Your implementation approval could not be recorded. Please try again."
        )
      } finally {
        setAcknowledging(false)
      }
    }

  // =====================================================
  // RESET / SEARCH ANOTHER ID
  // =====================================================

  const handleReset = () => {
    setDharaId("")
    setRecord(null)
    setError("")
    setTransactionId("")
  }

  // =====================================================
  // DERIVED STATUS
  // =====================================================

  const compensationApproved =
    record &&
    isCompensationApproved(record)

  const paymentCompleted =
    record &&
    isPaymentCompleted(record)

  const citizenHasAcknowledged =
    record &&
    isCitizenAcknowledged(record)

  const acknowledgementPending =
    compensationApproved &&
    paymentCompleted &&
    !citizenHasAcknowledged

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
              Citizen Portal
            </p>

            <p className="mt-1 font-mono text-[8px] text-[var(--ink-soft)]">
              Secure record access
            </p>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">

        {/* ===================================================
            INITIAL SEARCH
        =================================================== */}

        {!record && (
          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mx-auto max-w-3xl"
          >

            <div className="mb-8">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center border border-[var(--earth)] text-[var(--earth)]">
                  <LockKeyhole size={17} />
                </div>

                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                  Citizen Access
                </span>

              </div>

              <h1 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
                Your land,
                <br />
                <span className="text-[var(--ink-soft)]">
                  clearly tracked.
                </span>
              </h1>

              <p className="mt-5 max-w-2xl font-mono text-xs leading-6 text-[var(--ink-soft)]">
                Enter your DHARA ID to access
                the record associated with your
                government notification.
              </p>

            </div>

            <div className="border border-[var(--line)] bg-[var(--white)]">

              <div className="border-b border-[var(--line)] p-6 sm:p-8">

                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                  Record Access
                </div>

                <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                  Enter DHARA ID
                </h2>

              </div>

              <div className="p-6 sm:p-8">

                <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  DHARA ID
                </label>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                  <input
                    type="text"
                    value={dharaId}
                    onChange={(event) => {
                      setDharaId(
                        event.target.value
                      )
                      setError("")
                    }}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter"
                      ) {
                        handleSearch()
                      }
                    }}
                    placeholder="Enter your DHARA ID"
                    autoComplete="off"
                    className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--paper)] px-4 py-4 font-mono text-xs uppercase outline-none transition placeholder:normal-case placeholder:text-[var(--ink-soft)]/60 focus:border-[var(--earth)]"
                  />

                  <button
                    type="button"
                    onClick={handleSearch}
                    className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-7 py-4 font-mono text-[10px] uppercase tracking-[0.15em] text-[var(--white)] transition hover:bg-[var(--earth)]"
                  >
                    Search
                    <ArrowRight size={14} />
                  </button>

                </div>

                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-5 flex items-start gap-3 border border-[var(--earth)] bg-[var(--paper-deep)] p-4"
                  >

                    <AlertTriangle
                      size={15}
                      className="mt-0.5 shrink-0 text-[var(--earth)]"
                    />

                    <p className="font-mono text-[9px] leading-5 text-[var(--earth-dark)]">
                      {error}
                    </p>

                  </motion.div>
                )}

                <div className="mt-6 flex items-start gap-3 border-t border-[var(--line)] pt-5">

                  <ShieldCheck
                    size={14}
                    className="mt-0.5 shrink-0 text-[var(--earth)]"
                  />

                  <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                    Only the record associated
                    with a valid DHARA ID will be
                    displayed.
                  </p>

                </div>

              </div>

            </div>

          </motion.section>
        )}

        {/* =====================================================
            VERIFIED RECORD
        ===================================================== */}

        {record && (
          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mx-auto max-w-5xl"
          >

            {/* RECORD HEADER */}

            <div className="border border-[var(--line)] bg-[var(--white)]">

              <div className="border-b border-[var(--line)] p-6 sm:p-8">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                  <div>

                    <div className="mb-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">

                      <ShieldCheck size={12} />

                      Verified DHARA Record

                    </div>

                    <h1 className="font-serif text-3xl sm:text-4xl">
                      {getProjectName(record)}
                    </h1>

                    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">

                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                        DHARA ID:{" "}
                        <span className="text-[var(--ink)]">
                          {record.id}
                        </span>
                      </span>

                      <span className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--ink-soft)]">
                        <MapPin size={11} />
                        {record.district ||
                          "District"},{" "}
                        {record.state ||
                          "State"}
                      </span>

                    </div>

                  </div>

                  <div className="border border-[var(--earth)] bg-[var(--paper-deep)] px-4 py-3">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Current Stage
                    </p>

                    <p className="mt-1 font-mono text-xs uppercase text-[var(--earth)]">
                      {record.stage ||
                        "Processing"}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  LAND RECORD
              ================================================= */}

              <div className="grid border-b border-[var(--line)] sm:grid-cols-3">

                <div className="border-b border-[var(--line)] p-6 sm:border-r sm:border-b-0">

                  <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                    Survey / Parcel
                  </p>

                  <p className="mt-2 font-mono text-xs">
                    {record.surveyNumber ||
                      "Record linked"}
                  </p>

                </div>

                <div className="border-b border-[var(--line)] p-6 sm:border-r sm:border-b-0">

                  <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                    Land Area
                  </p>

                  <p className="mt-2 font-mono text-xs">
                    {record.landArea ||
                      record.land ||
                      "—"}
                  </p>

                </div>

                <div className="p-6">

                  <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                    Project Type
                  </p>

                  <p className="mt-2 font-mono text-xs">
                    {record.projectType ||
                      "Project"}
                  </p>

                </div>

              </div>

              {/* =================================================
                  COMPENSATION
              ================================================= */}

              <div className="p-6 sm:p-8">

                <div className="mb-6 flex items-start gap-3">

                  <div className="flex h-10 w-10 items-center justify-center border border-[var(--earth)]">

                    <CircleDollarSign
                      size={18}
                      className="text-[var(--earth)]"
                    />

                  </div>

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                      Compensation
                    </p>

                    <h2 className="mt-1 font-serif text-2xl">
                      Your compensation status
                    </h2>

                  </div>

                </div>

                <div className="grid gap-4 sm:grid-cols-3">

                  <div className="border border-[var(--line)] bg-[var(--paper)] p-5">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Compensation Amount
                    </p>

                    <p className="mt-3 font-serif text-2xl">
                      {getCompensationAmount(
                        record
                      )}
                    </p>

                  </div>

                  <div className="border border-[var(--line)] bg-[var(--paper)] p-5">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Compensation Status
                    </p>

                    <div className="mt-3 flex items-center gap-2">

                      {compensationApproved ? (
                        <CheckCircle2
                          size={15}
                          className="text-[var(--earth)]"
                        />
                      ) : (
                        <Clock3
                          size={15}
                          className="text-[var(--earth)]"
                        />
                      )}

                      <p className="font-mono text-xs">
                        {getCompensationStatus(
                          record
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="border border-[var(--line)] bg-[var(--paper)] p-5">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Payment Status
                    </p>

                    <div className="mt-3 flex items-center gap-2">

                      {paymentCompleted ? (
                        <CheckCircle2
                          size={15}
                          className="text-[var(--earth)]"
                        />
                      ) : (
                        <Clock3
                          size={15}
                          className="text-[var(--earth)]"
                        />
                      )}

                      <p className="font-mono text-xs">
                        {getPaymentStatus(
                          record
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* =================================================
                  GOVERNMENT NOTIFICATION
              ================================================= */}

              {compensationApproved && (
                <div className="border-t border-[var(--line)]">

                  <div className="p-6 sm:p-8">

                    <div className="flex items-start gap-4">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--earth)] bg-[var(--paper-deep)]">

                        <Bell
                          size={17}
                          className="text-[var(--earth)]"
                        />

                      </div>

                      <div className="flex-1">

                        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                          Government Notification
                        </p>

                        <h2 className="mt-1 font-serif text-2xl">
                          Compensation update
                        </h2>

                        {!paymentCompleted && (
                          <p className="mt-3 max-w-2xl font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                            Your compensation has
                            been approved by the
                            Special Land Acquisition
                            Officer. Payment is
                            currently pending. You
                            will be able to confirm
                            receipt after payment has
                            been recorded.
                          </p>
                        )}

                        {paymentCompleted &&
                          !citizenHasAcknowledged && (
                            <p className="mt-3 max-w-2xl font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                              Your compensation has
                              been approved and payment
                              has been recorded. Enter
                              the transaction ID received
                              with your payment and
                              approve implementation.
                            </p>
                          )}

                        {citizenHasAcknowledged && (
                          <p className="mt-3 max-w-2xl font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                            Your compensation receipt
                            and implementation approval
                            have been recorded. The
                            project is now eligible for
                            government implementation.
                            The Government Implementation
                            Authority will proceed with
                            the next step.
                          </p>
                        )}

                      </div>

                    </div>

                    {/* =================================================
                        CITIZEN ACTION
                    ================================================= */}

                    {acknowledgementPending && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="mt-6 border border-[var(--earth)] bg-[var(--paper-deep)] p-5 sm:p-6"
                      >

                        <div className="mb-5 flex items-start gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center border border-[var(--earth)] bg-[var(--paper)]">

                            <ReceiptText
                              size={16}
                              className="text-[var(--earth)]"
                            />

                          </div>

                          <div>

                            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--earth)]">
                              Citizen Action Required
                            </p>

                            <p className="mt-2 max-w-2xl font-mono text-[10px] leading-5">
                              Confirm that you have
                              received the compensation
                              payment by entering the
                              transaction ID provided with
                              your payment notification.
                              Approval will unlock the
                              government implementation
                              process.
                            </p>

                          </div>

                        </div>

                        <label className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                          Compensation Transaction ID
                        </label>

                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">

                          <input
                            type="text"
                            value={transactionId}
                            onChange={(event) => {
                              setTransactionId(
                                event.target.value
                              )
                              setError("")
                            }}
                            placeholder="Enter transaction ID"
                            autoComplete="off"
                            className="min-w-0 flex-1 border border-[var(--line)] bg-[var(--paper)] px-4 py-4 font-mono text-xs uppercase outline-none transition placeholder:normal-case placeholder:text-[var(--ink-soft)]/60 focus:border-[var(--earth)]"
                          />

                          <button
                            type="button"
                            onClick={
                              handleAcknowledgeCompensation
                            }
                            disabled={
                              acknowledging ||
                              !transactionId.trim()
                            }
                            className="inline-flex shrink-0 items-center justify-center gap-2 bg-[var(--ink)] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--white)] transition hover:bg-[var(--earth)] disabled:cursor-not-allowed disabled:opacity-50"
                          >

                            <CheckCircle2 size={13} />

                            {acknowledging
                              ? "Recording..."
                              : "Approve Implementation"}

                            <ArrowRight size={13} />

                          </button>

                        </div>

                        <div className="mt-4 flex items-start gap-2 border-t border-[var(--line)] pt-4">

                          <ShieldCheck
                            size={13}
                            className="mt-0.5 shrink-0 text-[var(--earth)]"
                          />

                          <p className="font-mono text-[8px] leading-5 text-[var(--ink-soft)]">
                            Your transaction ID is used
                            to record your confirmation
                            of payment receipt. The citizen
                            approval does not itself start
                            government implementation.
                          </p>

                        </div>

                        {error && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: 5,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                            }}
                            className="mt-4 flex items-start gap-3 border border-[var(--earth)] bg-[var(--paper)] p-4"
                          >

                            <AlertTriangle
                              size={14}
                              className="mt-0.5 shrink-0 text-[var(--earth)]"
                            />

                            <p className="font-mono text-[9px] leading-5 text-[var(--earth-dark)]">
                              {error}
                            </p>

                          </motion.div>
                        )}

                      </motion.div>
                    )}

                    {/* =================================================
                        ACKNOWLEDGED
                    ================================================= */}

                    {citizenHasAcknowledged && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 8,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="mt-6 border border-[var(--line-dark)] bg-[var(--paper)] p-5"
                      >

                        <div className="flex items-start gap-3">

                          <CheckCircle2
                            size={16}
                            className="mt-0.5 shrink-0 text-[var(--earth)]"
                          />

                          <div className="flex-1">

                            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--earth)]">
                              Implementation Approved
                            </p>

                            <p className="mt-2 font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                              Your receipt of compensation
                              and approval to proceed with
                              implementation have been
                              recorded in the DHARA system.
                            </p>

                            {record?.citizenTransactionId && (
                              <div className="mt-4 border-t border-[var(--line)] pt-4">

                                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                                  Transaction ID
                                </p>

                                <p className="mt-1 font-mono text-[10px] uppercase">
                                  {record.citizenTransactionId}
                                </p>

                              </div>
                            )}

                          </div>

                        </div>

                      </motion.div>
                    )}

                  </div>

                </div>
              )}

              {/* =================================================
                  IMPLEMENTATION STATUS
              ================================================= */}

              <div className="border-t border-[var(--line)] p-6 sm:p-8">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                      Implementation
                    </p>

                    <h2 className="mt-1 font-serif text-xl">
                      Possession / Implementation
                    </h2>

                    <p className="mt-2 max-w-xl font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                      Implementation is controlled
                      by the Government Implementation
                      Authority. Citizen approval confirms
                      payment receipt and readiness but does
                      not itself start implementation.
                    </p>

                  </div>

                  <div
                    className={`flex items-center gap-2 border px-4 py-3 ${
                      citizenHasAcknowledged
                        ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                        : "border-[var(--line-dark)]"
                    }`}
                  >

                    {citizenHasAcknowledged ? (
                      <CheckCircle2
                        size={13}
                        className="text-[var(--earth)]"
                      />
                    ) : (
                      <LockKeyhole
                        size={13}
                        className="text-[var(--earth)]"
                      />
                    )}

                    <span className="font-mono text-[9px] uppercase tracking-[0.12em]">
                      {getImplementationStatus(
                        record
                      )}
                    </span>

                  </div>

                </div>

              </div>

              {/* =================================================
                  IMPLEMENTATION GATE
              ================================================= */}

              <div className="border-t border-[var(--line)] bg-[var(--paper-deep)] p-6 sm:p-8">

                <p className="mb-5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                  Implementation Gate
                </p>

                <div className="grid gap-px border border-[var(--line)] bg-[var(--line)] sm:grid-cols-3">

                  <div className="bg-[var(--paper)] p-4">

                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      Compensation
                    </p>

                    <p className="mt-2 font-mono text-[9px] uppercase">
                      {compensationApproved
                        ? "Approved"
                        : "Pending"}
                    </p>

                  </div>

                  <div className="bg-[var(--paper)] p-4">

                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      Payment
                    </p>

                    <p className="mt-2 font-mono text-[9px] uppercase">
                      {paymentCompleted
                        ? "Paid"
                        : "Pending"}
                    </p>

                  </div>

                  <div className="bg-[var(--paper)] p-4">

                    <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      Citizen approval
                    </p>

                    <p className="mt-2 font-mono text-[9px] uppercase">
                      {citizenHasAcknowledged
                        ? "Approved"
                        : "Pending"}
                    </p>

                  </div>

                </div>

              </div>

              {/* =================================================
                  CITIZEN NOTICE
              ================================================= */}

              <div className="border-t border-[var(--line)] bg-[var(--paper-deep)] p-6 sm:p-8">

                <div className="flex items-start gap-4">

                  <FileText
                    size={16}
                    className="mt-0.5 shrink-0 text-[var(--earth)]"
                  />

                  <div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                      Citizen Notice
                    </p>

                    <p className="mt-2 font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                      Compensation approval and
                      payment are managed by authorized
                      government authorities. Citizen
                      confirmation records receipt of
                      compensation and approval to proceed.
                      Actual implementation is initiated
                      by the Government Implementation
                      Authority.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">

              <button
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 border border-[var(--line)] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.15em] transition hover:border-[var(--earth)] hover:text-[var(--earth)]"
              >
                <ArrowLeft size={13} />
                Search another DHARA ID
              </button>

              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-5 py-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--white)] transition hover:bg-[var(--earth)]"
              >
                Exit Citizen Portal
                <ArrowRight size={13} />
              </button>

            </div>

            {/* =================================================
                SECURITY NOTE
            ================================================= */}

            <div className="mt-6 flex items-start gap-3 border border-[var(--line)] bg-[var(--paper-deep)] p-5">

              <ShieldCheck
                size={14}
                className="mt-0.5 shrink-0 text-[var(--earth)]"
              />

              <p className="font-mono text-[8px] leading-5 text-[var(--ink-soft)]">
                Only the record associated with
                the entered DHARA ID is displayed
                after verification. Administrative
                decisions remain restricted to
                authorized government portals.
              </p>

            </div>

          </motion.section>
        )}

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[var(--line)]">

        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

          <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
            DHARA / Citizen Access
          </p>

          <p className="font-mono text-[8px] text-[var(--ink-soft)]">
            Read-only • Government managed
          </p>

        </div>

      </footer>

    </div>
  )
}

export default CitizenDashboard