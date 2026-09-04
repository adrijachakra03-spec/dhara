import { motion } from "framer-motion"
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Crosshair,
  Landmark,
  MapPin,
  Menu,
  Shield,
  Users,
} from "lucide-react"
import { useState } from "react"

import DHARAMap from "./gis/DHARAMap"

const activity = [
  { top: "22%", left: "31%" },
  { top: "34%", left: "52%" },
  { top: "48%", left: "67%" },
  { top: "61%", left: "44%" },
  { top: "72%", left: "58%" },
]

const workflowStages = [
  {
    name: "Proposal",
    number: "01",
    type: "ENTRY",
    authority: "Project Authority",
    next: "Scrutiny",
    description:
      "A land requirement enters DHARA with the project proposal, required area and supporting records.",
    state: "Project initiated",
  },
  {
    name: "Scrutiny",
    number: "02",
    type: "REVIEW",
    authority: "District Authority",
    next: "Approval",
    description:
      "The submitted requirement is reviewed against land records, geography and administrative requirements.",
    state: "Under district review",
  },
  {
    name: "Approval",
    number: "03",
    type: "DECISION",
    authority: "Competent Authority",
    next: "Notification",
    description:
      "The acquisition proposal reaches the appropriate authority for a formal decision.",
    state: "Decision pending",
  },
  {
    name: "Notification",
    number: "04",
    type: "FORMAL",
    authority: "State Authority",
    next: "Award",
    description:
      "The approved acquisition enters the formal notification stage and affected land becomes visible in the system.",
    state: "Statutory process",
  },
  {
    name: "Award",
    number: "05",
    type: "ASSESSMENT",
    authority: "Land Acquisition Officer",
    next: "Compensation",
    description:
      "Land and affected interests are assessed and the award is recorded against the relevant parcels.",
    state: "Award assessment",
  },
  {
    name: "Compensation",
    number: "06",
    type: "SETTLEMENT",
    authority: "District Administration",
    next: "Possession",
    description:
      "Compensation moves through verification, approval and settlement before possession can proceed.",
    state: "Settlement in progress",
  },
  {
    name: "Possession",
    number: "07",
    type: "TRANSFER",
    authority: "Project Authority",
    next: "R&R",
    description:
      "Possession of acquired land is recorded and the project moves toward rehabilitation and resettlement.",
    state: "Transfer stage",
  },
  {
    name: "R&R",
    number: "08",
    type: "PEOPLE",
    authority: "R&R Authority",
    next: "Closure",
    description:
      "Affected and displaced families are tracked through the rehabilitation and resettlement process.",
    state: "People and outcomes",
  },
  {
    name: "Closure",
    number: "09",
    type: "COMPLETE",
    authority: "System Authority",
    next: "Complete",
    description:
      "The acquisition record reaches completion with the final administrative state preserved in DHARA.",
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
      "The starting point for organisations requiring land for infrastructure and development.",
    question: "What needs action?",
    metrics: [
      ["24", "Active projects"],
      ["08", "Pending submissions"],
      ["13", "Scrutiny responses"],
    ],
    actions: [
      "Create project proposals",
      "Submit acquisition requests",
      "Upload supporting documents",
      "Define required land",
      "Track proposal status",
    ],
    icon: Landmark,
  },
  {
    id: "district",
    number: "02",
    label: "ADMINISTRATIVE LAYER",
    title: "District Authority",
    description:
      "The district-level administrative view where scrutiny, verification and coordination happen.",
    question: "Which cases require attention?",
    metrics: [
      ["138", "Pending cases"],
      ["42", "Under scrutiny"],
      ["17", "Escalations"],
    ],
    actions: [
      "Review proposals",
      "Verify records",
      "Approve or recommend",
      "Monitor projects",
      "Coordinate authorities",
    ],
    icon: Shield,
  },
  {
    id: "field",
    number: "03",
    label: "GROUND LAYER",
    title: "Field Officer",
    description:
      "A mobile-first field view connecting physical land with the administrative record.",
    question: "What is happening on ground?",
    metrics: [
      ["86", "Verifications"],
      ["31", "Parcels today"],
      ["12", "Evidence pending"],
    ],
    actions: [
      "Verify parcels",
      "Geo-tag land",
      "Capture evidence",
      "Update field status",
      "Record observations",
    ],
    icon: MapPin,
  },
  {
    id: "state",
    number: "04",
    label: "AGGREGATION LAYER",
    title: "State",
    description:
      "An aggregation view showing how projects and districts are performing across the state.",
    question: "How is the state performing?",
    metrics: [
      ["36", "Districts"],
      ["248", "Active projects"],
      ["19", "Delayed projects"],
    ],
    actions: [
      "Compare districts",
      "Monitor delays",
      "Track land acquired",
      "Review compensation",
      "Escalate issues",
    ],
    icon: Landmark,
  },
  {
    id: "central",
    number: "05",
    label: "NATIONAL LAYER",
    title: "Central",
    description:
      "A national command layer for understanding land acquisition across India.",
    question: "What is happening nationally?",
    metrics: [
      ["1,284", "Projects"],
      ["18.4K", "Parcels"],
      ["₹4.8B", "Compensation"],
    ],
    actions: [
      "View national trends",
      "Compare states",
      "Identify delays",
      "Monitor timelines",
      "Drill into projects",
    ],
    icon: Crosshair,
  },
  {
    id: "citizen",
    number: "06",
    label: "TRANSPARENCY LAYER",
    title: "Citizen",
    description:
      "A radically simpler view helping people understand what is happening with their land.",
    question: "What happens to my land?",
    metrics: [
      ["01", "Parcel search"],
      ["06", "Lifecycle states"],
      ["24/7", "Status access"],
    ],
    actions: [
      "Search Project ID",
      "Search Parcel ID",
      "View current status",
      "Track compensation",
      "Understand what happens next",
    ],
    icon: Users,
  },
]

