import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  LandPlot,
  MapPin,
  ShieldCheck,
  Lock,
  Activity,
  Play,
  Trophy,
} from "lucide-react"
import { jsPDF } from "jspdf"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { addLedgerEvent } from "../blockchain/dharaLedger"

const STORAGE_KEY = "dhara-projects"

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
      "National-level monitoring and final central oversight of the project.",
  },
  {
    title: "Compensation",
    authority: "SLCO — Special Land Acquisition Officer",
    description:
      "The authorized SLCO reviews compensation, approves the amount and records payment against the project record.",
  },
  {
    title: "Possession / Implementation",
    authority: "Company / Project Authority",
    description:
      "The company carries out implementation only after compensation has been paid and the citizen has acknowledged receipt and approved implementation.",
  },
  {
    title: "Completed",
    authority: "DHARA",
    description:
      "DHARA formally closes the project after the company confirms implementation completion.",
  },
]

function getProjects() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    )

    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function saveProjects(projects) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(projects)
  )
}

function getLedger() {
  try {
    const stored = JSON.parse(
      localStorage.getItem("dhara-blockchain-ledger") || "[]"
    )

    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

function formatDate(value) {
  if (!value) return "Not recorded"

  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Not recorded"
  }
}

function shortHash(hash) {
  if (!hash) return "—"

  if (hash === "GENESIS") {
    return "GENESIS"
  }

  return `${hash.slice(0, 12)}…${hash.slice(-8)}`
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
    project?.compensationPaid === true ||
    project?.paymentStatus === "Paid"
  )
}

function hasCitizenAcknowledgement(project) {
  return (
    project?.citizenAcknowledgementStatus === "Acknowledged" ||
    project?.citizenAcknowledged === true
  )
}

function hasImplementationStarted(project) {
  return (
    project?.implementationStatus === "In Progress" ||
    project?.implementationStarted === true
  )
}

function hasImplementationCompleted(project) {
  return (
    project?.implementationStatus === "Completed" ||
    project?.projectCompleted === true
  )
}

