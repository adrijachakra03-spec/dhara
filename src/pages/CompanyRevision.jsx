import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  AlertTriangle,
} from "lucide-react"
import { motion } from "framer-motion"

function CompanyRevision() {
  const navigate = useNavigate()
  const { projectId } = useParams()

  const [project, setProject] = useState(null)
  const [remarks, setRemarks] = useState("")
  const [landArea, setLandArea] = useState("")
  const [parcels, setParcels] = useState("")
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    const projects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const foundProject = projects.find(
      (item) => item.id === projectId
    )

    setProject(foundProject || null)

    if (foundProject) {
      setLandArea(
        foundProject.landArea || foundProject.land || ""
      )

      setParcels(foundProject.parcels || "")
    }
  }, [projectId])

  const handleResubmit = () => {
    if (!remarks.trim()) return

    const projects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const updatedProjects = projects.map((item) => {
      if (item.id !== projectId) return item

      return {
        ...item,

        landArea: landArea.trim(),
        parcels: parcels.trim(),

        stage: "District Scrutiny",
        status: "Resubmitted",
        authority: "District Authority",
        nextAction: "District Authority Review",

        companyRevisionRemarks: remarks.trim(),
        companyRevisionAt: new Date().toISOString(),

        districtDecision: null,
        districtDecisionAt: null,

        fieldVerification: null,
        fieldVerificationRemarks: null,
        fieldVerificationAt: null,
      }
    })

    localStorage.setItem(
      "dhara-projects",
      JSON.stringify(updatedProjects)
    )

    setSubmitted(true)
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[var(--paper)] px-5 py-10 text-[var(--ink)]">
        <div className="mx-auto max-w-5xl">
          <button
            onClick={() => navigate("/portal/company")}
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)]"
          >
            <ArrowLeft size={14} />
            Back to company portal
          </button>

          <div className="mt-8 border border-[var(--line)] bg-[var(--white)] p-8">
            <h1 className="font-serif text-3xl">
              Project not found
            </h1>
          </div>
        </div>
      </main>
    )
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[var(--paper)] px-5 py-10 text-[var(--ink)]">
        <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full border border-[var(--line)] bg-[var(--white)] p-8 text-center md:p-12"
          >
            <CheckCircle2
              size={44}
              strokeWidth={1.4}
              className="mx-auto text-[var(--earth)]"
            />

            <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--earth)]">
              Revision submitted
            </p>

            <h1 className="mt-3 font-serif text-3xl md:text-4xl">
              Project sent back for review.
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--ink-soft)]">
              Your revised project has been resubmitted to the
              District Authority. The same project record continues
              through the DHARA workflow.
            </p>

            <button
              onClick={() =>
                navigate(
                  `/portal/company/project/${project.id}`
                )
              }
              className="mt-8 bg-[var(--ink)] px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)]"
            >
              View project
            </button>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* HEADER */}

      <header className="border-b border-[var(--line)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">

          <button
            onClick={() =>
              navigate(
                `/portal/company/project/${project.id}`
              )
            }
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-soft)] transition hover:text-[var(--earth)]"
          >
            <ArrowLeft size={14} />
            Project record
          </button>

          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
            Company revision
          </span>

        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-12">

        {/* TITLE */}

        <section className="border-b border-[var(--line)] pb-8">

          <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--earth)]">
            Revision required · {project.id}
          </p>

          <h1 className="mt-3 max-w-4xl font-serif text-3xl leading-tight md:text-5xl">
            {project.projectName || project.name}
          </h1>

          <div className="mt-5 flex flex-wrap gap-5 font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">

            <span className="flex items-center gap-2">
              <MapPin size={13} />
              {project.district}, {project.state}
            </span>

            <span className="flex items-center gap-2">
              <LandPlot size={13} />
              {project.landArea || project.land} acres
            </span>

            <span>
              {project.parcels || 0} parcels
            </span>

          </div>

        </section>

        {/* ISSUE */}

        <section className="mt-8 border border-[var(--line)] bg-[var(--white)]">

          <div className="flex gap-4 border-b border-[var(--line)] p-6 md:p-8">

            <AlertTriangle
              size={22}
              strokeWidth={1.4}
              className="mt-1 shrink-0 text-[var(--earth)]"
            />

            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)]">
                Field verification issue
              </p>

              <h2 className="mt-2 font-serif text-2xl">
                Action required from project authority
              </h2>

              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                The Field Officer identified an issue during field
                verification. Review the recorded findings below and
                submit the corrected information.
              </p>
            </div>

          </div>

          <div className="p-6 md:p-8">

            <p className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
              Field Officer remarks
            </p>

            <div className="mt-3 border-l-2 border-[var(--earth)] bg-[var(--paper)] p-5">
              <p className="text-sm leading-7 text-[var(--ink-soft)]">
                {project.fieldVerificationRemarks ||
                  "No detailed remarks were recorded."}
              </p>
            </div>

          </div>

        </section>

        {/* REVISION FORM */}

        <section className="mt-6 border border-[var(--line)] bg-[var(--white)]">

          <div className="border-b border-[var(--line)] p-6 md:p-8">

            <div className="flex items-center gap-3">
              <FileText
                size={19}
                strokeWidth={1.4}
                className="text-[var(--earth)]"
              />

              <h2 className="font-serif text-2xl">
                Correct project information
              </h2>
            </div>

            <p className="mt-3 text-sm leading-6 text-[var(--ink-soft)]">
              Update the information that requires correction and
              explain the changes made.
            </p>

          </div>

          <div className="space-y-6 p-6 md:p-8">

            {/* LAND AREA + PARCELS */}

            <div className="grid gap-5 sm:grid-cols-2">

              <div>
                <label className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                  Land area · acres
                </label>

                <input
                  type="text"
                  value={landArea}
                  onChange={(e) =>
                    setLandArea(e.target.value)
                  }
                  className="mt-2 w-full border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm outline-none transition focus:border-[var(--earth)]"
                />
              </div>

              <div>
                <label className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                  Number of parcels
                </label>

                <input
                  type="text"
                  value={parcels}
                  onChange={(e) =>
                    setParcels(e.target.value)
                  }
                  className="mt-2 w-full border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm outline-none transition focus:border-[var(--earth)]"
                />
              </div>

            </div>

            {/* REVISION REMARKS */}

            <div>

              <label className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-soft)]">
                Revision explanation
              </label>

              <textarea
                value={remarks}
                onChange={(e) =>
                  setRemarks(e.target.value)
                }
                rows={6}
                placeholder="Explain what was corrected in response to the field verification findings..."
                className="mt-2 w-full resize-none border border-[var(--line)] bg-[var(--paper)] p-4 text-sm leading-6 outline-none transition focus:border-[var(--earth)]"
              />

            </div>

            {/* SUBMIT */}

            <div className="flex flex-col gap-4 border-t border-[var(--line)] pt-6 sm:flex-row sm:items-center sm:justify-between">

              <p className="max-w-xl font-mono text-[9px] leading-5 text-[var(--ink-soft)]">
                Resubmission returns this same project record to
                District Authority scrutiny.
              </p>

              <button
                type="button"
                disabled={!remarks.trim()}
                onClick={handleResubmit}
                className="flex items-center justify-center gap-2 bg-[var(--ink)] px-6 py-3 font-mono text-[10px] uppercase tracking-wider text-[var(--white)] transition hover:bg-[var(--earth)] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Resubmit project
                <ArrowLeft
                  size={14}
                  className="rotate-180"
                />
              </button>

            </div>

          </div>

        </section>

      </div>
    </main>
  )
}

export default CompanyRevision