const portalColors = [
  {
    bg: "#ead0c3",
    active: "#b65f3c",
    text: "#7b3925",
  },
  {
    bg: "#e7d8b7",
    active: "#a47a32",
    text: "#70521d",
  },
  {
    bg: "#c8ddd8",
    active: "#357b76",
    text: "#245c58",
  },
  {
    bg: "#cbd8e5",
    active: "#496d91",
    text: "#34536f",
  },
  {
    bg: "#d0cce0",
    active: "#5b547f",
    text: "#494267",
  },
  {
    bg: "#cadbcf",
    active: "#4e7659",
    text: "#35563f",
  },
]

function App() {
  const [activeStage, setActiveStage] = useState(0)
  const [activePortal, setActivePortal] = useState(0)

  const currentStage = workflowStages[activeStage]
  const currentPortal = portals[activePortal]
  const PortalIcon = currentPortal.icon
  const currentPortalColor = portalColors[activePortal]

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3efe6] text-[#171714]">

      {/* =====================================================
          NAVIGATION
      ====================================================== */}

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


        <div className="hidden items-center gap-8 font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52] md:flex">

          <a
            href="#system"
            className="transition-colors hover:text-[#b65f3c]"
          >
            System
          </a>

          <a
            href="#workflow"
            className="transition-colors hover:text-[#b65f3c]"
          >
            Workflow
          </a>

          <a
            href="#gis"
            className="transition-colors hover:text-[#b65f3c]"
          >
            GIS
          </a>

          <a
            href="#portals"
            className="transition-colors hover:text-[#b65f3c]"
          >
            Portals
          </a>

        </div>


        <div className="flex items-center gap-4">

          <div className="hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] sm:flex">
            <span className="h-2 w-2 rounded-full bg-[#b65f3c]" />
            Live System
          </div>

          <button
            className="flex h-9 w-9 items-center justify-center border border-[#cfc8b9] md:hidden"
            aria-label="Open menu"
          >
            <Menu size={16} strokeWidth={1.5} />
          </button>

        </div>

      </nav>


      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative min-h-[calc(100svh-73px)] overflow-hidden">

        <div className="absolute inset-0 overflow-hidden">

          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: `
                linear-gradient(rgba(23,23,20,0.065) 1px, transparent 1px),
                linear-gradient(90deg, rgba(23,23,20,0.065) 1px, transparent 1px)
              `,
              backgroundSize: "70px 70px",
            }}
          />

          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(32deg, transparent 48%, rgba(182,95,60,0.16) 49%, transparent 50%),
                linear-gradient(-18deg, transparent 48%, rgba(23,23,20,0.11) 49%, transparent 50%)
              `,
              backgroundSize: "260px 220px",
            }}
          />

          <motion.div
            animate={{
              rotate: [0, 1, 0, -1, 0],
              scale: [1, 1.015, 1],
            }}
            transition={{
              duration: 14,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-[5%] top-[14%] h-[58%] w-[88%] border border-[#171714]/15 md:left-[10%] md:w-[75%]"
            style={{
              clipPath:
                "polygon(8% 4%, 76% 0%, 96% 19%, 89% 82%, 58% 94%, 18% 86%, 0% 52%)",
            }}
          />

          <div
            className="absolute left-[17%] top-[26%] h-[35%] w-[58%] border border-[#b65f3c]/15"
            style={{
              clipPath:
                "polygon(5% 12%, 80% 0%, 100% 34%, 86% 100%, 22% 85%, 0% 42%)",
            }}
          />

          {activity.map((point, index) => (
            <motion.div
              key={`${point.top}-${point.left}`}
              className="absolute"
              style={{
                top: point.top,
                left: point.left,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3,
                delay: index * 0.5,
                repeat: Infinity,
              }}
            >
              <div className="relative">

                <span className="absolute -inset-2 rounded-full border border-[#b65f3c]/25" />

                <span className="block h-2 w-2 rounded-full bg-[#b65f3c]" />

              </div>
            </motion.div>
          ))}

          <div className="absolute bottom-6 left-5 font-mono text-[8px] leading-5 tracking-[0.12em] text-[#5d5a52] md:bottom-8 md:left-10">
            <div>20°35'12"N</div>
            <div>78°57'41"E</div>
          </div>

          <div className="absolute right-5 top-6 flex items-center gap-2 font-mono text-[8px] uppercase tracking-[0.15em] text-[#5d5a52] md:right-10 md:top-8">
            <Crosshair size={12} strokeWidth={1} />
            National spatial layer
          </div>

        </div>


        <div className="relative z-10 flex min-h-[calc(100svh-73px)] flex-col px-5 py-8 md:px-10 md:py-12">

          <div>

            <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#5d5a52]">
              India / Land Acquisition / 01
            </p>

            <h1 className="mt-8 max-w-4xl font-serif text-[clamp(3.5rem,10vw,8rem)] leading-[0.86] tracking-[-0.045em]">
              Making
              <br />
              <span className="text-[#b65f3c]">
                land visible.
              </span>
            </h1>

            <p className="mt-8 max-w-lg font-mono text-xs leading-6 text-[#5d5a52] md:text-sm">
              One connected system for the movement of land,
              documents, authorities, decisions and people.
            </p>

          </div>


          <div className="mt-auto flex flex-col gap-8 pb-2 pt-16 md:flex-row md:items-end md:justify-between">

            <div className="max-w-md border-l border-[#b65f3c] pl-4">

              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#b65f3c]">
                The premise
              </p>

              <p className="mt-3 font-serif text-xl leading-tight md:text-2xl">
                A piece of land enters a system.
                <br />
                DHARA lets you see what happens next.
              </p>

            </div>


            <motion.a
              href="#system"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="group flex w-fit items-center gap-4 border border-[#171714] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.18em]"
            >
              Explore the system

              <ArrowDown
                size={14}
                className="transition-transform group-hover:translate-y-1"
              />
            </motion.a>

          </div>

        </div>

      </section>


      {/* =====================================================
          SYSTEM
      ====================================================== */}

      <section
        id="system"
        className="border-t border-[#cfc8b9] bg-[#e9e3d7] px-5 py-16 md:px-10 md:py-24"
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#b65f3c]">
                02 / System logic
              </p>

              <p className="mt-6 max-w-xs font-mono text-xs leading-6 text-[#5d5a52]">
                Every acquisition is a journey through
                geography, administration, documentation
                and human decisions.
              </p>

            </div>


            <div>

              <h2 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                From the country
                <br />
                to a single parcel.
              </h2>

              <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#5d5a52]">

                <span>India</span>
                <ArrowUpRight size={12} />

                <span>State</span>
                <ArrowUpRight size={12} />

                <span>District</span>
                <ArrowUpRight size={12} />

                <span>Project</span>
                <ArrowUpRight size={12} />

                <span>Parcel</span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          GIS
      ====================================================== */}

      <section
        id="gis"
        className="border-t border-[#cfc8b9] bg-[#f3efe6] px-5 py-16 md:px-10 md:py-24"
      >

        <div className="mx-auto max-w-7xl">

          <div className="mb-10 grid gap-8 md:grid-cols-[1fr_2fr]">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#b65f3c]">
                03 / Spatial intelligence
              </p>

            </div>

            <div>

              <h2 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                Every acquisition
                <br />
                exists somewhere.
              </h2>

              <p className="mt-6 max-w-xl font-mono text-xs leading-6 text-[#5d5a52]">
                Connect the administrative record to the
                physical land through one geographic layer.
              </p>

            </div>

          </div>

          <DHARAMap />

        </div>

      </section>


      {/* =====================================================
          WORKFLOW
      ====================================================== */}

      <section
        id="workflow"
        className="border-t border-[#342721] bg-[#211915] px-5 py-20 text-[#F5F0E7] md:px-10 md:py-28"
      >

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">

            <div>

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#C96A45]">
                04 / Acquisition lifecycle
              </p>

              <p className="mt-6 max-w-xs font-mono text-[10px] leading-6 text-[#958174]">
                The parcel does not simply move through time.
                It moves between people, authorities and decisions.
              </p>

            </div>


            <div>

              <h2 className="font-serif text-4xl leading-[0.95] md:text-7xl">
                Land moves
                <br />
                through decisions.
              </h2>

              <p className="mt-8 max-w-xl font-mono text-xs leading-6 text-[#C8B9AA]">
                Proposal to closure. One connected lifecycle
                showing what happens, who is responsible and
                what comes next.
              </p>

            </div>

          </div>


          {/* DESKTOP TIMELINE */}

          <div className="mt-16 hidden md:block">

            <div className="grid grid-cols-9">

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


          {/* MOBILE TIMELINE */}

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


          {/* STAGE DETAIL */}

          <motion.div
            key={currentStage.number}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
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
                    width: `${((activeStage + 1) / workflowStages.length) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-[#C96A45]"
                />

              </div>

            </div>

          </motion.div>

        </div>

      </section>


      {/* =====================================================
          PORTALS
      ====================================================== */}

      <section
        id="portals"
        className="border-t border-[#cfc8b9] bg-[#e9e3d7] px-5 py-20 md:px-10 md:py-28"
      >

        <div className="mx-auto max-w-7xl">

          {/* INTRO */}

          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">

            <div>

              <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#9f4d31]">
                05 / Connected views
              </p>

              <p className="mt-6 max-w-xs font-mono text-[13px] leading-7 text-[#403c36]">
                Different responsibilities.
                One underlying land record.
                One connected national system.
              </p>

            </div>


            <div>

              <h2 className="max-w-4xl font-serif text-4xl leading-[0.95] tracking-tight md:text-6xl">
                One system.
                <br />
                Different responsibilities.
              </h2>

              <p className="mt-8 max-w-xl font-mono text-[13px] leading-7 text-[#403c36] md:text-sm">
                Company, district, field, state, central and
                citizen experiences operate on the same
                underlying system.
              </p>

            </div>

          </div>


          {/* PORTAL GRID */}

          <div className="mt-16 grid gap-2 md:grid-cols-2 lg:grid-cols-3">

            {portals.map((portal, index) => {

              const Icon = portal.icon
              const active = activePortal === index
              const color = portalColors[index]

              return (
                <motion.button
                  key={portal.id}
                  onClick={() => setActivePortal(index)}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    backgroundColor: active
                      ? color.active
                      : color.bg,
                  }}
                  className="group relative min-h-[290px] overflow-hidden p-6 text-left transition-all duration-300 md:p-8"
                >

                  {/* TOP ACCENT */}

                  <motion.div
                    animate={{
                      width: active ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.35 }}
                    style={{
                      backgroundColor: active
                        ? "#ffffff"
                        : color.active,
                    }}
                    className="absolute left-0 top-0 h-1"
                  />


                  {/* HEADER */}

                  <div className="flex items-start justify-between">

                    <span
                      style={{
                        color: active
                          ? "#ffffff"
                          : color.text,
                      }}
                      className="font-mono text-[10px] font-medium tracking-[0.16em]"
                    >
                      {portal.number}
                    </span>


                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border ${
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


                  {/* CONTENT */}

                  <div className="mt-14">

                    <p
                      className={`font-mono text-[10px] font-medium uppercase tracking-[0.16em] ${
                        active
                          ? "text-white/85"
                          : "text-[#514b43]"
                      }`}
                    >
                      {portal.label}
                    </p>


                    <h3
                      className={`mt-2 font-serif text-3xl md:text-4xl ${
                        active
                          ? "text-white"
                          : "text-[#171714]"
                      }`}
                    >
                      {portal.title}
                    </h3>


                    <p
                      className={`mt-4 max-w-sm font-mono text-[11px] leading-6 md:text-xs ${
                        active
                          ? "text-white/90"
                          : "text-[#403c36]"
                      }`}
                    >
                      {portal.description}
                    </p>

                  </div>


                  {/* FOOTER */}

                  <div
                    className={`absolute bottom-7 left-6 right-6 flex items-center justify-between border-t pt-4 md:left-8 md:right-8 ${
                      active
                        ? "border-white/25"
                        : "border-black/15"
                    }`}
                  >

                    <span
                      className={`font-mono text-[9px] font-medium uppercase tracking-[0.14em] ${
                        active
                          ? "text-white/80"
                          : "text-[#514b43]"
                      }`}
                    >
                      Open view
                    </span>


                    <motion.div
                      animate={{
                        x: active ? 3 : 0,
                        y: active ? -3 : 0,
                      }}
                    >

                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.4}
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              backgroundColor: "#eee8dc",
              borderTopColor: currentPortalColor.active,
            }}
            className="mt-16 border-t-2 px-5 py-8 md:px-8 md:py-10"
          >

            <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr]">

              {/* LEFT */}

              <div>

                <div className="flex items-center gap-4">

                  <div
                    className="flex h-11 w-11 items-center justify-center border"
                    style={{
                      borderColor: currentPortalColor.active,
                    }}
                  >

                    <PortalIcon
                      size={18}
                      strokeWidth={1.2}
                      style={{
                        color: currentPortalColor.active,
                      }}
                    />

                  </div>


                  <div>

                    <p
                      style={{
                        color: currentPortalColor.active,
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


                <p className="mt-6 max-w-lg font-mono text-[13px] leading-7 text-[#3f3b35] md:text-sm">
                  {currentPortal.description}
                </p>


                <div
                  className="mt-10 inline-flex items-center gap-3 border-l-2 pl-4"
                  style={{
                    borderColor: currentPortalColor.active,
                  }}
                >

                  <span
                    style={{
                      color: currentPortalColor.active,
                    }}
                    className="font-mono text-[10px] font-medium uppercase tracking-[0.12em]"
                  >
                    {currentPortal.question}
                  </span>

                  <ArrowRight
                    size={14}
                    style={{
                      color: currentPortalColor.active,
                    }}
                  />

                </div>

              </div>


              {/* RIGHT */}

              <div>

                {/* METRICS */}

                <div className="grid grid-cols-3 border-y border-[#b9b1a2]">

                  {currentPortal.metrics.map(([value, label]) => (
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
                  ))}

                </div>


                {/* ACTIONS */}

                <div className="mt-8">

                  <p
                    style={{
                      color: currentPortalColor.active,
                    }}
                    className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
                  >
                    Available actions
                  </p>


                  <div className="mt-5 divide-y divide-[#c1b9aa] border-y border-[#b9b1a2]">

                    {currentPortal.actions.map((action, index) => (
                      <div
                        key={action}
                        className="flex items-center justify-between py-4"
                      >

                        <div className="flex items-center gap-4">

                          <span className="font-mono text-[9px] font-medium text-[#77736b]">
                            0{index + 1}
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
                    ))}

                  </div>

                </div>

              </div>

            </div>

          </motion.div>


          {/* SYSTEM CONNECTION */}

          <div className="mt-20 border-t border-[#b9b1a2] pt-8">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div>

                <p className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#514b43]">
                  Shared system layer
                </p>

                <p className="mt-3 font-serif text-xl">
                  Same land. Different perspective.
                </p>

              </div>


              <div className="flex flex-wrap items-center gap-3 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#514b43]">

                <span>Project</span>
                <ArrowRight size={11} />

                <span>District</span>
                <ArrowRight size={11} />

                <span>Field</span>
                <ArrowRight size={11} />

                <span>State</span>
                <ArrowRight size={11} />

                <span>Central</span>
                <ArrowRight size={11} />

                <span>Citizen</span>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="border-t border-[#cfc8b9] bg-[#f3efe6] px-5 py-8 md:px-10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#514b43] md:flex-row md:items-center md:justify-between">

          <span>
            DHARA / National Land System
          </span>

          <span>
            Spatial intelligence · Workflow · People
          </span>

          <span>
            Prototype / 2026
          </span>

        </div>

      </footer>

    </main>
  )
}

export default App