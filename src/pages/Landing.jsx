import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Crosshair,
  Landmark,
  MapPin,
  Menu,
  Shield,
  Users,
  X,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import DHARAMap from "../gis/DHARAMap"

const workflowStages = [
  {
    name: "Proposal",
    number: "01",
    type: "ENTRY",
    authority: "Project Authority",
    next: "District Scrutiny",
    description:
      "A land requirement is registered in DHARA with the project proposal, required area and supporting records.",
    state: "Project initiated",
  },
  {
    name: "District Scrutiny",
    number: "02",
    type: "REVIEW",
    authority: "District Authority",
    next: "Field Verification",
    description:
      "The submitted requirement is reviewed against land records, geography and administrative requirements.",
    state: "Under district review",
  },
  {
    name: "Field Verification",
    number: "03",
    type: "GROUND",
    authority: "Field Officer",
    next: "District Field Review",
    description:
      "The proposed parcels are verified on the ground and field observations are recorded against the project.",
    state: "Ground verification",
  },
  {
    name: "District Field Review",
    number: "04",
    type: "REVIEW",
    authority: "District Authority",
    next: "State Scrutiny",
    description:
      "The district reviews the field findings and confirms whether the verified land can proceed to state-level scrutiny.",
    state: "District verification review",
  },
  {
    name: "State Scrutiny",
    number: "05",
    type: "DECISION",
    authority: "State Authority",
    next: "Central Oversight",
    description:
      "The state authority reviews the verified project, monitors district decisions and determines whether it should proceed.",
    state: "State-level review",
  },
  {
    name: "Central Oversight",
    number: "06",
    type: "NATIONAL",
    authority: "Central Authority",
    next: "SLCO Compensation Review",
    description:
      "The project reaches national-level oversight where progress, compliance and administrative readiness are reviewed.",
    state: "National oversight",
  },
  {
    name: "Compensation Approval",
    number: "07",
    type: "SETTLEMENT",
    authority: "SLCO",
    next: "Compensation Payment",
    description:
      "The Special Land Acquisition Officer reviews the compensation record and approves the compensation due for the affected land.",
    state: "Compensation approval",
  },
  {
    name: "Compensation Payment",
    number: "08",
    type: "PAYMENT",
    authority: "SLCO",
    next: "Citizen Acknowledgement",
    description:
      "Approved compensation is recorded as paid. Implementation remains locked until the citizen acknowledges the compensation.",
    state: "Payment recorded",
  },
  {
    name: "Citizen Acknowledgement",
    number: "09",
    type: "CITIZEN",
    authority: "Citizen",
    next: "Government Implementation",
    description:
      "The citizen receives the compensation notification and acknowledges receipt. This acknowledgement makes the project eligible for implementation.",
    state: "Citizen acknowledgement",
  },
  {
    name: "Implementation",
    number: "10",
    type: "EXECUTION",
    authority: "Government Implementation Authority",
    next: "Project Completion",
    description:
      "Once compensation is approved, paid and acknowledged, the authorized government implementation authority can begin the project.",
    state: "Implementation in progress",
  },
  {
    name: "Completed",
    number: "11",
    type: "COMPLETE",
    authority: "Government Implementation Authority",
    next: "Complete",
    description:
      "The project reaches completion with its land, verification, approvals, compensation, acknowledgement and implementation history preserved in DHARA.",
    state: "Case closed",
  },
]

