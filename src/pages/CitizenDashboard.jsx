import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  LockKeyhole,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const STORAGE_KEY = "dhara-projects"
const ACCESS_STORAGE_KEY = "dhara-citizen-access"

const fallbackProjects = [
  {
    id: "WB-2048",
    projectName: "Eastern Freight Corridor",
    projectType: "Transport Infrastructure",
    state: "West Bengal",
    district: "Kolkata",
    landArea: "248 acres",
    citizenLandArea: "1.8 acres",
    parcels: "42",
    stage: "Compensation",
    status: "Compensation Processing",
    authority: "Government Administration",
    nextAction: "Compensation Clearance",
    compensationStatus: "Processing",
    paymentStatus: "Payment Pending",
    implementationStatus: "Implementation Locked",
    parcelStatus: "Affected",
    surveyNumber: "WB-KOL-2048-17",
    landHolder: "Citizen Record",
    compensationAmount: "₹8,40,000",
    compensationUpdatedAt: "02 Sep 2026",
    dharaReference: "DH-WB-2026-2048",
    accessCode: "WB2048",
  },
  {
    id: "MH-7731",
    projectName: "Industrial Corridor",
    projectType: "Industrial Development",
    state: "Maharashtra",
    district: "Pune",
    landArea: "391 acres",
    citizenLandArea: "2.4 acres",
    parcels: "68",
    stage: "Central Oversight",
    status: "Pending Compensation Processing",
    authority: "Central Authority",
    nextAction: "Compensation Processing",
    compensationStatus: "Not Initiated",
    paymentStatus: "Awaiting Processing",
    implementationStatus: "Implementation Locked",
    parcelStatus: "Affected",
    surveyNumber: "MH-PUN-7731-08",
    landHolder: "Citizen Record",
    compensationAmount: "₹6,75,000",
    compensationUpdatedAt: "31 Aug 2026",
    dharaReference: "DH-MH-2026-7731",
    accessCode: "MH7731",
  },
  {
    id: "OD-0912",
    projectName: "Coastal Infrastructure Project",
    projectType: "Infrastructure",
    state: "Odisha",
    district: "Khordha",
    landArea: "164 acres",
    citizenLandArea: "1.2 acres",
    parcels: "27",
    stage: "District Scrutiny",
    status: "Under District Review",
    authority: "District Authority",
    nextAction: "Field Verification",
    compensationStatus: "Not Started",
    paymentStatus: "Not Applicable Yet",
    implementationStatus: "Not Eligible",
    parcelStatus: "Under Review",
    surveyNumber: "OD-KHD-0912-04",
    landHolder: "Citizen Record",
    compensationAmount: "—",
    compensationUpdatedAt: "—",
    dharaReference: "DH-OD-2026-0912",
    accessCode: "OD0912",
  },
]

const lifecycle = [
  "Proposal Submitted",
  "District Scrutiny",
  "Field Verification",
  "District Field Review",
  "State Scrutiny",
  "Central Oversight",
  "Compensation",
  "Possession / Implementation",
  "Completed",
]

function getStageIndex(stage) {
  const normalizedStage = stage?.toLowerCase()

  if (normalizedStage === "company revision") {
    return 1
  }

  const index = lifecycle.findIndex(
    (item) => item.toLowerCase() === normalizedStage
  )

  return index === -1 ? 0 : index
}

function getDisplayStage(stage) {
  if (stage === "Company Revision") {
    return "District Scrutiny"
  }

  if (stage === "District Rejected") {
    return "District Scrutiny"
  }

  if (stage === "State Rejected") {
    return "State Scrutiny"
  }

  return stage || "Proposal Submitted"
}

function getStageTone(stage) {
  const normalized = stage?.toLowerCase() || ""

  if (normalized.includes("compensation")) {
    return "Compensation"
  }

  if (normalized.includes("completed")) {
    return "Completed"
  }

  if (
    normalized.includes("possession") ||
    normalized.includes("implementation")
  ) {
    return "Implementation"
  }

  return "In Progress"
}

