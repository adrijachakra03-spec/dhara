import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Landmark,
  RefreshCw,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const portalRoles = [
  {
    id: "company",
    label: "Company",
    description: "Submit and track project proposals",
    type: "external",
    path: "/portal/company",
    icon: Building2,
  },
  {
    id: "district",
    label: "District Authority",
    description: "District-level scrutiny and field review",
    type: "government",
    path: "/portal/district",
    icon: Landmark,
  },
  {
    id: "field",
    label: "Field Officer",
    description: "Parcel and land verification",
    type: "government",
    path: "/portal/field",
    icon: ShieldCheck,
  },
  {
    id: "state",
    label: "State Authority",
    description: "State-level project scrutiny",
    type: "government",
    path: "/portal/state",
    icon: Landmark,
  },
  {
    id: "central",
    label: "Central Authority",
    description: "National-level project oversight",
    type: "government",
    path: "/portal/central",
    icon: ShieldCheck,
  },
  {
    id: "citizen",
    label: "Citizen",
    description: "View land, compensation and project status",
    type: "external",
    path: "/portal/citizen",
    icon: UserRound,
  },
]

const CAPTCHA_CHARACTERS =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function generateCaptcha() {
  let result = ""

  for (let i = 0; i < 5; i++) {
    result += CAPTCHA_CHARACTERS.charAt(
      Math.floor(Math.random() * CAPTCHA_CHARACTERS.length)
    )
  }

  return result
}