const portals = [
  {
    id: "company",
    number: "01",
    label: "PROJECT AUTHORITY",
    title: "Company",
    description:
      "A project-facing view for organisations requiring land for infrastructure and development.",
    question: "What requires attention?",
    metrics: [
      ["24", "Active projects"],
      ["08", "Pending submissions"],
      ["13", "Scrutiny responses"],
    ],
    actions: [
      "View project proposals",
      "Submit land requirements",
      "Upload supporting documents",
      "Define required land",
      "Track proposal status",
    ],
    icon: Landmark,
    color: {
      bg: "#ead0c3",
      active: "#b65f3c",
      text: "#7b3925",
    },
  },
  {
    id: "authority",
    number: "02",
    label: "GOVERNMENT SYSTEM",
    title: "Authority",
    description:
      "The connected government layer through which district, field, state, central and compensation responsibilities operate.",
    question: "Which authority are you?",
    metrics: [
      ["05", "Government roles"],
      ["01", "Connected system"],
      ["24/7", "Administrative visibility"],
    ],
    actions: [
      "District administration",
      "Field verification",
      "State scrutiny",
      "Central oversight",
      "SLCO compensation",
      "Government implementation",
    ],
    icon: Shield,
    color: {
      bg: "#e7d8b7",
      active: "#a47a32",
      text: "#70521d",
    },
  },
  {
    id: "citizen",
    number: "03",
    label: "PUBLIC ACCESS",
    title: "Citizen",
    description:
      "A simpler public-facing view helping people understand what is happening with their land.",
    question: "What happens to my land?",
    metrics: [
      ["01", "Parcel search"],
      ["11", "Lifecycle states"],
      ["24/7", "Status access"],
    ],
    actions: [
      "Search Project ID",
      "Search Parcel ID",
      "View current status",
      "Track compensation",
      "Acknowledge compensation",
      "Understand what happens next",
    ],
    icon: Users,
    color: {
      bg: "#cadbcf",
      active: "#4e7659",
      text: "#35563f",
    },
  },
]

const authorityRoles = [
  {
    id: "district",
    number: "01",
    title: "District Authority",
    label: "DISTRICT ADMINISTRATION",
    description:
      "Review proposals, coordinate verification and manage district-level administrative decisions.",
    icon: Shield,
    color: "#a47a32",
  },
  {
    id: "field",
    number: "02",
    title: "Field Officer",
    label: "GROUND VERIFICATION",
    description:
      "Verify parcels on the ground, capture evidence and update field observations.",
    icon: MapPin,
    color: "#357b76",
  },
  {
    id: "state",
    number: "03",
    title: "State Authority",
    label: "STATE OVERSIGHT",
    description:
      "Monitor districts, identify delays and oversee project progress across the state.",
    icon: Landmark,
    color: "#496d91",
  },
  {
    id: "central",
    number: "04",
    title: "Central Authority",
    label: "NATIONAL OVERSIGHT",
    description:
      "Monitor national progress, compare states and identify systemic delays.",
    icon: Crosshair,
    color: "#5b547f",
  },
  {
    id: "slco",
    number: "05",
    title: "SLCO",
    label: "SPECIAL LAND ACQUISITION OFFICER",
    description:
      "Review and approve compensation, record compensation payment and move eligible projects toward citizen acknowledgement.",
    icon: Shield,
    color: "#8b5e3c",
  },
]

