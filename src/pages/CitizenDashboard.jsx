import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CheckCircle2,
  Clock3,
  FileText,
  MapPin,
  Search,
  ShieldCheck,
  WalletCards,
} from "lucide-react"
import { motion } from "framer-motion"

const STORAGE_KEY = "dhara-projects"

const fallbackProjects = [
  {
    id: "WB-2048",
    projectName: "Eastern Freight Corridor",
    projectType: "Transport Infrastructure",
    state: "West Bengal",
    district: "Kolkata",
    landArea: "248 acres",
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
  },
  {
    id: "MH-7731",
    projectName: "Industrial Corridor",
    projectType: "Industrial Development",
    state: "Maharashtra",
    district: "Pune",
    landArea: "391 acres",
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
  },
  {
    id: "OD-0912",
    projectName: "Coastal Infrastructure Project",
    projectType: "Infrastructure",
    state: "Odisha",
    district: "Khordha",
    landArea: "164 acres",
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

  return lifecycle.findIndex(
    (item) => item.toLowerCase() === normalizedStage
  )
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

function CitizenDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState("")
  const [selectedProjectId, setSelectedProjectId] = useState(null)

  useEffect(() => {
    try {
      const stored = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
      )

      if (Array.isArray(stored) && stored.length > 0) {
        setProjects(stored)
      } else {
        setProjects(fallbackProjects)
      }
    } catch {
      setProjects(fallbackProjects)
    }
  }, [])

  const citizenProjects = useMemo(() => {
    return projects.length > 0 ? projects : fallbackProjects
  }, [projects])

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return citizenProjects

    return citizenProjects.filter((project) => {
      return [
        project.id,
        project.projectName,
        project.name,
        project.state,
        project.district,
        project.surveyNumber,
        project.stage,
        project.status,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(query)
        )
    })
  }, [citizenProjects, search])

  const selectedProject =
    citizenProjects.find(
      (project) => project.id === selectedProjectId
    ) || filteredProjects[0] || citizenProjects[0]

  const displayStage = getDisplayStage(
    selectedProject?.stage
  )

  const currentStageIndex = Math.max(
    0,
    getStageIndex(displayStage)
  )

  const stageTone = getStageTone(displayStage)

  const compensationStatus =
    selectedProject?.compensationStatus ||
    (currentStageIndex >= 6
      ? "Processing"
      : "Not Started")

  const paymentStatus =
    selectedProject?.paymentStatus ||
    (currentStageIndex >= 6
      ? "Payment Pending"
      : "Awaiting Processing")

  const implementationStatus =
    selectedProject?.implementationStatus ||
    (currentStageIndex >= 7
      ? "Eligible"
      : "Implementation Locked")

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

                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--earth)]" />

              </button>

              <div className="hidden sm:block text-right">

                <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                  Citizen Access
                </p>

                <p className="font-mono text-[8px] text-[var(--ink-soft)] mt-1">
                  Verified account
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
                Public Land Record View
              </p>

              <h1 className="font-serif text-4xl md:text-5xl leading-tight">
                Your land, clearly tracked.
              </h1>

              <p className="font-mono text-xs md:text-sm text-[var(--ink-soft)] leading-6 mt-4 max-w-2xl">
                View the administrative progress of projects
                affecting your parcel, including verification,
                government scrutiny and compensation status.
              </p>

            </div>

            <div className="border border-[var(--line)] bg-[var(--white)] px-5 py-4 min-w-[210px]">

              <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Records linked
              </p>

              <p className="font-serif text-3xl mt-1">
                {citizenProjects.length}
              </p>

              <p className="font-mono text-[8px] text-[var(--ink-soft)] mt-1">
                Project / parcel records
              </p>

            </div>

          </div>

        </section>

        {/* ===================================================
            SEARCH
        =================================================== */}

        <section className="border border-[var(--line)] bg-[var(--white)] p-4 md:p-5 mb-8">

          <div className="flex items-center gap-3">

            <Search
              size={16}
              className="text-[var(--ink-soft)] shrink-0"
            />

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by project, district, state or survey number..."
              className="w-full bg-transparent outline-none font-mono text-xs placeholder:text-[var(--ink-soft)]"
            />

          </div>

        </section>

        {/* ===================================================
            PROJECT SELECTOR
        =================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          <aside>

            <div className="flex items-center justify-between mb-3">

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                Linked Records
              </p>

              <span className="font-mono text-[9px] text-[var(--ink-soft)]">
                {filteredProjects.length}
              </span>

            </div>

            <div className="space-y-2">

              {filteredProjects.map((project) => {

                const active =
                  project.id === selectedProject?.id

                return (
                  <button
                    key={project.id}
                    onClick={() =>
                      setSelectedProjectId(project.id)
                    }
                    className={`w-full text-left border p-4 transition ${
                      active
                        ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                        : "border-[var(--line)] bg-[var(--white)] hover:border-[var(--line-dark)]"
                    }`}
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-[var(--earth)]">
                          {project.id}
                        </p>

                        <p className="font-serif text-base mt-2">
                          {project.projectName ||
                            project.name}
                        </p>

                        <p className="font-mono text-[8px] text-[var(--ink-soft)] mt-2">
                          {project.district},{" "}
                          {project.state}
                        </p>

                      </div>

                      <ArrowRight
                        size={13}
                        className={
                          active
                            ? "text-[var(--earth)]"
                            : "text-[var(--ink-soft)]"
                        }
                      />

                    </div>

                  </button>
                )
              })}

              {filteredProjects.length === 0 && (
                <div className="border border-[var(--line)] p-5 bg-[var(--white)]">

                  <p className="font-serif text-lg">
                    No matching records.
                  </p>

                  <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)] mt-2">
                    Try searching using a project name,
                    district or survey number.
                  </p>

                </div>
              )}

            </div>

          </aside>

          {/* =================================================
              SELECTED RECORD
          ================================================= */}

          {selectedProject && (
            <motion.section
              key={selectedProject.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >

              {/* PROJECT HEADER */}

              <div className="border border-[var(--line)] bg-[var(--white)]">

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

                {/* ===========================================
                    PARCEL INFORMATION
                =========================================== */}

                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-[var(--line)] border-b border-[var(--line)]">

                  <div className="p-4 md:p-5">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Survey / Parcel
                    </p>

                    <p className="font-mono text-xs mt-2">
                      {selectedProject.surveyNumber ||
                        "Record linked"}
                    </p>

                  </div>

                  <div className="p-4 md:p-5">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Land Area
                    </p>

                    <p className="font-mono text-xs mt-2">
                      {selectedProject.landArea ||
                        selectedProject.land ||
                        "—"}
                    </p>

                  </div>

                  <div className="p-4 md:p-5">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Parcels
                    </p>

                    <p className="font-mono text-xs mt-2">
                      {selectedProject.parcels || "—"}
                    </p>

                  </div>

                  <div className="p-4 md:p-5">

                    <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                      Record Status
                    </p>

                    <p className="font-mono text-xs mt-2">
                      {selectedProject.parcelStatus ||
                        "Affected"}
                    </p>

                  </div>

                </div>

                {/* ===========================================
                    COMPENSATION
                =========================================== */}

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

                    {/* AMOUNT */}

                    <div className="border border-[var(--line)] bg-[var(--paper)] p-4">

                      <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        Recorded Amount
                      </p>

                      <p className="font-serif text-xl mt-2">
                        {selectedProject.compensationAmount ||
                          "Pending"}
                      </p>

                    </div>

                    {/* COMPENSATION STATUS */}

                    <div className="border border-[var(--line)] bg-[var(--paper)] p-4">

                      <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[var(--ink-soft)]">
                        Compensation Status
                      </p>

                      <div className="flex items-center gap-2 mt-2">

                        {compensationStatus ===
                        "Processing" ? (
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

                    {/* PAYMENT */}

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

                {/* ===========================================
                    IMPLEMENTATION GATE
                =========================================== */}

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

              {/* =============================================
                  LIFECYCLE
              ============================================= */}

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

              {/* =============================================
                  NOTIFICATION / EXCEPTION
              ============================================= */}

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

            </motion.section>
          )}

        </section>

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
            Administrative information • Government managed
          </p>

        </div>

      </footer>

    </div>
  )
}

export default CitizenDashboard