function ProjectTracking() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [ledger, setLedger] = useState([])
  const [implementationRemarks, setImplementationRemarks] =
    useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [actionError, setActionError] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  /*
   * Load the CURRENT project record from shared localStorage.
   */
  useEffect(() => {
    const loadProject = () => {
      const projects = getProjects()

      const foundProject = projects.find(
        (item) => item.id === projectId
      )

      if (foundProject) {
        setProject(foundProject)
      } else {
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

      const projectLedger = getLedger().filter(
        (item) => item.projectId === projectId
      )

      setLedger(projectLedger)
    }

    loadProject()

    const handleStorageChange = (event) => {
      if (
        event.key === STORAGE_KEY ||
        event.key === "dhara-blockchain-ledger"
      ) {
        loadProject()
      }
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    )

    const refreshInterval = window.setInterval(
      loadProject,
      1000
    )

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      )

      window.clearInterval(refreshInterval)
    }
  }, [projectId])

  const needsRevision =
    project?.stage === "Company Revision" ||
    project?.status === "Field Verification Issue"

  /*
   * Resolve workflow stage.
   *
   * Completed projects are shown at the final DHARA stage.
   * Implementation projects remain at Possession / Implementation.
   */
  const currentStageIndex = Math.max(
    workflowStages.findIndex(
      (stage) => stage.title === project?.stage
    ),
    0
  )

  const compensationAmount =
    project?.compensationAmount ||
    project?.compensationEstimate ||
    project?.estimatedCompensation ||
    "₹42.6 Cr"

  const affectedParcels =
    project?.affectedParcels ||
    project?.parcels ||
    "—"

  const compensatedParcels =
    project?.compensatedParcels ||
    project?.parcelsCompensated ||
    0

  const paymentStatus =
    project?.paymentStatus ||
    (project?.compensationPaid
      ? "Paid"
      : "Pending")

  const compensationPaid =
    project?.compensationPaid === true ||
    project?.compensationPaymentStatus === "Paid" ||
    paymentStatus === "Paid"

  const compensationStatus =
    project?.compensationStatus ||
    (compensationPaid
      ? "Paid"
      : "Pending")

  const citizenAcknowledged =
    hasCitizenAcknowledgement(project)

  const implementationStarted =
    hasImplementationStarted(project)

  const implementationCompleted =
    hasImplementationCompleted(project)

  /*
   * Company can begin implementation only after:
   *
   * 1. Compensation is approved.
   * 2. Compensation is paid.
   * 3. Citizen acknowledges receipt.
   */
  const implementationUnlocked =
    hasCompensationApproval(project) &&
    hasCompensationPayment(project) &&
    citizenAcknowledged

  const implementationStatus =
    project?.implementationStatus ||
    (implementationCompleted
      ? "Completed"
      : implementationStarted
        ? "In Progress"
        : implementationUnlocked
          ? "Eligible"
          : "Locked")

  const implementationLocked =
    !implementationUnlocked &&
    !implementationStarted &&
    !implementationCompleted

  /*
   * COMPANY ACTION — START IMPLEMENTATION
   *
   * This does not create a blockchain event.
   *
   * The final audit event required by the DHARA workflow is:
   * IMPLEMENTATION COMPLETED.
   *
   * Starting implementation simply moves the shared project record
   * into the "In Progress" state so every portal sees the same state.
   */
  const handleStartImplementation = async () => {
    setActionError("")
    setActionMessage("")

    if (!project) {
      setActionError(
        "Project record could not be found."
      )
      return
    }

    const latestProjects = getProjects()

    const latestProject = latestProjects.find(
      (item) => item.id === project.id
    )

    if (!latestProject) {
      setActionError(
        "The current project record could not be found."
      )
      return
    }

    const latestCitizenAcknowledged =
      hasCitizenAcknowledgement(
        latestProject
      )

    const latestCompensationPaid =
      hasCompensationPayment(
        latestProject
      )

    const latestCompensationApproved =
      hasCompensationApproval(
        latestProject
      )

    if (
      !latestCompensationApproved ||
      !latestCompensationPaid ||
      !latestCitizenAcknowledged
    ) {
      setActionError(
        "Implementation is locked. Compensation must be approved and paid, and the citizen must acknowledge receipt before implementation can begin."
      )
      return
    }

    if (
      latestProject.implementationStatus ===
        "In Progress" ||
      latestProject.implementationStarted === true
    ) {
      setActionMessage(
        "Implementation is already in progress."
      )
      return
    }

    if (
      latestProject.implementationStatus ===
        "Completed" ||
      latestProject.projectCompleted === true
    ) {
      setActionMessage(
        "Implementation has already been completed."
      )
      return
    }

    setActionLoading(true)

    try {
      const startedAt =
        new Date().toISOString()

      const updatedProject = {
        ...latestProject,
        stage: "Possession / Implementation",
        status: "Implementation In Progress",
        authority:
          "Company / Project Authority",
        nextAction:
          "Implementation Completion",
        implementationStatus:
          "In Progress",
        implementationEligible:
          false,
        implementationStarted:
          true,
        implementationStartedAt:
          startedAt,
        implementationRemarks:
          implementationRemarks.trim(),
        companyImplementationStatus:
          "In Progress",
      }

      const updatedProjects =
        latestProjects.map(
          (item) =>
            item.id === project.id
              ? updatedProject
              : item
        )

      saveProjects(updatedProjects)

      setProject(updatedProject)
      setActionMessage(
        "Implementation has started. The project is now marked as In Progress."
      )
      setImplementationRemarks("")
    } catch {
      setActionError(
        "Unable to start implementation. Please try again."
      )
    } finally {
      setActionLoading(false)
    }
  }

  /*
   * COMPANY ACTION — IMPLEMENTATION COMPLETED
   *
   * This is the Company's final implementation action.
   *
   * It records:
   * Block #10 — IMPLEMENTATION COMPLETED
   *
   * Then DHARA immediately closes the project and records:
   * Block #11 — PROJECT COMPLETED
   */
  const handleCompleteImplementation =
    async () => {
      setActionError("")
      setActionMessage("")

      if (!project) {
        setActionError(
          "Project record could not be found."
        )
        return
      }

      const latestProjects = getProjects()

      const latestProject =
        latestProjects.find(
          (item) => item.id === project.id
        )

      if (!latestProject) {
        setActionError(
          "The current project record could not be found."
        )
        return
      }

      const latestStarted =
        hasImplementationStarted(
          latestProject
        )

      const latestCitizenAcknowledged =
        hasCitizenAcknowledgement(
          latestProject
        )

      const latestCompensationPaid =
        hasCompensationPayment(
          latestProject
        )

      if (
        !latestCompensationPaid ||
        !latestCitizenAcknowledged ||
        !latestStarted
      ) {
        setActionError(
          "Implementation cannot be completed until compensation is paid, citizen acknowledgement is recorded, and implementation has started."
        )
        return
      }

      if (
        latestProject.implementationStatus ===
          "Completed" ||
        latestProject.projectCompleted === true
      ) {
        setActionMessage(
          "This project has already been completed."
        )
        return
      }

      setActionLoading(true)

      try {
        const completedAt =
          new Date().toISOString()

        /*
         * BLOCK #10
         *
         * Company confirms that physical implementation
         * has been completed.
         */
        await addLedgerEvent({
          projectId:
            latestProject.id,
          event:
            "IMPLEMENTATION COMPLETED",
          authority:
            "Company / Project Authority",
          details: {
            projectName:
              latestProject.projectName ||
              latestProject.name ||
              "—",
            state:
              latestProject.state ||
              "—",
            district:
              latestProject.district ||
              "—",
            decision:
              "Implementation Completed",
            remarks:
              implementationRemarks.trim(),
            implementationStatus:
              "Completed",
            completedAt,
            nextStage:
              "Project Completed",
          },
        })

        /*
         * BLOCK #11
         *
         * DHARA formally closes the project lifecycle
         * after Company implementation completion.
         */
        await addLedgerEvent({
          projectId:
            latestProject.id,
          event:
            "PROJECT COMPLETED",
          authority:
            "DHARA",
          details: {
            projectName:
              latestProject.projectName ||
              latestProject.name ||
              "—",
            state:
              latestProject.state ||
              "—",
            district:
              latestProject.district ||
              "—",
            decision:
              "Project Completed",
            implementationStatus:
              "Completed",
            projectStatus:
              "Completed",
            completedAt,
          },
        })

        /*
         * Update shared project record only AFTER both
         * blockchain events have been recorded.
         */
        const updatedProject = {
          ...latestProject,
          stage: "Completed",
          status: "Project Completed",
          authority: "DHARA",
          nextAction: "Completed",

          implementationStatus:
            "Completed",

          implementationEligible:
            false,

          implementationStarted:
            true,

          implementationStartedAt:
            latestProject.implementationStartedAt ||
            completedAt,

          implementationCompleted:
            true,

          implementationCompletedAt:
            completedAt,

          projectCompleted:
            true,

          projectCompletedAt:
            completedAt,

          implementationRemarks:
            implementationRemarks.trim(),

          completionRemarks:
            implementationRemarks.trim(),

          companyImplementationStatus:
            "Completed",

          companyNotification: {
            type:
              "PROJECT_COMPLETED",
            message:
              "Company has confirmed implementation completion. DHARA has formally closed the project lifecycle.",
            createdAt:
              completedAt,
          },

          companyNotificationStatus:
            "Read",
        }

        const updatedProjects =
          latestProjects.map(
            (item) =>
              item.id === project.id
                ? updatedProject
                : item
          )

        saveProjects(updatedProjects)

        setProject(updatedProject)

        /*
         * Refresh the local ledger immediately.
         */
        const refreshedLedger =
          getLedger().filter(
            (item) =>
              item.projectId ===
              project.id
          )

        setLedger(
          refreshedLedger
        )

        setImplementationRemarks("")

        setActionMessage(
          "Implementation completed. DHARA has now formally marked the project as Completed."
        )
      } catch {
        setActionError(
          "The completion action could not be recorded. Please verify the ledger and try again."
        )
      } finally {
        setActionLoading(false)
      }
    }

  const latestLedgerEvent =
    ledger.length > 0
      ? ledger[ledger.length - 1]
      : null

  const activityEvents = useMemo(() => {
    return [...ledger].reverse()
  }, [ledger])

  const downloadPDF = () => {
    if (!project) return

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth =
      pdf.internal.pageSize.getWidth()

    const pageHeight =
      pdf.internal.pageSize.getHeight()

    const margin = 18
    let y = 20

    const ink = [23, 23, 20]
    const soft = [93, 90, 82]
    const earth = [182, 95, 60]
    const line = [207, 200, 185]
    const paper = [243, 239, 230]

    const projectName =
      project.projectName ||
      project.name ||
      "Untitled project"

    const projectType =
      project.projectType ||
      "Not specified"

    const state =
      project.state ||
      "Not specified"

    const district =
      project.district ||
      project.location ||
      "Not specified"

    const landArea =
      project.landArea ||
      project.land ||
      "Not specified"

    const parcels =
      project.parcels ||
      "Not specified"

    const purpose =
      project.purpose ||
      "Not specified"

    const description =
      project.description ||
      "No description provided."

    const addHeader = () => {
      pdf.setFillColor(...ink)
      pdf.rect(
        0,
        0,
        pageWidth,
        10,
        "F"
      )

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(7)

      pdf.setTextColor(
        255,
        255,
        255
      )

      pdf.text(
        "DHARA / DIGITAL LAND RECORD",
        margin,
        6.5
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.text(
        "PROJECT RECORD",
        pageWidth - margin,
        6.5,
        {
          align: "right",
        }
      )
    }

    const addFooter = () => {
      pdf.setDrawColor(...line)

      pdf.line(
        margin,
        pageHeight - 14,
        pageWidth - margin,
        pageHeight - 14
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(6.5)

      pdf.setTextColor(...soft)

      pdf.text(
        `DHARA Reference: ${
          project.id || "—"
        }`,
        margin,
        pageHeight - 8
      )

      pdf.text(
        "Generated from DHARA project record",
        pageWidth - margin,
        pageHeight - 8,
        {
          align: "right",
        }
      )
    }

    const ensureSpace = (
      required = 20
    ) => {
      if (
        y + required >
        pageHeight - 22
      ) {
        addFooter()
        pdf.addPage()
        addHeader()
        y = 18
      }
    }

    const sectionTitle = (
      title
    ) => {
      ensureSpace(15)

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(8)

      pdf.setTextColor(...earth)

      pdf.text(
        title.toUpperCase(),
        margin,
        y
      )

      y += 5

      pdf.setDrawColor(...line)

      pdf.line(
        margin,
        y,
        pageWidth - margin,
        y
      )

      y += 7
    }

    const field = (
      label,
      value,
      width = 82
    ) => {
      ensureSpace(15)

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(6.5)

      pdf.setTextColor(...soft)

      pdf.text(
        label.toUpperCase(),
        margin,
        y
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(9)

      pdf.setTextColor(...ink)

      const lines =
        pdf.splitTextToSize(
          String(value || "—"),
          width
        )

      pdf.text(
        lines,
        margin,
        y + 5
      )

      y += Math.max(
        11,
        lines.length *
          4.5 +
          7
      )
    }

    const addTwoColumnFields = (
      left,
      right
    ) => {
      ensureSpace(22)

      const leftX = margin
      const rightX =
        pageWidth / 2 + 2

      const width =
        pageWidth / 2 -
        margin -
        5

      const startY = y

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(6.5)

      pdf.setTextColor(...soft)

      pdf.text(
        left[0].toUpperCase(),
        leftX,
        y
      )

      pdf.text(
        right[0].toUpperCase(),
        rightX,
        y
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(9)

      pdf.setTextColor(...ink)

      const leftLines =
        pdf.splitTextToSize(
          String(left[1] || "—"),
          width
        )

      const rightLines =
        pdf.splitTextToSize(
          String(right[1] || "—"),
          width
        )

      pdf.text(
        leftLines,
        leftX,
        y + 5
      )

      pdf.text(
        rightLines,
        rightX,
        y + 5
      )

      y =
        startY +
        Math.max(
          leftLines.length,
          rightLines.length
        ) *
          4.5 +
        10
    }

    addHeader()

    y = 20

    pdf.setFont(
      "helvetica",
      "bold"
    )

    pdf.setFontSize(7)

    pdf.setTextColor(...earth)

    pdf.text(
      "DHARA PROJECT RECORD",
      margin,
      y
    )

    y += 8

    pdf.setFont(
      "times",
      "bold"
    )

    pdf.setFontSize(23)

    pdf.setTextColor(...ink)

    const titleLines =
      pdf.splitTextToSize(
        projectName,
        pageWidth -
          margin * 2
      )

    pdf.text(
      titleLines,
      margin,
      y
    )

    y +=
      titleLines.length *
        9 +
      5

    pdf.setFillColor(...paper)

    pdf.rect(
      margin,
      y,
      pageWidth -
        margin * 2,
      18,
      "F"
    )

    pdf.setFont(
      "helvetica",
      "bold"
    )

    pdf.setFontSize(6.5)

    pdf.setTextColor(...soft)

    pdf.text(
      "DHARA REFERENCE",
      margin + 5,
      y + 6
    )

    pdf.setFont(
      "helvetica",
      "bold"
    )

    pdf.setFontSize(10)

    pdf.setTextColor(...ink)

    pdf.text(
      project.id || "—",
      margin + 5,
      y + 12
    )

    pdf.setFont(
      "helvetica",
      "bold"
    )

    pdf.setFontSize(6.5)

    pdf.setTextColor(...soft)

    pdf.text(
      "CURRENT STATUS",
      pageWidth / 2 + 2,
      y + 6
    )

    pdf.setFont(
      "helvetica",
      "bold"
    )

    pdf.setFontSize(9)

    pdf.setTextColor(...earth)

    pdf.text(
      project.status ||
        "Pending",
      pageWidth / 2 + 2,
      y + 12
    )

    y += 27

    sectionTitle(
      "Project information"
    )

    addTwoColumnFields(
      [
        "Project type",
        projectType,
      ],
      [
        "State",
        state,
      ]
    )

    addTwoColumnFields(
      [
        "District",
        district,
      ],
      [
        "Land area",
        `${landArea}${
          project.landArea
            ? " acres"
            : ""
        }`,
      ]
    )

    addTwoColumnFields(
      [
        "Number of parcels",
        parcels,
      ],
      [
        "Current authority",
        project.authority ||
          "DHARA",
      ]
    )

    field(
      "Purpose",
      purpose
    )

    field(
      "Description",
      description,
      pageWidth -
        margin * 2
    )

    sectionTitle(
      "Land requirement"
    )

    addTwoColumnFields(
      [
        "Required land",
        `${landArea}${
          project.landArea
            ? " acres"
            : ""
        }`,
      ],
      [
        "Affected parcels",
        affectedParcels,
      ]
    )

    if (project.applicant) {
      field(
        "Project authority / applicant",
        project.applicant
      )
    }

    sectionTitle(
      "Administrative progress"
    )

    workflowStages.forEach(
      (stage, index) => {
        ensureSpace(16)

        const completed =
          index <
          currentStageIndex

        const current =
          index ===
          currentStageIndex

        pdf.setFont(
          "helvetica",
          "bold"
        )

        pdf.setFontSize(8)

        if (completed) {
          pdf.setTextColor(
            ...ink
          )
        } else if (current) {
          pdf.setTextColor(
            ...earth
          )
        } else {
          pdf.setTextColor(
            ...soft
          )
        }

        pdf.text(
          `${String(
            index + 1
          ).padStart(
            2,
            "0"
          )}  ${
            stage.title
          }`,
          margin,
          y
        )

        pdf.setFont(
          "helvetica",
          "normal"
        )

        pdf.setFontSize(6.5)

        pdf.setTextColor(
          ...soft
        )

        pdf.text(
          stage.authority,
          pageWidth -
            margin,
          y,
          {
            align: "right",
          }
        )

        y += 5

        pdf.setFontSize(6.5)

        const statusText =
          completed
            ? "COMPLETED"
            : current
              ? "CURRENT STAGE"
              : "UPCOMING"

        pdf.text(
          statusText,
          margin + 10,
          y
        )

        y += 7
      }
    )

    sectionTitle(
      "Compensation & implementation"
    )

    addTwoColumnFields(
      [
        "Estimated compensation",
        compensationAmount,
      ],
      [
        "Affected parcels",
        affectedParcels,
      ]
    )

    addTwoColumnFields(
      [
        "Parcels compensated",
        `${compensatedParcels} / ${affectedParcels}`,
      ],
      [
        "Compensation status",
        compensationStatus,
      ]
    )

    addTwoColumnFields(
      [
        "Payment status",
        paymentStatus,
      ],
      [
        "Citizen acknowledgement",
        citizenAcknowledged
          ? "Acknowledged"
          : "Pending",
      ]
    )

    addTwoColumnFields(
      [
        "Implementation status",
        implementationStatus,
      ],
      [
        "Implementation eligibility",
        implementationUnlocked
          ? "Eligible"
          : implementationCompleted
            ? "Completed"
            : "Locked",
      ]
    )

    if (implementationLocked) {
      ensureSpace(25)

      pdf.setFillColor(...paper)

      pdf.rect(
        margin,
        y,
        pageWidth -
          margin * 2,
        20,
        "F"
      )

      pdf.setFont(
        "helvetica",
        "bold"
      )

      pdf.setFontSize(7)

      pdf.setTextColor(...earth)

      pdf.text(
        "IMPLEMENTATION LOCKED",
        margin + 5,
        y + 6
      )

      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(7)

      pdf.setTextColor(...soft)

      pdf.text(
        "Implementation requires compensation payment",
        margin + 5,
        y + 11
      )

      pdf.text(
        "and citizen acknowledgement.",
        margin + 5,
        y + 15
      )

      y += 27
    }

    sectionTitle(
      "Verified administrative activity"
    )

    if (
      activityEvents.length ===
      0
    ) {
      pdf.setFont(
        "helvetica",
        "normal"
      )

      pdf.setFontSize(8)

      pdf.setTextColor(...soft)

      pdf.text(
        "No blockchain audit events recorded for this project.",
        margin,
        y
      )

      y += 10
    } else {
      activityEvents.forEach(
        (event) => {
          ensureSpace(27)

          pdf.setFont(
            "helvetica",
            "bold"
          )

          pdf.setFontSize(7.5)

          pdf.setTextColor(...ink)

          pdf.text(
            `BLOCK #${
              event.index ||
              "—"
            }  ${
              event.event ||
              "EVENT"
            }`,
            margin,
            y
          )

          y += 5

          pdf.setFont(
            "helvetica",
            "normal"
          )

          pdf.setFontSize(6.5)

          pdf.setTextColor(...soft)

          pdf.text(
            `${
              event.authority ||
              "—"
            }  ·  ${formatDate(
              event.timestamp
            )}`,
            margin,
            y
          )

          y += 5

          pdf.text(
            `Hash: ${shortHash(
              event.hash
            )}`,
            margin,
            y
          )

          y += 8
        }
      )
    }

    sectionTitle(
      "Record statement"
    )

    pdf.setFont(
      "helvetica",
      "normal"
    )

    pdf.setFontSize(7.5)

    pdf.setTextColor(...soft)

    const statement =
      "This document is generated from the DHARA project record. " +
      "Project progress is controlled by the responsible authority at each administrative stage. " +
      "The company can view and track the government workflow but cannot perform government actions. " +
      "Compensation is processed by the SLCO / Special Land Acquisition Officer. " +
      "After compensation is paid and citizen acknowledgement is recorded, the company carries out implementation. " +
      "DHARA formally closes the project after the company confirms implementation completion."

    const statementLines =
      pdf.splitTextToSize(
        statement,
        pageWidth -
          margin * 2
      )

    pdf.text(
      statementLines,
      margin,
      y
    )

    y +=
      statementLines.length *
        4 +
      8

    pdf.setFont(
      "helvetica",
      "bold"
    )

    pdf.setFontSize(7)

    pdf.setTextColor(...ink)

    pdf.text(
      `Generated: ${formatDate(
        new Date().toISOString()
      )}`,
      margin,
      y
    )

    addFooter()

    const safeName =
      projectName
        .replace(
          /[^a-z0-9]+/gi,
          "-"
        )
        .replace(
          /^-+|-+$/g,
          ""
        )
        .toLowerCase()

    pdf.save(
      `DHARA-${
        safeName ||
        "project-record"
      }-${
        project.id ||
        "record"
      }.pdf`
    )
  }

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
              The project may not have been submitted
              from this browser, or its local prototype
              record may no longer exist.
            </p>

            <button
              onClick={() =>
                navigate(
                  "/portal/company"
                )
              }
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

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* HEADER */}

      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <button
            onClick={() =>
              navigate(
                "/portal/company"
              )
            }
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

                      {project.district &&
                      project.state
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

                      {project.parcels ||
                        "—"}{" "}
                      parcels
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* STATUS */}

            <div className="border-t border-[var(--line)] p-6 sm:p-8 lg:w-80 lg:border-l lg:border-t-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                Current status
              </p>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[var(--earth)]" />

                <span className="font-mono text-xs uppercase tracking-[0.14em]">
                  {project.status ||
                    "Pending"}
                </span>
              </div>

              <div className="mt-7 border-t border-[var(--line)] pt-5">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  With
                </p>

                <p className="mt-2 text-sm">
                  {project.authority ||
                    "DHARA"}
                </p>
              </div>

              <button
                onClick={downloadPDF}
                className="mt-7 flex w-full items-center justify-center gap-2 border border-[var(--ink)] px-4 py-3 font-mono text-[9px] uppercase tracking-[0.16em] transition hover:bg-[var(--ink)] hover:text-[var(--white)]"
              >
                <Download size={14} />
                Download DHARA Record PDF
              </button>
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
                    The Field Officer identified an
                    issue with the project during
                    verification. Review the findings
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

        {/* QUICK PROJECT SUMMARY */}

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "DHARA reference",
              value:
                project.id || "—",
            },
            {
              label: "Project stage",
              value:
                project.stage ||
                "Pending",
            },
            {
              label: "Compensation",
              value:
                compensationStatus,
            },
            {
              label: "Implementation",
              value:
                implementationStatus,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-[var(--line)] bg-[var(--white)] p-5"
            >
              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                {item.label}
              </p>

              <p className="mt-3 font-serif text-lg">
                {item.value}
              </p>
            </div>
          ))}
        </section>

        {/* TIMELINE */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
              DHARA workflow
            </p>

            <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
              Where your project stands
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              DHARA connects the project proposal with
              the administrative workflow. Each stage is
              handled by the authority responsible for
              that part of the process.
            </p>
          </div>

          <div className="border border-[var(--line)] bg-[var(--white)]">
            {workflowStages.map(
              (stage, index) => {
                const isCompleted =
                  index <
                  currentStageIndex

                const isCurrent =
                  index ===
                  currentStageIndex

                const isUpcoming =
                  index >
                  currentStageIndex

                const compensationCurrent =
                  stage.title ===
                    "Compensation" &&
                  isCurrent

                const implementationCurrent =
                  stage.title ===
                    "Possession / Implementation" &&
                  isCurrent

                let currentDescription =
                  stage.description

                if (
                  compensationCurrent
                ) {
                  if (
                    compensationPaid
                  ) {
                    currentDescription =
                      "Compensation has been recorded as paid by the SLCO / authorized payment authority."
                  } else {
                    currentDescription =
                      "Compensation is currently being processed by the SLCO / Special Land Acquisition Officer."
                  }
                }

                if (
                  implementationCurrent
                ) {
                  if (
                    implementationCompleted
                  ) {
                    currentDescription =
                      "The company has completed implementation. DHARA is closing the project record."
                  } else if (
                    implementationStarted
                  ) {
                    currentDescription =
                      "The company is currently carrying out project implementation."
                  } else if (
                    implementationUnlocked
                  ) {
                    currentDescription =
                      "Compensation has been paid and the citizen has acknowledged receipt. The company may now begin implementation."
                  } else {
                    currentDescription =
                      "Implementation remains locked until compensation is paid and citizen acknowledgement is recorded."
                  }
                }

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
                      delay:
                        index *
                        0.06,
                    }}
                    className={`relative grid gap-4 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[72px_1fr_auto] sm:items-center sm:p-6 ${
                      isCurrent
                        ? "bg-[var(--paper)]"
                        : ""
                    }`}
                  >
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
                            {String(
                              index + 1
                            ).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        )}
                      </div>

                      {isCurrent && (
                        <span className="ml-2 font-mono text-[8px] uppercase tracking-[0.14em] text-[var(--earth)] sm:hidden">
                          Current
                        </span>
                      )}
                    </div>

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
                        {currentDescription}
                      </p>

                      {compensationCurrent && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] ${
                              compensationPaid
                                ? "border-[var(--ink)] text-[var(--ink)]"
                                : "border-[var(--line)] text-[var(--ink-soft)]"
                            }`}
                          >
                            Payment:{" "}
                            {
                              paymentStatus
                            }
                          </span>

                          <span
                            className={`border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] ${
                              citizenAcknowledged
                                ? "border-[var(--ink)] text-[var(--ink)]"
                                : "border-[var(--line)] text-[var(--ink-soft)]"
                            }`}
                          >
                            Citizen:{" "}
                            {citizenAcknowledged
                              ? "Acknowledged"
                              : "Pending"}
                          </span>
                        </div>
                      )}

                      {implementationCurrent && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            className={`border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] ${
                              implementationCompleted
                                ? "border-[var(--ink)] text-[var(--ink)]"
                                : implementationStarted
                                  ? "border-[var(--earth)] text-[var(--earth)]"
                                  : implementationUnlocked
                                    ? "border-[var(--earth)] text-[var(--earth)]"
                                    : "border-[var(--line)] text-[var(--ink-soft)]"
                            }`}
                          >
                            {implementationStatus}
                          </span>

                          <span
                            className={`border px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.13em] ${
                              citizenAcknowledged
                                ? "border-[var(--ink)] text-[var(--ink)]"
                                : "border-[var(--line)] text-[var(--ink-soft)]"
                            }`}
                          >
                            Citizen:{" "}
                            {citizenAcknowledged
                              ? "Acknowledged"
                              : "Pending"}
                          </span>
                        </div>
                      )}
                    </div>

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

                      {isCurrent &&
                        !implementationCompleted && (
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

                      {isCurrent &&
                        implementationCompleted && (
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

                      {isUpcoming && (
                        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </motion.div>
                )
              }
            )}
          </div>
        </section>

        {/* COMPENSATION */}

        <section className="mt-10 border border-[var(--line)] bg-[var(--white)]">
          <div className="border-b border-[var(--line)] p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                  Government managed
                </p>

                <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                  Compensation status
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                  Compensation is processed by the
                  SLCO / Special Land Acquisition Officer.
                  The company can view the current
                  status but cannot modify compensation
                  records.
                </p>
              </div>

              <div className="hidden h-10 w-10 items-center justify-center border border-[var(--line)] sm:flex">
                <LandPlot
                  size={18}
                  strokeWidth={1.5}
                />
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[var(--white)] p-6">
              <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                Estimated compensation
              </p>

              <p className="mt-3 font-serif text-2xl">
                {compensationAmount}
              </p>
            </div>

            <div className="bg-[var(--white)] p-6">
              <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                Affected parcels
              </p>

              <p className="mt-3 font-serif text-2xl">
                {affectedParcels}
              </p>
            </div>

            <div className="bg-[var(--white)] p-6">
              <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                Parcels compensated
              </p>

              <p className="mt-3 font-serif text-2xl">
                {compensatedParcels} /{" "}
                {affectedParcels}
              </p>
            </div>

            <div className="bg-[var(--white)] p-6">
              <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                Compensation status
              </p>

              <div className="mt-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--earth)]" />

                <span className="font-mono text-sm uppercase tracking-[0.1em]">
                  {compensationStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-[var(--line)] p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                  Payment status
                </p>

                <p className="mt-2 text-sm">
                  {paymentStatus}
                </p>
              </div>

              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                  Compensation paid
                </p>

                <p className="mt-2 text-sm">
                  {compensationPaid
                    ? "Yes"
                    : "Pending"}
                </p>
              </div>

              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                  Citizen acknowledgement
                </p>

                <p className="mt-2 text-sm">
                  {citizenAcknowledged
                    ? "Acknowledged"
                    : "Pending"}
                </p>
              </div>

              <div>
                <p className="font-mono text-[8px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                  Last compensation action
                </p>

                <p className="mt-2 text-sm">
                  {project.compensationPaidAt
                    ? formatDate(
                        project.compensationPaidAt
                      )
                    : project.compensationApprovedAt
                      ? formatDate(
                          project.compensationApprovedAt
                        )
                      : "Not yet recorded"}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPANY IMPLEMENTATION CONTROL */}

        <section className="mt-6 border border-[var(--line)] bg-[var(--white)]">
          <div className="border-b border-[var(--line)] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--line)]">
                {implementationCompleted ? (
                  <Trophy
                    size={19}
                    strokeWidth={1.5}
                  />
                ) : implementationStarted ? (
                  <Activity
                    size={19}
                    strokeWidth={1.5}
                  />
                ) : implementationUnlocked ? (
                  <Play
                    size={19}
                    strokeWidth={1.5}
                  />
                ) : (
                  <Lock
                    size={18}
                    strokeWidth={1.5}
                  />
                )}
              </div>

              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                  Company implementation
                </p>

                <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                  {implementationCompleted
                    ? "Implementation completed"
                    : implementationStarted
                      ? "Implementation is in progress"
                      : implementationUnlocked
                        ? "Implementation is ready to begin"
                        : "Implementation is locked"}
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
                  {implementationCompleted
                    ? "The company has confirmed that implementation is complete. DHARA has formally closed the project."
                    : implementationStarted
                      ? "The company is currently carrying out implementation. When the work is complete, the company can confirm completion below."
                      : implementationUnlocked
                        ? "Compensation has been paid and the citizen has acknowledged receipt. The company is now authorized to carry out implementation."
                        : "The company cannot begin implementation until compensation has been paid and the citizen has acknowledged receipt and approved implementation."}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* GATE STATUS */}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-[var(--line)] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Compensation
                </p>

                <p className="mt-2 text-sm">
                  {compensationPaid
                    ? "Paid"
                    : "Pending"}
                </p>
              </div>

              <div className="border border-[var(--line)] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Citizen
                </p>

                <p className="mt-2 text-sm">
                  {citizenAcknowledged
                    ? "Acknowledged"
                    : "Pending"}
                </p>
              </div>

              <div className="border border-[var(--line)] p-4">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  Implementation
                </p>

                <p className="mt-2 text-sm">
                  {implementationStatus}
                </p>
              </div>
            </div>

            {/* REMARKS */}

            {!implementationCompleted && (
              <div className="mt-6">
                <label className="font-mono text-[9px] uppercase tracking-[0.17em] text-[var(--ink-soft)]">
                  Company implementation remarks
                </label>

                <textarea
                  value={
                    implementationRemarks
                  }
                  onChange={(event) =>
                    setImplementationRemarks(
                      event.target.value
                    )
                  }
                  rows={4}
                  placeholder={
                    implementationStarted
                      ? "Add completion remarks before confirming implementation completion..."
                      : "Optional: add remarks before starting implementation..."
                  }
                  className="mt-3 w-full resize-none border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[var(--earth)]"
                />
              </div>
            )}

            {/* ACTION MESSAGE */}

            {actionMessage && (
              <div className="mt-5 flex items-start gap-3 border border-[var(--ink)] bg-[var(--paper)] p-4">
                <CheckCircle2
                  size={17}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-sm leading-6">
                  {actionMessage}
                </p>
              </div>
            )}

            {actionError && (
              <div className="mt-5 flex items-start gap-3 border border-[var(--earth)] bg-[var(--paper)] p-4">
                <AlertTriangle
                  size={17}
                  strokeWidth={1.5}
                  className="mt-0.5 shrink-0 text-[var(--earth)]"
                />

                <p className="text-sm leading-6 text-[var(--earth-dark)]">
                  {actionError}
                </p>
              </div>
            )}

            {/* COMPANY ACTIONS */}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {!implementationStarted &&
                !implementationCompleted && (
                  <button
                    onClick={
                      handleStartImplementation
                    }
                    disabled={
                      !implementationUnlocked ||
                      actionLoading
                    }
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                      implementationUnlocked &&
                      !actionLoading
                        ? "bg-[var(--ink)] text-[var(--white)] hover:bg-[var(--earth)]"
                        : "cursor-not-allowed bg-[var(--paper-deep)] text-[var(--ink-soft)]"
                    }`}
                  >
                    <Play size={14} />
                    {actionLoading
                      ? "Processing..."
                      : "Start Implementation"}
                  </button>
                )}

              {implementationStarted &&
                !implementationCompleted && (
                  <button
                    onClick={
                      handleCompleteImplementation
                    }
                    disabled={
                      actionLoading
                    }
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] transition ${
                      actionLoading
                        ? "cursor-not-allowed bg-[var(--paper-deep)] text-[var(--ink-soft)]"
                        : "bg-[var(--earth)] text-[var(--white)] hover:bg-[var(--earth-dark)]"
                    }`}
                  >
                    <CheckCircle2
                      size={14}
                    />
                    {actionLoading
                      ? "Recording..."
                      : "Implementation Completed"}
                  </button>
                )}

              {implementationCompleted && (
                <div className="inline-flex items-center justify-center gap-2 border border-[var(--ink)] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink)]">
                  <Trophy
                    size={14}
                  />
                  Project Completed
                </div>
              )}
            </div>

            {!implementationUnlocked &&
              !implementationStarted &&
              !implementationCompleted && (
                <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  Locked until compensation is paid and citizen acknowledgement is recorded.
                </p>
              )}

            {implementationStarted &&
              !implementationCompleted && (
                <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                  When implementation work is finished, the company must confirm completion to close the DHARA project lifecycle.
                </p>
              )}

            {implementationCompleted && (
              <p className="mt-4 font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Company implementation completion recorded. DHARA has formally closed this project.
              </p>
            )}
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

        {/* GOVERNMENT ACTIVITY */}

        <section className="mt-10">
          <div className="mb-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
              Verified activity
            </p>

            <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
              Project action history
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-soft)]">
              A chronological view of recorded administrative,
              citizen and company actions associated with
              this project.
            </p>
          </div>

          <div className="border border-[var(--line)] bg-[var(--white)]">
            {activityEvents.length ===
            0 ? (
              <div className="p-8 text-center">
                <Activity
                  size={20}
                  strokeWidth={1.5}
                  className="mx-auto text-[var(--ink-soft)]"
                />

                <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                  No verified activity recorded
                </p>
              </div>
            ) : (
              activityEvents.map(
                (event, index) => (
                  <div
                    key={`${event.index}-${event.hash}`}
                    className="grid gap-5 border-b border-[var(--line)] p-5 last:border-b-0 sm:grid-cols-[80px_1fr_auto] sm:items-start sm:p-6"
                  >
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        Block
                      </p>

                      <p className="mt-1 font-mono text-lg">
                        #{event.index}
                      </p>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-serif text-lg">
                          {event.event}
                        </h3>

                        {index === 0 && (
                          <span className="border border-[var(--earth)] px-2 py-1 font-mono text-[7px] uppercase tracking-[0.12em] text-[var(--earth)]">
                            Latest
                          </span>
                        )}
                      </div>

                      <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.13em] text-[var(--ink-soft)]">
                        {event.authority}
                      </p>

                      <p className="mt-2 text-xs text-[var(--ink-soft)]">
                        {formatDate(
                          event.timestamp
                        )}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="font-mono text-[7px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                        Hash
                      </p>

                      <p className="mt-1 max-w-[170px] break-all font-mono text-[8px] text-[var(--ink-soft)] sm:ml-auto">
                        {shortHash(
                          event.hash
                        )}
                      </p>
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {latestLedgerEvent && (
            <div className="mt-4 flex items-center gap-3 border border-[var(--line)] bg-[var(--paper)] p-4">
              <ShieldCheck
                size={16}
                strokeWidth={1.5}
              />

              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                Latest recorded action:{" "}
                <span className="text-[var(--ink)]">
                  {
                    latestLedgerEvent.event
                  }
                </span>
              </p>
            </div>
          )}
        </section>

        {/* PROPOSAL INFORMATION */}

        <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
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
              Company access
            </p>

            <h3 className="mt-4 font-serif text-xl">
              Your implementation begins only after the citizen gate.
            </h3>

            <p className="mt-4 text-sm leading-6 text-[#c7c2b8]">
              The company cannot perform government
              scrutiny or compensation actions. After
              compensation is paid and the citizen
              acknowledges receipt, the company is
              responsible for carrying out implementation.
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
                  VIEW + IMPLEMENT
                </p>
              </div>
            </div>
          </aside>
        </section>

        {/* BOTTOM ACTIONS */}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={downloadPDF}
            className="inline-flex items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--white)] transition hover:bg-[var(--earth)]"
          >
            <Download size={14} />
            Download DHARA Record PDF
          </button>

          <button
            onClick={() =>
              navigate(
                "/portal/company"
              )
            }
            className="inline-flex items-center justify-center gap-2 border border-[var(--ink)] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--white)]"
          >
            <ArrowLeft size={14} />
            Back to company portal
          </button>

          <button
            onClick={() =>
              navigate(
                "/portal/blockchain"
              )
            }
            className="inline-flex items-center justify-center gap-2 border border-[var(--line)] px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-soft)] transition hover:border-[var(--ink)] hover:text-[var(--ink)]"
          >
            Verified history
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </main>
  )
}

export default ProjectTracking