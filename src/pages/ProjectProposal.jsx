import { motion } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  LandPlot,
  MapPin,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const projectTypes = [
  "Industrial Development",
  "Infrastructure",
  "Transportation",
  "Energy",
  "Logistics",
  "Urban Development",
  "Other",
]

const states = [
  "Maharashtra",
  "West Bengal",
  "Odisha",
  "Tamil Nadu",
  "Gujarat",
  "Karnataka",
  "Other",
]

const steps = [
  {
    number: "01",
    label: "Project details",
  },
  {
    number: "02",
    label: "Land requirement",
  },
  {
    number: "03",
    label: "Documents & submit",
  },
]

function generateProjectId() {
  const year = new Date().getFullYear()
  const randomNumber = Math.floor(1000 + Math.random() * 9000)

  return `DH-${year}-${randomNumber}`
}

function ProjectProposal() {
  const navigate = useNavigate()

  const [currentStep, setCurrentStep] = useState(1)

  const [form, setForm] = useState({
    projectName: "",
    projectType: "",
    state: "",
    district: "",
    description: "",
    landArea: "",
    parcels: "",
    purpose: "",
  })

  const [documents, setDocuments] = useState([])

  const [submitted, setSubmitted] = useState(false)
  const [submittedProject, setSubmittedProject] = useState(null)

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files || [])

    setDocuments((current) => [...current, ...files])

    event.target.value = ""
  }

  const removeDocument = (indexToRemove) => {
    setDocuments((current) =>
      current.filter((_, index) => index !== indexToRemove)
    )
  }

  const validateStepOne = () => {
    return (
      form.projectName.trim() &&
      form.projectType &&
      form.state &&
      form.district.trim() &&
      form.purpose.trim() &&
      form.description.trim()
    )
  }

  const validateStepTwo = () => {
    return form.landArea && form.parcels
  }

  const goToNextStep = () => {
    if (currentStep === 1 && !validateStepOne()) {
      alert("Please complete all project details before continuing.")
      return
    }

    if (currentStep === 2 && !validateStepTwo()) {
      alert("Please complete the land requirement before continuing.")
      return
    }

    setCurrentStep((step) => Math.min(step + 1, 3))

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 1))

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!validateStepOne() || !validateStepTwo()) {
      alert("Please complete all required proposal information.")
      return
    }

    const projectId = generateProjectId()
    const submittedAt = new Date().toISOString()

    const proposal = {
      id: projectId,
      projectName: form.projectName.trim(),
      projectType: form.projectType,
      state: form.state,
      district: form.district.trim(),
      purpose: form.purpose.trim(),
      description: form.description.trim(),
      landArea: form.landArea,
      parcels: form.parcels,

      documents: documents.map((document) => ({
        name: document.name,
        size: document.size,
        type: document.type,
      })),

      submittedAt,

      // DHARA workflow state
      stage: "District Scrutiny",
      status: "Pending",
      authority: "District Authority",

      // Workflow metadata
      submittedBy: "Project Authority",
      nextAction: "District Authority Review",
    }

    /*
      ---------------------------------------------------------
      DHARA PROTOTYPE DATA FLOW
      ---------------------------------------------------------

      Every submitted project is now stored in:

      "dhara-projects"

      This becomes the shared prototype record that future
      portals will read.

      Company submits
            ↓
      DHARA project record created
            ↓
      District Authority sees Pending proposal
            ↓
      Field Officer / State / Central can later act on
      the same project record.

      In the real system this will become a backend database/API.
      ---------------------------------------------------------
    */

    const existingProjects = JSON.parse(
      localStorage.getItem("dhara-projects") || "[]"
    )

    const updatedProjects = [...existingProjects, proposal]

    localStorage.setItem(
      "dhara-projects",
      JSON.stringify(updatedProjects)
    )

    // Keep latest proposal for compatibility with the tracking page.
    localStorage.setItem(
      "dhara-latest-proposal",
      JSON.stringify(proposal)
    )

    setSubmittedProject(proposal)
    setSubmitted(true)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const handleStepClick = (stepNumber) => {
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber)
      return
    }

    if (stepNumber === currentStep + 1) {
      goToNextStep()
    }
  }

  const formatSubmittedDate = (date) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  if (submitted && submittedProject) {
    return (
      <main className="min-h-screen bg-[#f3efe6] text-[#171714]">
        {/* Header */}
        <header className="border-b border-[#cfc8b9]">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
            <button
              onClick={() =>
                navigate(`/portal/company/project/${submittedProject.id}`)
              }
              className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5d5a52] transition-colors hover:text-[#171714]"
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.5}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to company portal
            </button>

            <div className="text-right">
              <p className="font-serif text-lg">DHARA</p>

              <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#8a857b]">
                Submission received
              </p>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-[#cfc8b9] bg-[#f7f4ed]"
          >
            {/* Confirmation header */}
            <div className="border-b border-[#cfc8b9] p-6 sm:p-10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[#8d9a8c] bg-[#e7ece5]">
                    <CheckCircle2
                      size={22}
                      strokeWidth={1.4}
                      className="text-[#526b56]"
                    />
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#66816c]">
                      Submission successful
                    </p>

                    <h1 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">
                      Proposal received.
                    </h1>

                    <p className="mt-3 max-w-xl text-xs leading-6 text-[#6d695f]">
                      Your project proposal has entered the DHARA government
                      workflow. The next stage is district-level scrutiny.
                    </p>
                  </div>
                </div>

                <div className="border border-[#cfc8b9] bg-[#e9e3d7] px-4 py-3 sm:min-w-[190px]">
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#8a857b]">
                    DHARA Project ID
                  </p>

                  <p className="mt-2 font-mono text-sm tracking-[0.08em]">
                    {submittedProject.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="grid border-b border-[#cfc8b9] sm:grid-cols-3">
              <div className="border-b border-[#cfc8b9] p-5 sm:border-b-0 sm:border-r">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#99948a]">
                  Current stage
                </p>

                <p className="mt-2 font-serif text-lg">
                  {submittedProject.stage}
                </p>
              </div>

              <div className="border-b border-[#cfc8b9] p-5 sm:border-b-0 sm:border-r">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#99948a]">
                  Status
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#b65f3c]" />

                  <p className="font-mono text-xs uppercase tracking-[0.08em]">
                    {submittedProject.status}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <p className="font-mono text-[8px] uppercase tracking-[0.15em] text-[#99948a]">
                  Receiving authority
                </p>

                <p className="mt-2 font-serif text-lg">
                  {submittedProject.authority}
                </p>
              </div>
            </div>

            {/* Timeline */}
            <div className="border-b border-[#cfc8b9] p-6 sm:p-10">
              <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a857b]">
                  What happens next
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Government workflow initiated.
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="border border-[#8d9a8c] bg-[#e7ece5] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#66816c] text-[#f3efe6]">
                      <Check size={14} strokeWidth={2} />
                    </div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.12em]">
                      01 · Submitted
                    </p>
                  </div>

                  <p className="mt-3 text-[10px] leading-5 text-[#5d5a52]">
                    Company proposal received by DHARA.
                  </p>
                </div>

                <div className="border border-[#b65f3c] bg-[#f3ebe4] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center border border-[#b65f3c] font-mono text-[9px]">
                      02
                    </div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.12em]">
                      District scrutiny
                    </p>
                  </div>

                  <p className="mt-3 text-[10px] leading-5 text-[#5d5a52]">
                    District Authority reviews the proposal and records.
                  </p>
                </div>

                <div className="border border-[#cfc8b9] bg-[#e9e3d7] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center border border-[#b9b1a2] font-mono text-[9px] text-[#8a857b]">
                      03
                    </div>

                    <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a857b]">
                      Government review
                    </p>
                  </div>

                  <p className="mt-3 text-[10px] leading-5 text-[#8a857b]">
                    Further administrative actions happen according to the
                    government workflow.
                  </p>
                </div>
              </div>
            </div>

            {/* Project summary */}
            <div className="p-6 sm:p-10">
              <div className="mb-6">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a857b]">
                  Submitted proposal
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  {submittedProject.projectName}
                </h2>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                    Project type
                  </p>

                  <p className="mt-1 text-xs text-[#5d5a52]">
                    {submittedProject.projectType}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                    Location
                  </p>

                  <p className="mt-1 flex items-center gap-2 text-xs text-[#5d5a52]">
                    <MapPin size={12} />
                    {submittedProject.district}, {submittedProject.state}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                    Land requirement
                  </p>

                  <p className="mt-1 text-xs text-[#5d5a52]">
                    {submittedProject.landArea} acres ·{" "}
                    {submittedProject.parcels} parcels
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                    Submitted
                  </p>

                  <p className="mt-1 text-xs text-[#5d5a52]">
                    {formatSubmittedDate(submittedProject.submittedAt)}
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                    Documents
                  </p>

                  <p className="mt-1 text-xs text-[#5d5a52]">
                    {submittedProject.documents.length} uploaded
                  </p>
                </div>

                <div>
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                    Next authority
                  </p>

                  <p className="mt-1 text-xs text-[#5d5a52]">
                    District Authority
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-3 border border-[#cfc8b9] bg-[#e9e3d7] p-4">
                <ShieldCheck
                  size={15}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0"
                />

                <p className="text-[10px] leading-5 text-[#6d695f]">
                  <span className="font-medium text-[#171714]">
                    Administrative control remains with DHARA authorities.
                  </span>{" "}
                  Your land requirement has been recorded, but parcel
                  verification, allocation and acquisition decisions will be
                  handled by the appropriate government authorities.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/portal/company")}
                  className="flex items-center justify-center gap-3 border border-[#cfc8b9] px-5 py-4 font-mono text-[9px] uppercase tracking-[0.15em] transition-colors hover:bg-[#e9e3d7]"
                >
                  Company portal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/portal/company/project/${submittedProject.id}`
                    )
                  }
                  className="group flex items-center justify-center gap-8 bg-[#171714] px-5 py-4 text-[#f3efe6] transition-colors hover:bg-[#2c2b27]"
                >
                  <div className="text-left">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                      Project ID
                    </p>

                    <p className="mt-1 font-serif text-base">
                      Track project
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f3efe6] text-[#171714]">
      {/* Header */}
      <header className="border-b border-[#cfc8b9]">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <button
            onClick={() => navigate("/portal/company")}
            className="group flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#5d5a52] transition-colors hover:text-[#171714]"
          >
            <ArrowLeft
              size={14}
              strokeWidth={1.5}
              className="transition-transform group-hover:-translate-x-1"
            />
            Back to company portal
          </button>

          <div className="text-right">
            <p className="font-serif text-lg">DHARA</p>

            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#8a857b]">
              Project Proposal
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-5 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
        {/* Page heading */}
        <section className="mb-10 border-b border-[#cfc8b9] pb-8">
          <div className="mb-4 flex items-center gap-3">
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#b65f3c]">
              Project Authority
            </span>

            <span className="h-px w-8 bg-[#b65f3c]" />

            <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#8a857b]">
              New proposal
            </span>
          </div>

          <h1 className="max-w-3xl font-serif text-4xl leading-[0.98] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
            Propose a
            <br />
            <span className="text-[#6d695f]">new project.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6d695f]">
            Tell DHARA what you are planning and what land your project
            requires. Your proposal will enter the government review workflow
            after submission.
          </p>
        </section>

        {/* Progress */}
        <div className="mb-10 grid grid-cols-3 border-l border-t border-[#cfc8b9]">
          {steps.map((step, index) => {
            const stepNumber = index + 1
            const active = currentStep === stepNumber
            const completed = currentStep > stepNumber

            return (
              <button
                key={step.number}
                type="button"
                onClick={() => handleStepClick(stepNumber)}
                className={`border-b border-r border-[#cfc8b9] p-4 text-left transition-colors ${
                  active
                    ? "bg-[#171714] text-[#f3efe6]"
                    : completed
                      ? "bg-[#e3e8df]"
                      : "bg-[#e9e3d7]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`font-mono text-[9px] ${
                      active
                        ? "text-[#aaa69c]"
                        : completed
                          ? "text-[#66816c]"
                          : "text-[#8a857b]"
                    }`}
                  >
                    {completed ? "✓" : step.number}
                  </p>

                  {active && (
                    <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#aaa69c]">
                      Current
                    </span>
                  )}
                </div>

                <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.12em]">
                  {step.label}
                </p>
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {currentStep === 1 && (
            <motion.section
              key="step-one"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-[#cfc8b9] bg-[#f7f4ed]"
            >
              <div className="border-b border-[#cfc8b9] p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#cfc8b9]">
                    <FileText size={17} strokeWidth={1.4} />
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a857b]">
                      Section 01
                    </p>

                    <h2 className="mt-1 font-serif text-2xl">
                      Project details
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-6 text-[#777269]">
                      Provide the basic information about the project you are
                      proposing.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
                <label className="lg:col-span-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    Project name
                  </span>

                  <input
                    type="text"
                    value={form.projectName}
                    onChange={(event) =>
                      updateField("projectName", event.target.value)
                    }
                    placeholder="Enter the official project name"
                    className="mt-2 w-full border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 text-sm outline-none placeholder:text-[#aaa49a] focus:border-[#171714]"
                  />
                </label>

                <label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    Project type
                  </span>

                  <select
                    value={form.projectType}
                    onChange={(event) =>
                      updateField("projectType", event.target.value)
                    }
                    className="mt-2 w-full appearance-none border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 text-sm outline-none focus:border-[#171714]"
                  >
                    <option value="">Select project type</option>

                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    State
                  </span>

                  <select
                    value={form.state}
                    onChange={(event) =>
                      updateField("state", event.target.value)
                    }
                    className="mt-2 w-full appearance-none border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 text-sm outline-none focus:border-[#171714]"
                  >
                    <option value="">Select state</option>

                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    District
                  </span>

                  <input
                    type="text"
                    value={form.district}
                    onChange={(event) =>
                      updateField("district", event.target.value)
                    }
                    placeholder="Enter district"
                    className="mt-2 w-full border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 text-sm outline-none placeholder:text-[#aaa49a] focus:border-[#171714]"
                  />
                </label>

                <label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    Project purpose
                  </span>

                  <input
                    type="text"
                    value={form.purpose}
                    onChange={(event) =>
                      updateField("purpose", event.target.value)
                    }
                    placeholder="What will the land be used for?"
                    className="mt-2 w-full border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 text-sm outline-none placeholder:text-[#aaa49a] focus:border-[#171714]"
                  />
                </label>

                <label className="lg:col-span-2">
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    Project description
                  </span>

                  <textarea
                    rows={5}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Briefly describe the proposed project, its purpose and expected impact."
                    className="mt-2 w-full resize-none border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 text-sm leading-6 outline-none placeholder:text-[#aaa49a] focus:border-[#171714]"
                  />
                </label>
              </div>

              <div className="flex justify-end border-t border-[#cfc8b9] bg-[#e9e3d7] p-5 sm:p-7">
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="group flex items-center gap-8 bg-[#171714] px-5 py-4 text-[#f3efe6] transition-colors hover:bg-[#2c2b27]"
                >
                  <div className="text-left">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                      Step 02
                    </p>

                    <p className="mt-1 font-serif text-base">
                      Land requirement
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </motion.section>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <motion.section
              key="step-two"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-[#cfc8b9] bg-[#f7f4ed]"
            >
              <div className="border-b border-[#cfc8b9] p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#cfc8b9]">
                    <LandPlot size={17} strokeWidth={1.4} />
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a857b]">
                      Section 02
                    </p>

                    <h2 className="mt-1 font-serif text-2xl">
                      Land requirement
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-6 text-[#777269]">
                      Define how much land your project requires. Specific
                      parcel allocation will happen through the government
                      workflow.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2">
                <label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    Required land area
                  </span>

                  <div className="relative mt-2">
                    <input
                      min="0"
                      step="0.01"
                      type="number"
                      value={form.landArea}
                      onChange={(event) =>
                        updateField("landArea", event.target.value)
                      }
                      placeholder="0.00"
                      className="w-full border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 pr-20 text-sm outline-none placeholder:text-[#aaa49a] focus:border-[#171714]"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a857b]">
                      acres
                    </span>
                  </div>
                </label>

                <label>
                  <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    Estimated number of parcels
                  </span>

                  <input
                    min="1"
                    type="number"
                    value={form.parcels}
                    onChange={(event) =>
                      updateField("parcels", event.target.value)
                    }
                    placeholder="Estimated parcels"
                    className="mt-2 w-full border border-[#cfc8b9] bg-[#f3efe6] px-4 py-3.5 text-sm outline-none placeholder:text-[#aaa49a] focus:border-[#171714]"
                  />
                </label>
              </div>

              <div className="mx-5 mb-5 flex items-start gap-3 border border-[#cfc8b9] bg-[#e9e3d7] p-4 sm:mx-7 sm:mb-7">
                <MapPin
                  size={15}
                  strokeWidth={1.4}
                  className="mt-0.5 shrink-0 text-[#b65f3c]"
                />

                <p className="text-[10px] leading-5 text-[#6d695f]">
                  <span className="font-medium text-[#171714]">
                    Land requirement is a proposal, not ownership.
                  </span>{" "}
                  The company specifies the area it needs. Parcel verification,
                  allocation and acquisition decisions are handled by the
                  appropriate government authorities.
                </p>
              </div>

              <div className="flex flex-col justify-between gap-3 border-t border-[#cfc8b9] bg-[#e9e3d7] p-5 sm:flex-row sm:p-7">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#6d695f] hover:text-[#171714]"
                >
                  ← Back to project details
                </button>

                <button
                  type="button"
                  onClick={goToNextStep}
                  className="group flex items-center gap-8 bg-[#171714] px-5 py-4 text-[#f3efe6] transition-colors hover:bg-[#2c2b27]"
                >
                  <div className="text-left">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                      Step 03
                    </p>

                    <p className="mt-1 font-serif text-base">
                      Documents & submit
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </motion.section>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <motion.section
              key="step-three"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="border border-[#cfc8b9] bg-[#f7f4ed]"
            >
              <div className="border-b border-[#cfc8b9] p-5 sm:p-7">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-[#cfc8b9]">
                    <Upload size={17} strokeWidth={1.4} />
                  </div>

                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[#8a857b]">
                      Section 03
                    </p>

                    <h2 className="mt-1 font-serif text-2xl">
                      Documents & submit
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-6 text-[#777269]">
                      Upload the supporting documents required for your project
                      proposal and review your information before submission.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#5d5a52]">
                    Supporting documents
                  </p>

                  <label className="mt-3 flex cursor-pointer flex-col items-center justify-center border border-dashed border-[#b9b1a2] bg-[#f3efe6] px-5 py-10 text-center transition-colors hover:bg-[#eee9df]">
                    <Upload
                      size={20}
                      strokeWidth={1.4}
                      className="text-[#777269]"
                    />

                    <p className="mt-3 font-serif text-lg">
                      Upload project documents
                    </p>

                    <p className="mt-2 max-w-sm text-[10px] leading-5 text-[#8a857b]">
                      Project reports, approvals, maps or other supporting
                      documents.
                    </p>

                    <span className="mt-4 border border-[#cfc8b9] px-4 py-2 font-mono text-[8px] uppercase tracking-[0.14em]">
                      Choose files
                    </span>

                    <input
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {documents.length > 0 && (
                  <div className="mt-5 space-y-2">
                    {documents.map((document, index) => (
                      <div
                        key={`${document.name}-${index}`}
                        className="flex items-center justify-between gap-4 border border-[#cfc8b9] bg-[#e9e3d7] px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <FileText
                            size={15}
                            strokeWidth={1.4}
                            className="shrink-0"
                          />

                          <p className="truncate text-xs text-[#5d5a52]">
                            {document.name}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-[#9b4e35] hover:text-[#171714]"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-8 border border-[#cfc8b9]">
                  <div className="border-b border-[#cfc8b9] bg-[#e9e3d7] p-4">
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                      Proposal review
                    </p>
                  </div>

                  <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                        Project
                      </p>

                      <p className="mt-1 font-serif text-lg">
                        {form.projectName || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                        Project type
                      </p>

                      <p className="mt-1 text-xs text-[#5d5a52]">
                        {form.projectType || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                        Location
                      </p>

                      <p className="mt-1 flex items-center gap-2 text-xs text-[#5d5a52]">
                        <MapPin size={12} />
                        {form.district || "—"}, {form.state || "—"}
                      </p>
                    </div>

                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                        Land requirement
                      </p>

                      <p className="mt-1 text-xs text-[#5d5a52]">
                        {form.landArea || "—"} acres ·{" "}
                        {form.parcels || "—"} parcels
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-[#99948a]">
                        Purpose
                      </p>

                      <p className="mt-1 text-xs leading-6 text-[#5d5a52]">
                        {form.purpose || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-start gap-3 border border-[#cfc8b9] bg-[#e9e3d7] p-4">
                  <Save
                    size={15}
                    strokeWidth={1.4}
                    className="mt-0.5 shrink-0"
                  />

                  <p className="text-[10px] leading-5 text-[#6d695f]">
                    <span className="font-medium text-[#171714]">
                      Before submission:
                    </span>{" "}
                    confirm that the project details and land requirement are
                    accurate. Once submitted, the proposal will enter the
                    appropriate government review workflow.
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-4 border-t border-[#cfc8b9] bg-[#e9e3d7] p-5 sm:flex-row sm:items-center sm:p-7">
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#6d695f] hover:text-[#171714]"
                >
                  ← Back to land requirement
                </button>

                <button
                  type="submit"
                  className="group flex items-center justify-between gap-8 bg-[#171714] px-5 py-4 text-left text-[#f3efe6] transition-colors hover:bg-[#2c2b27]"
                >
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.16em]">
                      Final action
                    </p>

                    <p className="mt-1 font-serif text-base">
                      Submit proposal
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    strokeWidth={1.5}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </motion.section>
          )}
        </form>
      </div>
    </main>
  )
}

export default ProjectProposal