function Landing() {
  const navigate = useNavigate()

  const [activeStage, setActiveStage] = useState(0)
  const [activePortal, setActivePortal] = useState(0)
  const [authorityOpen, setAuthorityOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const currentStage = workflowStages[activeStage]
  const currentPortal = portals[activePortal]
  const PortalIcon = currentPortal.icon

  const openPortal = (portalId) => {
    navigate("/signin", {
      state: {
        role: portalId,
      },
    })
  }

  const handlePortalClick = (portal, index) => {
    setActivePortal(index)

    if (portal.id === "authority") {
      setAuthorityOpen(true)
      return
    }

    openPortal(portal.id)
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3efe6] text-[#171714]">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className="relative z-50 flex items-center justify-between border-b border-[#cfc8b9] px-5 py-5 md:px-10">

        <div className="flex items-center gap-4">

          <div className="flex h-8 w-8 items-center justify-center border border-[#171714]">
            <span className="font-mono text-xs">
              D
            </span>
          </div>

          <div>

            <p className="font-serif text-lg leading-none">
              DHARA
            </p>

            <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.18em] text-[#5d5a52]">
              National Land System
            </p>

          </div>

        </div>

        {/* Desktop navigation */}

        <div className="hidden items-center gap-8 font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52] md:flex">

          <a
            href="#portals"
            className="transition-colors hover:text-[#b65f3c]"
          >
            Portals
          </a>

          <a
            href="#gis"
            className="transition-colors hover:text-[#b65f3c]"
          >
            GIS
          </a>

          <a
            href="#workflow"
            className="transition-colors hover:text-[#b65f3c]"
          >
            Lifecycle
          </a>

        </div>

        <div className="flex items-center gap-4">

          <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#b65f3c]" />
            Live System
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center border border-[#cfc8b9] md:hidden"
            aria-label="Open menu"
          >
            <Menu
              size={16}
              strokeWidth={1.5}
            />
          </button>

        </div>

        {/* Mobile menu */}

        {menuOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="absolute left-0 right-0 top-full border-b border-[#cfc8b9] bg-[#f3efe6] px-5 py-5 md:hidden"
          >

            <div className="flex flex-col gap-5 font-mono text-[10px] uppercase tracking-[0.16em]">

              <a
                href="#portals"
                onClick={() => setMenuOpen(false)}
              >
                Portals
              </a>

              <a
                href="#gis"
                onClick={() => setMenuOpen(false)}
              >
                GIS
              </a>

              <a
                href="#workflow"
                onClick={() => setMenuOpen(false)}
              >
                Lifecycle
              </a>

            </div>

          </motion.div>
        )}

      </nav>

      {/* =====================================================
          01 / GOVERNMENT PORTALS
      ===================================================== */}

      <section
        id="portals"
        className="border-t border-[#cfc8b9] bg-[#e9e3d7] px-5 py-20 md:px-10 md:py-28"
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">

            <div>

              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#9f4d31]">
                01 / Government portals
              </p>

              <p className="mt-6 max-w-xs font-mono text-[12px] leading-7 text-[#403c36]">
                DHARA connects different responsibilities through one
                underlying land information system.
              </p>

            </div>

            <div>

              <h1 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-tight md:text-7xl">
                Different roles.
                <br />
                One system.
              </h1>

              <p className="mt-8 max-w-xl font-mono text-[12px] leading-7 text-[#403c36] md:text-sm">
                Companies initiate projects, authorities manage the
                administrative lifecycle, and citizens access transparent
                information about affected land.
              </p>

            </div>

          </div>

          {/* THREE MAIN PORTALS */}

          <div className="mt-16 grid gap-4 md:grid-cols-3">

            {portals.map((portal, index) => {

              const Icon = portal.icon
              const active = activePortal === index
              const color = portal.color

              return (
                <motion.button
                  key={portal.id}
                  onClick={() => handlePortalClick(portal, index)}
                  whileHover={{
                    y: -5,
                  }}
                  whileTap={{
                    scale: 0.99,
                  }}
                  style={{
                    backgroundColor: active
                      ? color.active
                      : color.bg,
                  }}
                  className="group relative flex min-h-[350px] flex-col overflow-hidden p-6 text-left transition-all duration-300 md:p-8"
                >

                  <motion.div
                    animate={{
                      width: active ? "100%" : "0%",
                    }}
                    transition={{
                      duration: 0.35,
                    }}
                    style={{
                      backgroundColor: "#ffffff",
                    }}
                    className="absolute left-0 top-0 h-1"
                  />

                  <div className="flex items-start justify-between">

                    <div>

                      <p
                        style={{
                          color: active
                            ? "#ffffff"
                            : color.text,
                        }}
                        className="font-mono text-[10px] font-medium tracking-[0.16em]"
                      >
                        {portal.number}
                      </p>

                      <p
                        className={`mt-3 font-mono text-[9px] font-medium uppercase tracking-[0.16em] ${
                          active
                            ? "text-white/75"
                            : "text-[#514b43]"
                        }`}
                      >
                        {portal.label}
                      </p>

                    </div>

                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                        active
                          ? "border-white/40"
                          : "border-black/15"
                      }`}
                    >

                      <Icon
                        size={16}
                        strokeWidth={1.3}
                        style={{
                          color: active
                            ? "#ffffff"
                            : color.text,
                        }}
                      />

                    </div>

                  </div>

                  <div className="mt-12">

                    <h3
                      className={`font-serif text-3xl leading-none md:text-4xl ${
                        active
                          ? "text-white"
                          : "text-[#171714]"
                      }`}
                    >
                      {portal.title}
                    </h3>

                    <p
                      className={`mt-5 max-w-sm font-mono text-[11px] leading-6 md:text-xs ${
                        active
                          ? "text-white/85"
                          : "text-[#403c36]"
                      }`}
                    >
                      {portal.description}
                    </p>

                  </div>

                  <div
                    className={`mt-auto flex items-center justify-between border-t pt-5 ${
                      active
                        ? "border-white/25"
                        : "border-black/15"
                    }`}
                  >

                    <div>

                      <p
                        className={`font-mono text-[8px] uppercase tracking-[0.16em] ${
                          active
                            ? "text-white/50"
                            : "text-[#77736b]"
                        }`}
                      >
                        {portal.id === "authority"
                          ? "Five government roles"
                          : "Portal access"}
                      </p>

                      <p
                        className={`mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.14em] ${
                          active
                            ? "text-white"
                            : "text-[#292721]"
                        }`}
                      >
                        {portal.id === "authority"
                          ? "Choose authority"
                          : "Open portal"}
                      </p>

                    </div>

                    <motion.div
                      animate={{
                        x: active ? 3 : 0,
                        y: active ? -3 : 0,
                      }}
                    >

                      <ArrowUpRight
                        size={17}
                        strokeWidth={1.3}
                        style={{
                          color: active
                            ? "#ffffff"
                            : color.text,
                        }}
                      />

                    </motion.div>

                  </div>

                </motion.button>
              )
            })}

          </div>

          {/* ACTIVE PORTAL DETAIL */}

          <motion.div
            key={currentPortal.id}
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.35,
            }}
            style={{
              backgroundColor: "#eee8dc",
              borderTopColor: currentPortal.color.active,
            }}
            className="mt-16 border-t-2 px-5 py-8 md:px-8 md:py-10"
          >

            <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">

              <div>

                <div className="flex items-center gap-4">

                  <div
                    className="flex h-11 w-11 items-center justify-center border"
                    style={{
                      borderColor: currentPortal.color.active,
                    }}
                  >

                    <PortalIcon
                      size={18}
                      strokeWidth={1.2}
                      style={{
                        color: currentPortal.color.active,
                      }}
                    />

                  </div>

                  <div>

                    <p
                      style={{
                        color: currentPortal.color.active,
                      }}
                      className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
                    >
                      Portal {currentPortal.number}
                    </p>

                    <p className="mt-1 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#514b43]">
                      {currentPortal.label}
                    </p>

                  </div>

                </div>

                <h3 className="mt-8 font-serif text-4xl leading-none md:text-6xl">
                  {currentPortal.title}
                </h3>

                <p className="mt-6 max-w-lg font-mono text-[12px] leading-7 text-[#3f3b35] md:text-sm">
                  {currentPortal.description}
                </p>

                <div
                  className="mt-10 inline-flex items-center gap-3 border-l-2 pl-4"
                  style={{
                    borderColor: currentPortal.color.active,
                  }}
                >

                  <span
                    style={{
                      color: currentPortal.color.active,
                    }}
                    className="font-mono text-[10px] font-medium uppercase tracking-[0.12em]"
                  >
                    {currentPortal.question}
                  </span>

                  <ArrowRight
                    size={14}
                    style={{
                      color: currentPortal.color.active,
                    }}
                  />

                </div>

              </div>

              <div>

                <div className="grid grid-cols-3 border-y border-[#b9b1a2]">

                  {currentPortal.metrics.map(
                    ([value, label]) => (
                      <div
                        key={label}
                        className="border-r border-[#b9b1a2] px-3 py-5 last:border-r-0 md:px-4"
                      >

                        <p className="font-serif text-3xl leading-none md:text-4xl">
                          {value}
                        </p>

                        <p className="mt-3 font-mono text-[9px] font-medium uppercase leading-4 tracking-[0.1em] text-[#514b43]">
                          {label}
                        </p>

                      </div>
                    )
                  )}

                </div>

                <div className="mt-8">

                  <p
                    style={{
                      color: currentPortal.color.active,
                    }}
                    className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
                  >
                    Available actions
                  </p>

                  <div className="mt-5 divide-y divide-[#c1b9aa] border-y border-[#b9b1a2]">

                    {currentPortal.actions.map(
                      (action, index) => (
                        <div
                          key={action}
                          className="flex items-center justify-between py-4"
                        >

                          <div className="flex items-center gap-4">

                            <span className="font-mono text-[9px] font-medium text-[#77736b]">
                              {String(index + 1).padStart(2, "0")}
                            </span>

                            <span className="font-mono text-[11px] font-medium text-[#292721] md:text-xs">
                              {action}
                            </span>

                          </div>

                          <ArrowUpRight
                            size={13}
                            strokeWidth={1.2}
                            className="text-[#514b43]"
                          />

                        </div>
                      )
                    )}

                  </div>

                </div>

              </div>

            </div>

          </motion.div>

          {/* Shared system layer */}

          <div className="mt-20 border-t border-[#b9b1a2] pt-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#514b43]">
                  Shared system layer
                </p>

                <p className="mt-3 font-serif text-xl">
                  Same land. Different responsibility.
                </p>

              </div>

              <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#514b43]">

                <span>Company</span>
                <ArrowRight size={11} />

                <span>District</span>
                <ArrowRight size={11} />

                <span>Field</span>
                <ArrowRight size={11} />

                <span>State</span>
                <ArrowRight size={11} />

                <span>Central</span>
                <ArrowRight size={11} />

                <span>SLCO</span>
                <ArrowRight size={11} />

                <span>Payment</span>
                <ArrowRight size={11} />

                <span>Citizen</span>
                <ArrowRight size={11} />

                <span>Implementation</span>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          AUTHORITY ROLE MODAL
      ===================================================== */}

      <AnimatePresence>

        {authorityOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#171714]/45 px-4 py-6 backdrop-blur-md md:px-8"
            onClick={() => setAuthorityOpen(false)}
          >

            <motion.div
              initial={{
                opacity: 0,
                y: 25,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 15,
                scale: 0.98,
              }}
              transition={{
                duration: 0.3,
              }}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto border border-[#b9b1a2] bg-[#eee8dc] shadow-2xl"
            >

              {/* Modal header */}

              <div className="border-b border-[#b9b1a2] px-6 py-6 md:px-10 md:py-8">

                <div className="flex items-start justify-between gap-6">

                  <div>

                    <p className="font-mono text-[9px] font-medium uppercase tracking-[0.2em] text-[#a47a32]">
                      02 / Government authority
                    </p>

                    <h2 className="mt-4 font-serif text-4xl leading-none md:text-6xl">
                      Select your authority.
                    </h2>

                    <p className="mt-5 max-w-xl font-mono text-[11px] leading-6 text-[#5d5a52] md:text-xs">
                      Choose the government role associated with your
                      responsibilities in the DHARA system.
                    </p>

                  </div>

                  <button
                    onClick={() => setAuthorityOpen(false)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#b9b1a2] transition-colors hover:bg-[#e2dbcf]"
                    aria-label="Close authority selection"
                  >

                    <X
                      size={17}
                      strokeWidth={1.3}
                    />

                  </button>

                </div>

              </div>

              {/* Authority options */}

              <div className="grid gap-px bg-[#b9b1a2] md:grid-cols-2">

                {authorityRoles.map((role) => {

                  const Icon = role.icon

                  return (
                    <motion.button
                      key={role.id}
                      onClick={() => openPortal(role.id)}
                      whileHover={{
                        backgroundColor: "#e6dfd3",
                      }}
                      className="group bg-[#eee8dc] p-6 text-left transition-colors md:p-8"
                    >

                      <div className="flex items-start justify-between">

                        <div
                          className="flex h-11 w-11 items-center justify-center border"
                          style={{
                            borderColor: `${role.color}66`,
                          }}
                        >

                          <Icon
                            size={18}
                            strokeWidth={1.2}
                            style={{
                              color: role.color,
                            }}
                          />

                        </div>

                        <ArrowUpRight
                          size={17}
                          strokeWidth={1.2}
                          className="text-[#8a847a] transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                        />

                      </div>

                      <p
                        className="mt-8 font-mono text-[9px] font-medium uppercase tracking-[0.16em]"
                        style={{
                          color: role.color,
                        }}
                      >
                        {role.number} / {role.label}
                      </p>

                      <h3 className="mt-3 font-serif text-3xl leading-none md:text-4xl">
                        {role.title}
                      </h3>

                      <p className="mt-4 max-w-md font-mono text-[10px] leading-6 text-[#5d5a52] md:text-[11px]">
                        {role.description}
                      </p>

                      <div className="mt-7 flex items-center gap-3 border-t border-[#cfc8b9] pt-4">

                        <span className="font-mono text-[8px] font-medium uppercase tracking-[0.15em] text-[#77736b]">
                          Continue to sign in
                        </span>

                        <ArrowRight
                          size={12}
                          style={{
                            color: role.color,
                          }}
                        />

                      </div>

                    </motion.button>
                  )
                })}

              </div>

              {/* Modal footer */}

              <div className="flex flex-col gap-3 border-t border-[#b9b1a2] px-6 py-5 sm:flex-row sm:items-center sm:justify-between md:px-8">

                <div className="flex items-center gap-3">

                  <CheckCircle2
                    size={14}
                    className="text-[#4e7659]"
                    strokeWidth={1.4}
                  />

                  <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#77736b]">
                    Role-based access / DHARA
                  </p>

                </div>

                <button
                  onClick={() => setAuthorityOpen(false)}
                  className="font-mono text-[8px] font-medium uppercase tracking-[0.15em] text-[#514b43] transition-colors hover:text-[#171714]"
                >
                  Close selection
                </button>

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

      {/* =====================================================
          02 / GIS
      ===================================================== */}

      <section
        id="gis"
        className="border-t border-[#cfc8b9] bg-[#f3efe6] px-5 py-20 md:px-10 md:py-28"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-10 grid gap-8 md:grid-cols-[1fr_2fr]">

            <div>

              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#b65f3c]">
                02 / Spatial intelligence
              </p>

              <p className="mt-6 max-w-xs font-mono text-[12px] leading-7 text-[#5d5a52]">
                Geography becomes part of the administrative record.
              </p>

            </div>

            <div>

              <h2 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                See the system
                <br />
                on the ground.
              </h2>

              <p className="mt-6 max-w-xl font-mono text-xs leading-6 text-[#5d5a52] md:text-sm">
                Explore projects spatially and connect geographic locations
                with the administrative information behind them.
              </p>

            </div>

          </div>

          <DHARAMap />

        </div>

      </section>

      {/* =====================================================
          03 / PROJECT LIFECYCLE
      ===================================================== */}

      <section
        id="workflow"
        className="border-t border-[#342721] bg-[#211915] px-5 py-20 text-[#F5F0E7] md:px-10 md:py-28"
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C96A45]">
                03 / Project lifecycle
              </p>

              <p className="mt-6 max-w-xs font-mono text-[10px] leading-6 text-[#958174]">
                Every project follows a connected sequence of administrative,
                geographic, compensation and implementation decisions.
              </p>

            </div>

            <div>

              <h2 className="font-serif text-4xl leading-[0.95] md:text-7xl">
                From proposal
                <br />
                to completion.
              </h2>

              <p className="mt-8 max-w-xl font-mono text-xs leading-6 text-[#C8B9AA]">
                One connected lifecycle showing the current stage,
                responsible authority and next action.
              </p>

            </div>

          </div>

          {/* Desktop timeline */}

          <div className="mt-16 hidden md:block">

            <div className="grid grid-cols-11">

              {workflowStages.map((stage, index) => {

                const active = index === activeStage
                const completed = index < activeStage

                return (
                  <button
                    key={stage.name}
                    onClick={() => setActiveStage(index)}
                    className="group relative text-left"
                  >

                    {index < workflowStages.length - 1 && (
                      <div className="absolute left-1/2 right-0 top-[7px] h-px bg-[#4A3730]" />
                    )}

                    <div className="relative z-10">

                      <motion.div
                        animate={{
                          scale: active ? 1.35 : 1,
                        }}
                        className={`h-3.5 w-3.5 rounded-full border ${
                          active
                            ? "border-[#C96A45] bg-[#C96A45]"
                            : completed
                              ? "border-[#C96A45] bg-[#C96A45]/40"
                              : "border-[#756258] bg-[#211915]"
                        }`}
                      />

                      <p
                        className={`mt-5 font-mono text-[8px] uppercase tracking-[0.1em] ${
                          active
                            ? "text-[#F5F0E7]"
                            : "text-[#958174] group-hover:text-[#C8B9AA]"
                        }`}
                      >
                        {stage.name}
                      </p>

                      <p className="mt-2 font-mono text-[8px] text-[#756258]">
                        {stage.number}
                      </p>

                    </div>

                  </button>
                )
              })}

            </div>

          </div>

          {/* Mobile timeline */}

          <div className="mt-14 md:hidden">

            <div className="relative ml-1">

              <div className="absolute bottom-0 left-[6px] top-0 w-px bg-[#4A3730]" />

              <div className="space-y-7">

                {workflowStages.map((stage, index) => {

                  const active = index === activeStage
                  const completed = index < activeStage

                  return (
                    <button
                      key={stage.name}
                      onClick={() => setActiveStage(index)}
                      className="relative flex w-full items-start gap-5 text-left"
                    >

                      <motion.div
                        animate={{
                          scale: active ? 1.25 : 1,
                        }}
                        className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border ${
                          active
                            ? "border-[#C96A45] bg-[#C96A45]"
                            : completed
                              ? "border-[#C96A45] bg-[#C96A45]/40"
                              : "border-[#756258] bg-[#211915]"
                        }`}
                      />

                      <div>

                        <p
                          className={`font-mono text-[9px] uppercase tracking-[0.14em] ${
                            active
                              ? "text-[#F5F0E7]"
                              : "text-[#958174]"
                          }`}
                        >
                          {stage.name}
                        </p>

                        <p className="mt-1 font-mono text-[8px] text-[#756258]">
                          {stage.number} / {stage.type}
                        </p>

                      </div>

                    </button>
                  )
                })}

              </div>

            </div>

          </div>

          {/* Stage detail */}

          <motion.div
            key={currentStage.number}
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            className="mt-16 border-t border-[#4A3730] pt-10"
          >

            <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr]">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#C96A45]">
                  Current stage / {currentStage.number}
                </p>

                <h3 className="mt-4 font-serif text-4xl md:text-5xl">
                  {currentStage.name}
                </h3>

              </div>

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#958174]">
                  What happens
                </p>

                <p className="mt-4 max-w-md font-mono text-xs leading-6 text-[#C8B9AA]">
                  {currentStage.description}
                </p>

              </div>

              <div className="grid grid-cols-2 gap-8">

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#958174]">
                    Responsible
                  </p>

                  <p className="mt-4 font-mono text-xs leading-5 text-[#F5F0E7]">
                    {currentStage.authority}
                  </p>

                </div>

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#958174]">
                    Next action
                  </p>

                  <p className="mt-4 font-mono text-xs leading-5 text-[#C96A45]">
                    {currentStage.next}
                  </p>

                </div>

              </div>

            </div>

            <div className="mt-12">

              <div className="flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.12em]">

                <span className="text-[#756258]">
                  System state
                </span>

                <span className="text-[#C8B9AA]">
                  {currentStage.state}
                </span>

              </div>

              <div className="mt-3 h-px bg-[#4A3730]">

                <motion.div
                  animate={{
                    width: `${
                      ((activeStage + 1) /
                        workflowStages.length) *
                      100
                    }%`,
                  }}
                  transition={{
                    duration: 0.5,
                  }}
                  className="h-full bg-[#C96A45]"
                />

              </div>

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#cfc8b9] bg-[#f3efe6] px-5 py-8 md:px-10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#514b43] md:flex-row md:items-center md:justify-between">

          <span>
            DHARA / National Land System
          </span>

          <span>
            Portals · Spatial Intelligence · Lifecycle
          </span>

          <span>
            Prototype / 2026
          </span>

        </div>

      </footer>

    </main>
  )
}

export default Landing