function buildAccessRecord(project) {
  return {
    ...project,
    dharaReference:
      project.dharaReference || `DH-2026-${String(project.id).slice(-6)}`,
    accessCode:
      project.accessCode ||
      `DH${String(project.id)
        .replace(/[^a-z0-9]/gi, "")
        .slice(-6)
        .toUpperCase()}`,
    citizenLandArea: project.citizenLandArea || project.landArea || "—",
    compensationAmount: project.compensationAmount || "Pending",
    compensationStatus:
      project.compensationStatus ||
      (getStageIndex(project.stage) >= 6 ? "Processing" : "Not Started"),
    paymentStatus:
      project.paymentStatus ||
      (getStageIndex(project.stage) >= 6
        ? "Payment Pending"
        : "Awaiting Processing"),
    implementationStatus:
      project.implementationStatus ||
      (getStageIndex(project.stage) >= 7 ? "Eligible" : "Implementation Locked"),
    parcelStatus: project.parcelStatus || "Affected",
    surveyNumber: project.surveyNumber || `Linked-${project.id}`,
  }
}

function CitizenDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [accessRecords, setAccessRecords] = useState([])
  const [verifiedRecord, setVerifiedRecord] = useState(null)

  const [reference, setReference] = useState("")
  const [surveyNumber, setSurveyNumber] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [verificationError, setVerificationError] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)

  const [search, setSearch] = useState("")

  useEffect(() => {
    try {
      const storedProjects = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      )

      const sourceProjects =
        Array.isArray(storedProjects) && storedProjects.length > 0
          ? storedProjects
          : fallbackProjects

      setProjects(sourceProjects)

      const storedAccess = JSON.parse(
        localStorage.getItem(ACCESS_STORAGE_KEY) || "[]"
      )

      if (Array.isArray(storedAccess) && storedAccess.length > 0) {
        setAccessRecords(storedAccess)
      } else {
        const demoAccessRecords = fallbackProjects.map(buildAccessRecord)
        setAccessRecords(demoAccessRecords)
        localStorage.setItem(
          ACCESS_STORAGE_KEY,
          JSON.stringify(demoAccessRecords)
        )
      }
    } catch {
      setProjects(fallbackProjects)

      const demoAccessRecords = fallbackProjects.map(buildAccessRecord)
      setAccessRecords(demoAccessRecords)
    }
  }, [])

  const availableRecords = useMemo(() => {
    const projectMap = new Map(projects.map((project) => [project.id, project]))

    return accessRecords
      .map((record) => ({
        ...buildAccessRecord(projectMap.get(record.id) || record),
        ...record,
      }))
      .filter(Boolean)
  }, [projects, accessRecords])

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return [verifiedRecord].filter(Boolean)

    return [verifiedRecord]
      .filter(Boolean)
      .filter((record) => {
        return [
          record.id,
          record.projectName,
          record.state,
          record.district,
          record.surveyNumber,
          record.stage,
          record.status,
        ]
          .filter(Boolean)
          .some((value) =>
            String(value).toLowerCase().includes(query)
          )
      })
  }, [verifiedRecord, search])

  const handleVerify = () => {
    setVerificationError("")

    const enteredReference = reference.trim().toUpperCase()
    const enteredSurvey = surveyNumber.trim().toUpperCase()
    const enteredCode = accessCode.trim().toUpperCase()

    if (!enteredReference || !enteredSurvey || !enteredCode) {
      setVerificationError("Enter all three details from your government notice.")
      return
    }

    setIsVerifying(true)

    window.setTimeout(() => {
      const match = availableRecords.find((record) => {
        return (
          String(record.dharaReference).toUpperCase() === enteredReference &&
          String(record.surveyNumber).toUpperCase() === enteredSurvey &&
          String(record.accessCode).toUpperCase() === enteredCode
        )
      })

      if (!match) {
        setVerificationError(
          "No matching DHARA record was found. Check the notice details and try again."
        )
        setIsVerifying(false)
        return
      }

      setVerifiedRecord(match)
      setSearch("")
      setIsVerifying(false)
    }, 450)
  }

  const handleClearAccess = () => {
    setVerifiedRecord(null)
    setReference("")
    setSurveyNumber("")
    setAccessCode("")
    setVerificationError("")
    setSearch("")
  }

  const handleUseDemoRecord = (record) => {
    setReference(record.dharaReference)
    setSurveyNumber(record.surveyNumber)
    setAccessCode(record.accessCode)
    setVerificationError("")
  }

  const selectedProject = filteredRecords[0]

  const displayStage = getDisplayStage(selectedProject?.stage)

  const currentStageIndex = Math.max(
    0,
    getStageIndex(displayStage)
  )

  const stageTone = getStageTone(displayStage)

  const compensationStatus =
    selectedProject?.compensationStatus ||
    (currentStageIndex >= 6 ? "Processing" : "Not Started")

  const paymentStatus =
    selectedProject?.paymentStatus ||
    (currentStageIndex >= 6
      ? "Payment Pending"
      : "Awaiting Processing")

  const implementationStatus =
    selectedProject?.implementationStatus ||
    (currentStageIndex >= 7 ? "Eligible" : "Implementation Locked")

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[var(--line)] bg-[var(--paper)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5">
          <div className="flex items-center justify-between gap-6">

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="w-9 h-9 border border-[var(--line)] flex items-center justify-center hover:bg-[var(--ink)] hover:text-[var(--paper)] transition"
                title="Back to DHARA"
              >
                <ArrowLeft size={15} />
              </button>

              <div>
                <p className="font-serif text-xl md:text-2xl">
                  DHARA
                </p>

                <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mt-1">
                  Citizen Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="relative w-9 h-9 border border-[var(--line)] flex items-center justify-center hover:bg-[var(--paper-deep)] transition"
                title="Notifications"
              >
                <Bell size={15} />

                {verifiedRecord && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--earth)]" />
                )}
              </button>

              <div className="hidden sm:block text-right">
                <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                  Citizen Access
                </p>

                <p className="font-mono text-[8px] text-[var(--ink-soft)] mt-1">
                  {verifiedRecord ? "Record verified" : "Record protected"}
                </p>
              </div>

              <div className="w-9 h-9 border border-[var(--line-dark)] bg-[var(--paper-deep)] flex items-center justify-center font-serif">
                C
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">

        {/* ===================================================
            INTRO
        =================================================== */}

        <section className="mb-8 md:mb-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-[var(--earth)] mb-3">
                Secure Citizen Record Access
              </p>

              <h1 className="font-serif text-4xl md:text-5xl leading-tight">
                Your land, clearly tracked.
              </h1>

              <p className="font-mono text-xs md:text-sm text-[var(--ink-soft)] leading-6 mt-4 max-w-2xl">
                Access the DHARA record associated with your government
                notice. Your project, parcel and compensation information
                remains hidden until the notice details are verified.
              </p>
            </div>

            <div className="border border-[var(--line)] bg-[var(--white)] px-5 py-4 min-w-[210px]">
              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Record access
              </p>

              <p className="font-serif text-3xl mt-1">
                {verifiedRecord ? "01" : "—"}
              </p>

              <p className="font-mono text-[8px] text-[var(--ink-soft)] mt-1">
                Verified citizen record
              </p>
            </div>

          </div>
        </section>

        {/* ===================================================
            ACCESS / VERIFIED STATE
        =================================================== */}

        <AnimatePresence mode="wait">

          {!verifiedRecord ? (
            <motion.section
              key="access"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">

                {/* ACCESS FORM */}

                <div className="border border-[var(--line)] bg-[var(--white)]">

                  <div className="border-b border-[var(--line)] p-5 md:p-7">
                    <div className="flex items-start gap-3">

                      <div className="w-10 h-10 border border-[var(--earth)] flex items-center justify-center shrink-0">
                        <LockKeyhole
                          size={17}
                          className="text-[var(--earth)]"
                        />
                      </div>

                      <div>
                        <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                          Step 01 / Verification
                        </p>

                        <h2 className="font-serif text-2xl mt-1">
                          Access your DHARA record
                        </h2>

                        <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)] mt-2 max-w-xl">
                          Enter the exact details printed on your
                          government land or compensation notice.
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="p-5 md:p-7 space-y-5">

                    <div>
                      <label className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        DHARA Reference Number
                      </label>

                      <input
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        placeholder="e.g. DH-WB-2026-2048"
                        className="w-full mt-2 border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none font-mono text-xs focus:border-[var(--earth)]"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        Survey / Parcel Number
                      </label>

                      <input
                        value={surveyNumber}
                        onChange={(event) => setSurveyNumber(event.target.value)}
                        placeholder="e.g. WB-KOL-2048-17"
                        className="w-full mt-2 border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none font-mono text-xs focus:border-[var(--earth)]"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        Notice Access Code
                      </label>

                      <input
                        value={accessCode}
                        onChange={(event) => setAccessCode(event.target.value)}
                        placeholder="Enter the code printed on your notice"
                        className="w-full mt-2 border border-[var(--line)] bg-[var(--paper)] px-4 py-3 outline-none font-mono text-xs focus:border-[var(--earth)]"
                      />
                    </div>

                    {verificationError && (
                      <div className="border border-[var(--earth)] bg-[var(--paper-deep)] p-4">
                        <p className="font-mono text-[9px] leading-5 text-[var(--earth-dark)]">
                          {verificationError}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="w-full border border-[var(--earth)] bg-[var(--ink)] text-[var(--paper)] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.16em] flex items-center justify-center gap-3 hover:bg-[var(--earth-dark)] transition disabled:opacity-60"
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw size={13} className="animate-spin" />
                          Verifying record
                        </>
                      ) : (
                        <>
                          Verify & access record
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>

                    <div className="border-t border-[var(--line)] pt-5 flex items-start gap-3">
                      <ShieldCheck
                        size={15}
                        className="text-[var(--earth)] mt-0.5 shrink-0"
                      />

                      <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                        DHARA reveals only a record that matches all
                        required notice details. Knowing a project ID
                        alone does not provide citizen access.
                      </p>
                    </div>

                  </div>
                </div>

                {/* GOVERNMENT NOTICE */}

                <div className="border border-[var(--line)] bg-[var(--paper-deep)]">

                  <div className="border-b border-[var(--line)] p-5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                      Government Notice
                    </p>

                    <h3 className="font-serif text-xl mt-1">
                      What you need
                    </h3>
                  </div>

                  <div className="p-5">

                    <div className="border border-[var(--line)] bg-[var(--white)] p-5">

                      <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] pb-4">
                        <div>
                          <p className="font-mono text-[8px] uppercase tracking-[0.15em]">
                            Government of India
                          </p>

                          <p className="font-serif text-lg mt-1">
                            DHARA
                          </p>
                        </div>

                        <FileText
                          size={18}
                          className="text-[var(--earth)]"
                        />
                      </div>

                      <div className="py-5 space-y-4">

                        <div>
                          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                            Notice contains
                          </p>
                          <p className="font-mono text-[9px] mt-1">
                            DHARA reference number
                          </p>
                        </div>

                        <div>
                          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                            Parcel identity
                          </p>
                          <p className="font-mono text-[9px] mt-1">
                            Survey / parcel number
                          </p>
                        </div>

                        <div>
                          <p className="font-mono text-[7px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                            Secure access
                          </p>
                          <p className="font-mono text-[9px] mt-1">
                            Notice access code
                          </p>
                        </div>

                      </div>

                      <div className="border-t border-[var(--line)] pt-4">
                        <p className="font-mono text-[8px] leading-5 text-[var(--ink-soft)]">
                          Use only the information printed on your
                          official DHARA notice. Do not share your
                          access code publicly.
                        </p>
                      </div>

                    </div>

                    {/* DEMO HELPER */}

                    <div className="mt-5 border border-dashed border-[var(--line-dark)] p-4">

                      <div className="flex items-start gap-3">
                        <FileText
                          size={14}
                          className="text-[var(--ink-soft)] mt-0.5 shrink-0"
                        />

                        <div>
                          <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                            Prototype demo
                          </p>

                          <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)] mt-1">
                            A real deployment would receive these
                            credentials from the government notice.
                            For the prototype, use one of the sample
                            records below.
                          </p>

                          <div className="mt-3 space-y-2">
                            {fallbackProjects.map((record) => (
                              <button
                                key={record.id}
                                onClick={() =>
                                  handleUseDemoRecord(buildAccessRecord(record))
                                }
                                className="w-full text-left border border-[var(--line)] bg-[var(--white)] p-3 hover:border-[var(--earth)] transition"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--earth)]">
                                    {record.id}
                                  </span>

                                  <ArrowRight
                                    size={12}
                                    className="text-[var(--ink-soft)]"
                                  />
                                </div>

                                <p className="font-serif text-sm mt-1">
                                  {record.projectName}
                                </p>
                              </button>
                            ))}
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                </div>

              </div>

            </motion.section>
          ) : (
            <motion.section
              key="record"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >

              {/* VERIFIED BAR */}

              <div className="border border-[var(--earth)] bg-[var(--paper-deep)] p-4 md:p-5 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      size={16}
                      className="text-[var(--earth)] mt-0.5 shrink-0"
                    />

                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                        Record verified
                      </p>

                      <p className="font-mono text-[9px] text-[var(--ink-soft)] mt-1">
                        Access is limited to the verified parcel record.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearAccess}
                    className="border border-[var(--line-dark)] px-4 py-2 font-mono text-[8px] uppercase tracking-[0.14em] hover:bg-[var(--white)] transition"
                  >
                    End record access
                  </button>

                </div>
              </div>

              {/* SEARCH WITHIN VERIFIED RECORD */}

              <section className="border border-[var(--line)] bg-[var(--white)] p-4 md:p-5 mb-8">

                <div className="flex items-center gap-3">
                  <Search
                    size={16}
                    className="text-[var(--ink-soft)] shrink-0"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search within your verified record..."
                    className="w-full bg-transparent outline-none font-mono text-xs placeholder:text-[var(--ink-soft)]"
                  />
                </div>

              </section>

              {/* RECORD */}

              {selectedProject && (
                <>

                  <section className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

                    {/* RECORD IDENTITY */}

                    <aside>
                      <div className="border border-[var(--line)] bg-[var(--white)]">

                        <div className="border-b border-[var(--line)] p-5">
                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                            Verified Record
                          </p>

                          <h3 className="font-serif text-xl mt-1">
                            Your affected parcel
                          </h3>
                        </div>

                        <div className="p-5 space-y-4">

                          <div>
                            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                              DHARA Reference
                            </p>

                            <p className="font-mono text-xs mt-2 break-all">
                              {selectedProject.dharaReference}
                            </p>
                          </div>

                          <div>
                            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                              Survey / Parcel
                            </p>

                            <p className="font-mono text-xs mt-2 break-all">
                              {selectedProject.surveyNumber}
                            </p>
                          </div>

                          <div>
                            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                              Your affected land
                            </p>

                            <p className="font-serif text-xl mt-2">
                              {selectedProject.citizenLandArea}
                            </p>
                          </div>

                          <div className="border-t border-[var(--line)] pt-4">
                            <p className="font-mono text-[8px] leading-5 text-[var(--ink-soft)]">
                              This record is shown because the
                              government notice details matched the
                              DHARA parcel record.
                            </p>
                          </div>

                        </div>
                      </div>
                    </aside>

                    {/* SELECTED RECORD */}

                    <div>

                      <div className="border border-[var(--line)] bg-[var(--white)]">

                        {/* PROJECT HEADER */}

                        <div className="border-b border-[var(--line)] p-5 md:p-7">

                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                            <div>

                              <div className="flex items-center gap-2 mb-3">

                                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                                  Project {selectedProject.id}
                                </span>

                                <span className="w-1 h-1 rounded-full bg-[var(--line-dark)]" />

                                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                                  {stageTone}
                                </span>

                              </div>

                              <h2 className="font-serif text-2xl md:text-3xl">
                                {selectedProject.projectName ||
                                  selectedProject.name}
                              </h2>

                              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4">

                                <span className="flex items-center gap-1.5 font-mono text-[9px] text-[var(--ink-soft)]">
                                  <MapPin size={12} />
                                  {selectedProject.district},{" "}
                                  {selectedProject.state}
                                </span>

                                <span className="font-mono text-[9px] text-[var(--ink-soft)]">
                                  {selectedProject.projectType ||
                                    "Project"}
                                </span>

                              </div>

                            </div>

                            <div className="border border-[var(--earth)] bg-[var(--paper-deep)] px-4 py-3">

                              <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                                Current Stage
                              </p>

                              <p className="font-mono text-xs uppercase mt-1">
                                {displayStage}
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* PARCEL INFORMATION */}

                        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--line)] border-b border-[var(--line)]">

                          <div className="p-4 md:p-5">
                            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                              Survey / Parcel
                            </p>

                            <p className="font-mono text-xs mt-2 break-all">
                              {selectedProject.surveyNumber}
                            </p>
                          </div>

                          <div className="p-4 md:p-5">
                            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                              Your Land
                            </p>

                            <p className="font-mono text-xs mt-2">
                              {selectedProject.citizenLandArea}
                            </p>
                          </div>

                          <div className="p-4 md:p-5">
                            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                              Parcel Status
                            </p>

                            <p className="font-mono text-xs mt-2">
                              {selectedProject.parcelStatus}
                            </p>
                          </div>

                          <div className="p-4 md:p-5">
                            <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                              Record Access
                            </p>

                            <p className="font-mono text-xs mt-2">
                              Verified
                            </p>
                          </div>

                        </div>

                        {/* COMPENSATION */}

                        <div className="p-5 md:p-7">

                          <div className="flex items-start justify-between gap-5 mb-5">

                            <div className="flex items-start gap-3">

                              <div className="w-10 h-10 border border-[var(--earth)] flex items-center justify-center shrink-0">
                                <WalletCards
                                  size={17}
                                  className="text-[var(--earth)]"
                                />
                              </div>

                              <div>
                                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                                  Compensation
                                </p>

                                <h3 className="font-serif text-xl mt-1">
                                  Compensation record
                                </h3>
                              </div>

                            </div>

                            <span className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)] text-right">
                              Government managed
                            </span>

                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                            <div className="border border-[var(--line)] bg-[var(--paper)] p-4">
                              <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                                Recorded Amount
                              </p>

                              <p className="font-serif text-xl mt-2">
                                {selectedProject.compensationAmount ||
                                  "Pending"}
                              </p>
                            </div>

                            <div className="border border-[var(--line)] bg-[var(--paper)] p-4">
                              <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                                Compensation Status
                              </p>

                              <div className="flex items-center gap-2 mt-2">

                                {compensationStatus === "Processing" ? (
                                  <Clock3
                                    size={14}
                                    className="text-[var(--earth)]"
                                  />
                                ) : (
                                  <FileText
                                    size={14}
                                    className="text-[var(--ink-soft)]"
                                  />
                                )}

                                <p className="font-mono text-xs">
                                  {compensationStatus}
                                </p>

                              </div>
                            </div>

                            <div className="border border-[var(--line)] bg-[var(--paper)] p-4">
                              <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                                Payment Status
                              </p>

                              <p className="font-mono text-xs mt-2">
                                {paymentStatus}
                              </p>
                            </div>

                          </div>

                          <div className="mt-4 border border-[var(--line)] bg-[var(--paper-deep)] p-4">

                            <div className="flex items-start gap-3">

                              <ShieldCheck
                                size={15}
                                className="text-[var(--earth)] mt-0.5 shrink-0"
                              />

                              <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                                Compensation information is maintained
                                by the authorized government authority
                                against the existing project and parcel
                                record. No separate citizen compensation
                                application is required through DHARA.
                              </p>

                            </div>

                          </div>

                        </div>

                        {/* IMPLEMENTATION GATE */}

                        <div className="border-t border-[var(--line)] p-5 md:p-7">

                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                            <div>

                              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                                Implementation Gate
                              </p>

                              <h3 className="font-serif text-xl mt-1">
                                Possession / Implementation
                              </h3>

                              <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)] mt-2 max-w-xl">
                                Implementation eligibility is linked
                                to the government compensation process.
                                Mandatory compensation conditions must be
                                cleared before implementation can proceed.
                              </p>

                            </div>

                            <div
                              className={`border px-4 py-3 shrink-0 ${
                                implementationStatus === "Eligible"
                                  ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                                  : "border-[var(--line-dark)]"
                              }`}
                            >
                              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                                Status
                              </p>

                              <p className="font-mono text-xs uppercase mt-1">
                                {implementationStatus}
                              </p>
                            </div>

                          </div>

                        </div>

                      </div>

                      {/* ADMINISTRATIVE TIMELINE */}

                      <div className="mt-6 border border-[var(--line)] bg-[var(--white)]">

                        <div className="border-b border-[var(--line)] p-5">

                          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                            Administrative Timeline
                          </p>

                          <h3 className="font-serif text-xl mt-1">
                            Project progress
                          </h3>

                        </div>

                        <div className="p-5 md:p-7">

                          <div className="relative">

                            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-[var(--line)]" />

                            <div className="space-y-5">

                              {lifecycle.map((stage, index) => {

                                const completed =
                                  index < currentStageIndex

                                const current =
                                  index === currentStageIndex

                                return (
                                  <div
                                    key={stage}
                                    className="relative flex items-start gap-4"
                                  >

                                    <div
                                      className={`relative z-10 w-[23px] h-[23px] rounded-full border flex items-center justify-center shrink-0 ${
                                        completed || current
                                          ? "border-[var(--earth)] bg-[var(--paper)]"
                                          : "border-[var(--line-dark)] bg-[var(--white)]"
                                      }`}
                                    >

                                      {completed ? (
                                        <CheckCircle2
                                          size={12}
                                          className="text-[var(--earth)]"
                                        />
                                      ) : (
                                        <span
                                          className={`w-1.5 h-1.5 rounded-full ${
                                            current
                                              ? "bg-[var(--earth)]"
                                              : "bg-[var(--line-dark)]"
                                          }`}
                                        />
                                      )}

                                    </div>

                                    <div className="pb-1">

                                      <p
                                        className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                                          current
                                            ? "text-[var(--earth)]"
                                            : completed
                                            ? "text-[var(--ink)]"
                                            : "text-[var(--ink-soft)]"
                                        }`}
                                      >
                                        {stage}
                                      </p>

                                      {current && (
                                        <p className="font-mono text-[8px] text-[var(--ink-soft)] mt-1">
                                          Current administrative stage
                                        </p>
                                      )}

                                    </div>

                                  </div>
                                )
                              })}

                            </div>

                          </div>

                        </div>
                      </div>

                      {/* CITIZEN VISIBILITY */}

                      <div className="mt-6 border border-[var(--earth)] bg-[var(--paper-deep)] p-5 md:p-6">

                        <div className="flex items-start gap-4">

                          <div className="w-9 h-9 border border-[var(--earth)] flex items-center justify-center shrink-0">
                            <Bell
                              size={15}
                              className="text-[var(--earth)]"
                            />
                          </div>

                          <div>

                            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)]">
                              Citizen visibility
                            </p>

                            <h3 className="font-serif text-lg mt-1">
                              Stay informed about your record.
                            </h3>

                            <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)] mt-2">
                              DHARA keeps the project, parcel,
                              compensation and implementation states
                              connected so that changes made by authorized
                              government authorities are reflected in the
                              citizen view.
                            </p>

                          </div>

                        </div>
                      </div>

                    </div>

                  </section>

                </>
              )}

            </motion.section>
          )}

        </AnimatePresence>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[var(--line)] mt-8">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

          <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
            DHARA / Citizen Land Intelligence
          </p>

          <p className="font-mono text-[8px] text-[var(--ink-soft)]">
            Verified record access • Government managed
          </p>

        </div>

      </footer>

    </div>
  )
}

export default CitizenDashboard
