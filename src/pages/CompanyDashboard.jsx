import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  FileText,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const fallbackProjects = [
  {
    id: "DH-MH-2026-001",
    name: "Eastern Industrial Corridor",
    location: "Pune, Maharashtra",
    land: "248 acres",
    parcels: 42,
    stage: "District Scrutiny",
    status: "In progress",
  },
  {
    id: "DH-MH-2026-002",
    name: "Logistics & Manufacturing Hub",
    location: "Nashik, Maharashtra",
    land: "126 acres",
    parcels: 19,
    stage: "Proposal Submitted",
    status: "Awaiting review",
  },
]

function CompanyDashboard() {
  const navigate = useNavigate()

  const [projects, setProjects] = useState([])

  useEffect(() => {
    try {
      const storedProjects = JSON.parse(
        localStorage.getItem("dhara-projects") || "[]"
      )

      if (Array.isArray(storedProjects) && storedProjects.length > 0) {
        setProjects(storedProjects)
      } else {
        setProjects(fallbackProjects)
      }
    } catch {
      setProjects(fallbackProjects)
    }
  }, [])

  const totalProjects = projects.length

  const pendingProjects = projects.filter(
    (project) =>
      project.status === "Pending" ||
      project.status === "Awaiting review"
  ).length

  const activeProjects = projects.filter(
    (project) =>
      project.status === "In progress" ||
      project.status === "Pending"
  ).length

  const handleOpenProject = (projectId) => {
    if (!projectId) return

    navigate(`/portal/company/project/${projectId}`)
  }

  return (
    <main className="min-h-screen bg-[#f3efe6] text-[#171714]">

      {/* HEADER */}

      <header className="border-b border-[#cfc8b9] bg-[#f3efe6]">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >

            <div className="flex h-8 w-8 items-center justify-center border border-[#171714]">
              <span className="font-mono text-xs">
                D
              </span>
            </div>

            <div className="text-left">

              <p className="font-serif text-lg leading-none">
                DHARA
              </p>

              <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-[#5d5a52]">
                Project Authority Portal
              </p>

            </div>

          </button>


          <div className="hidden items-center gap-6 md:flex">

            <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#5d5a52]">
              <span className="h-2 w-2 rounded-full bg-[#4e7659]" />
              Connected to DHARA
            </div>

            <button
              onClick={() => navigate("/signin")}
              className="border border-[#b9b1a2] px-4 py-2 font-mono text-[9px] uppercase tracking-[0.14em] transition hover:bg-[#e9e3d7]"
            >
              Sign out
            </button>

          </div>

        </div>

      </header>


      {/* MAIN */}

      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-16">

        {/* TOP */}

        <div className="flex flex-col gap-8 border-b border-[#cfc8b9] pb-10 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#b65f3c]">
              Project Authority / Company
            </p>

            <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[0.95] md:text-6xl">
              Your projects.
              <br />
              Your land requirements.
            </h1>

            <p className="mt-6 max-w-xl font-mono text-xs leading-6 text-[#5d5a52]">
              Submit project requirements, provide supporting information
              and follow the government-controlled land acquisition
              workflow from one place.
            </p>

          </div>


          <button
            onClick={() => navigate("/portal/company/propose")}
            className="group flex w-fit items-center gap-4 bg-[#b65f3c] px-6 py-4 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#82442e]"
          >

            <Plus size={15} strokeWidth={1.5} />

            Propose a project

            <ArrowRight
              size={14}
              className="transition-transform group-hover:translate-x-1"
            />

          </button>

        </div>


        {/* STATS */}

        <div className="grid grid-cols-2 border-b border-[#cfc8b9] md:grid-cols-4">

          <div className="border-r border-[#cfc8b9] px-4 py-7 md:px-6">

            <p className="font-serif text-4xl">
              {totalProjects}
            </p>

            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#5d5a52]">
              Total projects
            </p>

          </div>


          <div className="border-b border-[#cfc8b9] px-4 py-7 md:border-b-0 md:border-r md:px-6">

            <p className="font-serif text-4xl">
              {activeProjects}
            </p>

            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#5d5a52]">
              Active projects
            </p>

          </div>


          <div className="border-r border-[#cfc8b9] px-4 py-7 md:px-6">

            <p className="font-serif text-4xl">
              {pendingProjects}
            </p>

            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#5d5a52]">
              Awaiting review
            </p>

          </div>


          <div className="px-4 py-7 md:px-6">

            <p className="font-serif text-4xl">
              DHARA
            </p>

            <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#5d5a52]">
              Connected system
            </p>

          </div>

        </div>


        {/* QUICK ACTIONS */}

        <div className="mt-12">

          <div className="flex items-center justify-between">

            <div>

              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#b65f3c]">
                Actions
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Project management
              </h2>

            </div>

          </div>


          <div className="mt-6 grid gap-3 md:grid-cols-3">

            <button
              onClick={() => navigate("/portal/company/propose")}
              className="group border border-[#cfc8b9] bg-[#e9e3d7] p-6 text-left transition hover:-translate-y-1 hover:border-[#b65f3c]"
            >

              <FileText
                size={19}
                strokeWidth={1.2}
                className="text-[#b65f3c]"
              />

              <h3 className="mt-8 font-serif text-2xl">
                New proposal
              </h3>

              <p className="mt-3 font-mono text-[10px] leading-5 text-[#5d5a52]">
                Define your project and submit the required land
                requirement.
              </p>

              <div className="mt-6 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
                Start proposal
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>

            </button>


            <button
              onClick={() => {
                if (projects.length > 0) {
                  handleOpenProject(projects[0].id)
                }
              }}
              className="group border border-[#cfc8b9] bg-[#e9e3d7] p-6 text-left transition hover:-translate-y-1 hover:border-[#4e7659]"
            >

              <Search
                size={19}
                strokeWidth={1.2}
                className="text-[#4e7659]"
              />

              <h3 className="mt-8 font-serif text-2xl">
                Track project
              </h3>

              <p className="mt-3 font-mono text-[10px] leading-5 text-[#5d5a52]">
                Follow the latest administrative stage and see what
                happens next.
              </p>

              <div className="mt-6 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em]">
                Open latest project
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </div>

            </button>


            <div className="border border-[#cfc8b9] bg-[#eee8dc] p-6">

              <ShieldCheck
                size={19}
                strokeWidth={1.2}
                className="text-[#496d91]"
              />

              <h3 className="mt-8 font-serif text-2xl">
                Government workflow
              </h3>

              <p className="mt-3 font-mono text-[10px] leading-5 text-[#5d5a52]">
                Your proposal is routed through the responsible
                government authorities. Administrative decisions remain
                with the appropriate authority.
              </p>

            </div>

          </div>

        </div>


        {/* PROJECTS */}

        <div className="mt-16">

          <div className="flex flex-col gap-3 border-b border-[#cfc8b9] pb-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-[#b65f3c]">
                Project register
              </p>

              <h2 className="mt-3 font-serif text-3xl">
                Your submitted projects
              </h2>

            </div>

            <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#77736b]">
              {projects.length} record{projects.length === 1 ? "" : "s"}
            </p>

          </div>


          <div className="mt-5 space-y-3">

            {projects.length === 0 ? (

              <div className="border border-dashed border-[#b9b1a2] px-6 py-12 text-center">

                <ClipboardList
                  size={24}
                  strokeWidth={1.2}
                  className="mx-auto text-[#8b857b]"
                />

                <p className="mt-5 font-serif text-2xl">
                  No projects yet
                </p>

                <p className="mx-auto mt-3 max-w-md font-mono text-[10px] leading-5 text-[#77736b]">
                  Submit your first project proposal to begin the
                  government review workflow.
                </p>

              </div>

            ) : (

              projects.map((project, index) => (

                <motion.div
                  key={`${project.id}-${index}`}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="border border-[#cfc8b9] bg-[#eee8dc] p-5 md:p-7"
                >

                  <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

                    {/* PROJECT INFO */}

                    <div className="min-w-0">

                      <div className="flex flex-wrap items-center gap-3">

                        <span className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#b65f3c]">
                          {project.id}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-[#b9b1a2]" />

                        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#77736b]">
                          {project.status || "Pending"}
                        </span>

                      </div>


                      <h3 className="mt-4 font-serif text-2xl md:text-3xl">
                        {project.projectName || project.name}
                      </h3>


                      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[9px] uppercase tracking-[0.08em] text-[#5d5a52]">

                        <span className="flex items-center gap-2">
                          <MapPin size={12} />
                          {project.location ||
                            `${project.district || "District"}, ${
                              project.state || "State"
                            }`}
                        </span>

                        <span>
                          {project.landArea
                            ? `${project.landArea} acres`
                            : project.land}
                        </span>

                        <span>
                          {project.parcels} parcels
                        </span>

                      </div>

                    </div>


                    {/* STAGE + ACTION */}

                    <div className="flex flex-col gap-5 border-t border-[#cfc8b9] pt-5 lg:min-w-[330px] lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">

                      <div>

                        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#77736b]">
                          Current stage
                        </p>

                        <p className="mt-2 font-serif text-xl">
                          {project.stage || "Proposal Submitted"}
                        </p>

                      </div>


                      <button
                        onClick={() =>
                          handleOpenProject(project.id)
                        }
                        className="group flex w-full items-center justify-between border border-[#171714] bg-[#171714] px-5 py-3.5 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#f3efe6] transition hover:bg-[#b65f3c] hover:border-[#b65f3c]"
                      >

                        <span>
                          Track project
                        </span>

                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />

                      </button>

                    </div>

                  </div>

                </motion.div>

              ))

            )}

          </div>

        </div>


        {/* SYSTEM NOTE */}

        <div className="mt-16 border-l-2 border-[#b65f3c] bg-[#e9e3d7] px-6 py-6 md:px-8">

          <div className="flex gap-4">

            <ShieldCheck
              size={18}
              strokeWidth={1.2}
              className="mt-1 shrink-0 text-[#b65f3c]"
            />

            <div>

              <p className="font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-[#b65f3c]">
                System responsibility
              </p>

              <p className="mt-3 max-w-3xl font-mono text-[10px] leading-6 text-[#514b43]">
                Companies initiate project proposals and define their
                land requirements. Review, verification, approval,
                acquisition and subsequent administrative actions are
                performed by the responsible government authorities.
                DHARA connects these stages without transferring
                government authority to the company.
              </p>

            </div>

          </div>

        </div>


        {/* BACK */}

        <button
          onClick={() => navigate("/")}
          className="mt-10 flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.14em] text-[#5d5a52] transition hover:text-[#b65f3c]"
        >

          <ArrowLeft size={13} />

          Back to DHARA

        </button>

      </section>


      {/* FOOTER */}

      <footer className="border-t border-[#cfc8b9] px-5 py-7 md:px-10">

        <div className="mx-auto flex max-w-7xl flex-col gap-3 font-mono text-[8px] uppercase tracking-[0.14em] text-[#77736b] md:flex-row md:items-center md:justify-between">

          <span>
            DHARA / Project Authority Portal
          </span>

          <span>
            Government-connected land workflow
          </span>

          <span>
            Prototype / 2026
          </span>

        </div>

      </footer>

    </main>
  )
}

export default CompanyDashboard