function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()

  const initialRole = location.state?.role || "company"

  const [selectedRole, setSelectedRole] = useState(
    portalRoles.some((role) => role.id === initialRole)
      ? initialRole
      : "company"
  )

  const [authorityModalOpen, setAuthorityModalOpen] = useState(false)

  // External account details
  const [name, setName] = useState("")
  const [identifier, setIdentifier] = useState("")

  // Password
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  // CAPTCHA
  const [captcha, setCaptcha] = useState("")
  const [captchaValue, setCaptchaValue] = useState(
    generateCaptcha()
  )

  const [verified, setVerified] = useState(false)

  const selectedPortal = portalRoles.find(
    (role) => role.id === selectedRole
  )

  const isGovernment = selectedPortal?.type === "government"

  // ==========================================
  // CAPTCHA
  // ==========================================

  const regenerateCaptcha = () => {
    setCaptchaValue(generateCaptcha())
    setCaptcha("")
  }

  // ==========================================
  // ROLE CHANGE
  // ==========================================

  const handleRoleChange = (roleId) => {
    setSelectedRole(roleId)

    setName("")
    setIdentifier("")
    setPassword("")
    setCaptcha("")
    setCaptchaValue(generateCaptcha())
    setVerified(false)
    setShowPassword(false)
  }

  const handleAuthoritySelect = (roleId) => {
    handleRoleChange(roleId)
    setAuthorityModalOpen(false)
  }

  // ==========================================
  // FORM SUBMIT
  // ==========================================

  const handleSubmit = (event) => {
    event.preventDefault()

    // ========================================
    // GOVERNMENT LOGIN
    // ========================================

    if (isGovernment) {
      if (!identifier || !password) return

      setVerified(true)

      setTimeout(() => {
        if (selectedPortal?.path) {
          navigate(selectedPortal.path)
        }
      }, 500)

      return
    }

    // ========================================
    // COMPANY / CITIZEN EMAIL LOGIN
    // ========================================

    if (!name || !identifier || !password) return

    // CAPTCHA validation
    if (
      captcha.trim().toUpperCase() !==
      captchaValue.toUpperCase()
    ) {
      alert(
        "Incorrect CAPTCHA. A new CAPTCHA has been generated."
      )

      regenerateCaptcha()
      return
    }

    setVerified(true)

    setTimeout(() => {
      if (selectedPortal?.path) {
        navigate(selectedPortal.path)
      }
    }, 500)
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-[var(--line)]">

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-5">

          <div className="flex items-center justify-between gap-5">

            <button
              onClick={() => navigate("/")}
              className="font-serif text-xl md:text-2xl hover:text-[var(--earth)] transition"
            >
              DHARA
            </button>

            <div className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--ink-soft)] text-right">
              Digital Land Administration
            </div>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-16">

        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-20">

          {/* =================================================
              LEFT
          ================================================= */}

          <section>

            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--earth)] mb-4">
              Secure Portal Access
            </p>

            <h1 className="font-serif text-4xl md:text-5xl leading-tight">
              Sign in to DHARA.
            </h1>

            <p className="font-mono text-xs md:text-sm leading-7 text-[var(--ink-soft)] mt-5 max-w-md">
              Access the portal corresponding to your role in the
              land and project administration workflow.
            </p>

            {/* SELECTED ROLE */}

            <div className="mt-10 border border-[var(--line)] bg-[var(--white)] p-5">

              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)] mb-4">
                Selected Portal
              </p>

              <div className="flex items-start gap-4">

                <div className="w-10 h-10 border border-[var(--earth)] flex items-center justify-center shrink-0">

                  {selectedPortal?.icon && (
                    <selectedPortal.icon
                      size={17}
                      className="text-[var(--earth)]"
                    />
                  )}

                </div>

                <div>

                  <h2 className="font-serif text-xl">
                    {selectedPortal?.label}
                  </h2>

                  <p className="font-mono text-[10px] leading-5 text-[var(--ink-soft)] mt-1">
                    {selectedPortal?.description}
                  </p>

                </div>

              </div>

            </div>

            {/* AUTHORITY SWITCH */}

            <button
              onClick={() => setAuthorityModalOpen(true)}
              className="mt-4 w-full border border-[var(--line-dark)] px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-[var(--paper-deep)] transition"
            >

              <div className="text-left">

                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                  Authority access
                </p>

                <p className="font-mono text-xs mt-1">
                  Choose another authority portal
                </p>

              </div>

              <ArrowRight size={15} />

            </button>

          </section>

          {/* =================================================
              RIGHT — LOGIN FORM
          ================================================= */}

          <section className="border border-[var(--line)] bg-[var(--white)]">

            <div className="border-b border-[var(--line)] px-6 md:px-8 py-5">

              <div className="flex items-center justify-between gap-4">

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--ink-soft)]">
                    Authentication
                  </p>

                  <h2 className="font-serif text-2xl mt-1">
                    {isGovernment
                      ? "Government credentials"
                      : "Account credentials"}
                  </h2>

                </div>

                <div className="w-9 h-9 border border-[var(--line)] flex items-center justify-center shrink-0">
                  <ShieldCheck size={16} />
                </div>

              </div>

            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-8"
            >

              {/* =================================================
                  GOVERNMENT LOGIN
              ================================================= */}

              {isGovernment ? (
                <>
                  {/* GOVERNMENT ID */}

                  <div className="mb-6">

                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)] mb-3">
                      Official Government ID
                    </label>

                    <input
                      type="text"
                      value={identifier}
                      onChange={(event) =>
                        setIdentifier(event.target.value)
                      }
                      placeholder="Enter official government ID"
                      className="w-full border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3.5 font-mono text-xs outline-none focus:border-[var(--earth)] transition"
                    />

                  </div>

                  {/* GOVERNMENT PASSWORD */}

                  <div className="mb-6">

                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)] mb-3">
                      Official Government Password
                    </label>

                    <div className="relative">

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter official password"
                        className="w-full border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3.5 pr-12 font-mono text-xs outline-none focus:border-[var(--earth)] transition"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)]"
                      >

                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}

                      </button>

                    </div>

                  </div>

                  {/* GOVERNMENT SECURITY NOTE */}

                  <div className="mb-6 border border-[var(--line)] bg-[var(--paper-deep)] p-4">

                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--earth)] mb-2">
                      Restricted access
                    </p>

                    <p className="font-mono text-[10px] leading-5 text-[var(--ink-soft)]">
                      Government portals require an authorized
                      official government ID and password. Access
                      is limited to the responsibilities assigned
                      to the selected role.
                    </p>

                  </div>
                </>
              ) : (
                <>
                  {/* =================================================
                      FULL NAME
                  ================================================= */}

                  <div className="mb-6">

                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)] mb-3">
                      Full Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder={
                        selectedRole === "company"
                          ? "Enter authorized representative name"
                          : "Enter your full name"
                      }
                      className="w-full border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3.5 font-mono text-xs outline-none focus:border-[var(--earth)] transition"
                    />

                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div className="mb-6">

                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)] mb-3">
                      Gmail / Email Address
                    </label>

                    <input
                      type="email"
                      value={identifier}
                      onChange={(event) =>
                        setIdentifier(event.target.value)
                      }
                      placeholder="name@example.com"
                      className="w-full border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3.5 font-mono text-xs outline-none focus:border-[var(--earth)] transition"
                    />

                  </div>

                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div className="mb-6">

                    <label className="block font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)] mb-3">
                      Password
                    </label>

                    <div className="relative">

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter password"
                        className="w-full border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3.5 pr-12 font-mono text-xs outline-none focus:border-[var(--earth)] transition"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((value) => !value)
                        }
                        className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-[var(--ink-soft)] hover:text-[var(--ink)]"
                      >

                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}

                      </button>

                    </div>

                  </div>

                  {/* =================================================
                      CAPTCHA
                  ================================================= */}

                  <div className="mb-6">

                    <div className="flex items-center justify-between gap-4 mb-3">

                      <label className="font-mono text-[9px] uppercase tracking-[0.18em] text-[var(--ink-soft)]">
                        Security Check
                      </label>

                      <button
                        type="button"
                        onClick={regenerateCaptcha}
                        className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--ink-soft)] hover:text-[var(--earth)] transition"
                      >
                        <RefreshCw size={12} />
                        Refresh
                      </button>

                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-3">

                      {/* CAPTCHA DISPLAY */}

                      <div className="relative overflow-hidden border border-[var(--line-dark)] bg-[var(--paper-deep)] px-4 py-3.5 flex items-center justify-center">

                        <div className="absolute inset-0 pointer-events-none opacity-30">

                          <span className="absolute left-[8%] top-1/2 w-[84%] border-t border-[var(--ink)] rotate-6" />

                          <span className="absolute left-[8%] top-1/2 w-[84%] border-t border-[var(--earth)] -rotate-6" />

                        </div>

                        <span className="relative font-mono text-sm font-semibold tracking-[0.35em] select-none">
                          {captchaValue}
                        </span>

                      </div>

                      {/* CAPTCHA INPUT */}

                      <input
                        value={captcha}
                        onChange={(event) =>
                          setCaptcha(
                            event.target.value
                              .toUpperCase()
                              .replace(/[^A-Z0-9]/g, "")
                          )
                        }
                        maxLength={5}
                        placeholder="Enter code"
                        className="border border-[var(--line-dark)] bg-[var(--paper)] px-4 py-3.5 font-mono text-xs uppercase outline-none focus:border-[var(--earth)] transition"
                      />

                    </div>

                    <p className="font-mono text-[8px] leading-4 text-[var(--ink-soft)] mt-2">
                      Enter the characters shown above. Refresh
                      the CAPTCHA if it is difficult to read.
                    </p>

                  </div>
                </>
              )}

              {/* =================================================
                  VERIFIED
              ================================================= */}

              {verified && (
                <div className="mb-6 border border-[var(--earth)] bg-[var(--paper-deep)] p-4 flex items-center gap-3">

                  <CheckCircle2
                    size={17}
                    className="text-[var(--earth)] shrink-0"
                  />

                  <p className="font-mono text-xs">
                    Authentication successful. Redirecting...
                  </p>

                </div>
              )}

              {/* =================================================
                  SUBMIT
              ================================================= */}

              {!verified && (
                <button
                  type="submit"
                  className="w-full bg-[var(--ink)] text-[var(--paper)] py-4 px-5 flex items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.18em] hover:bg-[var(--earth-dark)] transition"
                >

                  <span>
                    {isGovernment
                      ? "Enter Government Portal"
                      : "Sign In"}
                  </span>

                  <ArrowRight size={15} />

                </button>
              )}

              {/* =================================================
                  SECURITY NOTE
              ================================================= */}

              <div className="mt-6 pt-5 border-t border-[var(--line)]">

                <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)]">

                  {isGovernment
                    ? "Government access is restricted by administrative role. Each official can access only the functions assigned to their authority level."
                    : "Company and citizen accounts use verified email credentials and CAPTCHA authentication before access is granted."}

                </p>

              </div>

            </form>

          </section>

        </div>

      </main>

      {/* =====================================================
          AUTHORITY MODAL
      ===================================================== */}

      <AnimatePresence>

        {authorityModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center px-5 py-8"
            onClick={() => setAuthorityModalOpen(false)}
          >

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
                y: 15,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.97,
                y: 15,
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[var(--line-dark)] bg-[var(--paper)] shadow-2xl"
            >

              {/* MODAL HEADER */}

              <div className="border-b border-[var(--line)] px-6 py-5 flex items-center justify-between gap-4">

                <div>

                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--earth)] mb-2">
                    Authority Portals
                  </p>

                  <h2 className="font-serif text-2xl">
                    Select government function
                  </h2>

                </div>

                <button
                  onClick={() =>
                    setAuthorityModalOpen(false)
                  }
                  className="w-9 h-9 border border-[var(--line)] flex items-center justify-center hover:bg-[var(--ink)] hover:text-[var(--paper)] transition shrink-0"
                >
                  <X size={15} />
                </button>

              </div>

              {/* MODAL DESCRIPTION */}

              <div className="px-6 pt-5">

                <p className="font-mono text-[10px] leading-5 text-[var(--ink-soft)] max-w-xl">
                  Government access is separated by administrative
                  responsibility. Select the official function
                  assigned to your government credentials.
                </p>

              </div>

              {/* OPTIONS */}

              <div className="p-5 md:p-6">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                  {portalRoles
                    .filter(
                      (role) =>
                        role.type === "government"
                    )
                    .map((role) => {

                      const Icon = role.icon

                      return (
                        <button
                          key={role.id}
                          onClick={() =>
                            handleAuthoritySelect(
                              role.id
                            )
                          }
                          className={`text-left border p-4 transition ${
                            selectedRole === role.id
                              ? "border-[var(--earth)] bg-[var(--paper-deep)]"
                              : "border-[var(--line)] bg-[var(--white)] hover:border-[var(--line-dark)]"
                          }`}
                        >

                          <div className="flex items-start gap-3">

                            <div className="w-9 h-9 border border-[var(--line-dark)] flex items-center justify-center shrink-0">
                              <Icon size={15} />
                            </div>

                            <div>

                              <p className="font-mono text-xs uppercase tracking-wider">
                                {role.label}
                              </p>

                              <p className="font-mono text-[9px] leading-5 text-[var(--ink-soft)] mt-1">
                                {role.description}
                              </p>

                            </div>

                          </div>

                        </button>
                      )
                    })}

                </div>

              </div>

            </motion.div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  )
}

export default SignIn