import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  ShieldCheck,
  ShieldAlert,
  Link2,
  Database,
  RefreshCw,
  CheckCircle2,
  Clock3,
} from "lucide-react"

import {
  getLedger,
  verifyLedger,
} from "../blockchain/dharaLedger"

function shortenHash(hash) {
  if (!hash) return "—"

  if (hash === "GENESIS") {
    return "GENESIS"
  }

  return `${hash.slice(0, 12)}...${hash.slice(-8)}`
}

function formatDate(timestamp) {
  if (!timestamp) return "—"

  return new Date(timestamp).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  })
}

export default function BlockchainLedger() {
  const [ledger, setLedger] = useState([])
  const [verification, setVerification] = useState(null)
  const [checking, setChecking] = useState(false)

  const loadLedger = () => {
    const currentLedger = getLedger()
    setLedger(currentLedger)
    setVerification(null)
  }

  useEffect(() => {
    loadLedger()
  }, [])

  const handleVerify = async () => {
    setChecking(true)

    try {
      const result = await verifyLedger()
      setVerification(result)
    } catch (error) {
      console.error("Ledger verification failed:", error)

      setVerification({
        valid: false,
        blocks: ledger.length,
        reason: "Unable to verify ledger.",
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f3efe6] text-[#171714]">
      {/* Header */}
      <header className="border-b border-[#cfc8b9]">
        <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-[#82442e]">
                <Database size={13} />
                DHARA / TRUST LAYER
              </div>

              <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">
                Verified History
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5d5a52]">
                A tamper-evident record of important actions performed
                throughout the DHARA project lifecycle.
              </p>
            </div>

            <button
              onClick={loadLedger}
              className="flex w-fit items-center gap-2 border border-[#b9b1a2] bg-[#faf8f3] px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition hover:bg-[#e9e3d7]"
            >
              <RefreshCw size={13} />
              Refresh Ledger
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        {/* Overview */}
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="border border-[#cfc8b9] bg-[#faf8f3] p-5">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#5d5a52]">
              <Link2 size={13} />
              Blocks
            </div>

            <div className="font-serif text-3xl">
              {ledger.length}
            </div>

            <p className="mt-2 text-xs text-[#5d5a52]">
              Recorded ledger events
            </p>
          </div>

          <div className="border border-[#cfc8b9] bg-[#faf8f3] p-5">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#5d5a52]">
              <ShieldCheck size={13} />
              Integrity
            </div>

            <div className="font-serif text-3xl">
              {verification
                ? verification.valid
                  ? "VALID"
                  : "INVALID"
                : "—"}
            </div>

            <p className="mt-2 text-xs text-[#5d5a52]">
              {verification
                ? verification.valid
                  ? "Chain integrity verified"
                  : "Integrity check failed"
                : "Verification not yet performed"}
            </p>
          </div>

          <div className="border border-[#cfc8b9] bg-[#faf8f3] p-5">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#5d5a52]">
              <Clock3 size={13} />
              Latest Event
            </div>

            <div className="font-serif text-lg">
              {ledger.length
                ? ledger[ledger.length - 1].event
                : "No events"}
            </div>

            <p className="mt-2 text-xs text-[#5d5a52]">
              {ledger.length
                ? formatDate(ledger[ledger.length - 1].timestamp)
                : "Ledger is currently empty"}
            </p>
          </div>
        </section>

        {/* Verification */}
        <section className="mt-8 border border-[#cfc8b9] bg-[#faf8f3]">
          <div className="border-b border-[#cfc8b9] px-5 py-4 sm:px-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#82442e]">
              Ledger Integrity Check
            </div>

            <h2 className="mt-1 font-serif text-xl">
              Verify the complete chain
            </h2>
          </div>

          <div className="flex flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="max-w-2xl text-sm leading-6 text-[#5d5a52]">
              DHARA recalculates every block hash and checks that each block
              correctly points to the previous block.
            </div>

            <button
              onClick={handleVerify}
              disabled={checking || ledger.length === 0}
              className="flex shrink-0 items-center justify-center gap-2 bg-[#171714] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#faf8f3] transition hover:bg-[#82442e] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {checking ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  Verifying
                </>
              ) : (
                <>
                  <ShieldCheck size={13} />
                  Verify Ledger
                </>
              )}
            </button>
          </div>

          {verification && (
            <div
              className={`border-t px-5 py-5 sm:px-6 ${
                verification.valid
                  ? "border-[#b9b1a2] bg-[#e9e3d7]"
                  : "border-[#82442e] bg-[#f1ddd4]"
              }`}
            >
              <div className="flex items-start gap-3">
                {verification.valid ? (
                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0"
                  />
                ) : (
                  <ShieldAlert
                    size={20}
                    className="mt-0.5 shrink-0"
                  />
                )}

                <div>
                  <div className="font-mono text-xs uppercase tracking-[0.15em]">
                    {verification.valid
                      ? "Ledger Verified"
                      : "Ledger Invalid"}
                  </div>

                  <p className="mt-1 text-sm text-[#5d5a52]">
                    {verification.message ||
                      verification.reason ||
                      "Verification completed."}
                  </p>

                  {verification.invalidBlock && (
                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#82442e]">
                      Invalid block: #{verification.invalidBlock}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Blockchain chain */}
        <section className="mt-8">
          <div className="mb-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#82442e]">
              Transaction Chain
            </div>

            <h2 className="mt-1 font-serif text-2xl">
              Project event history
            </h2>
          </div>

          {ledger.length === 0 ? (
            <div className="border border-dashed border-[#b9b1a2] bg-[#faf8f3] px-6 py-12 text-center">
              <Database
                size={28}
                className="mx-auto mb-4 text-[#82442e]"
              />

              <h3 className="font-serif text-xl">
                No blockchain events yet
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#5d5a52]">
                Submit a project proposal from the Company portal.
                DHARA will create the first ledger block automatically.
              </p>
            </div>
          ) : (
            <div className="relative">
              {/* Connecting line */}
              <div className="absolute bottom-5 left-[15px] top-5 w-px bg-[#b9b1a2] sm:left-[19px]" />

              <div className="space-y-5">
                {ledger.map((block, index) => (
                  <motion.article
                    key={`${block.index}-${block.hash}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: index * 0.05,
                    }}
                    className="relative pl-10 sm:pl-12"
                  >
                    {/* Chain node */}
                    <div className="absolute left-0 top-5 flex h-8 w-8 items-center justify-center border border-[#82442e] bg-[#f3efe6] sm:h-10 sm:w-10">
                      <span className="font-mono text-[9px] text-[#82442e]">
                        #{block.index}
                      </span>
                    </div>

                    <div className="border border-[#cfc8b9] bg-[#faf8f3]">
                      <div className="border-b border-[#cfc8b9] px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#82442e]">
                              BLOCK #{block.index}
                            </div>

                            <h3 className="mt-1 font-serif text-lg sm:text-xl">
                              {block.event}
                            </h3>
                          </div>

                          <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#5d5a52]">
                            {formatDate(block.timestamp)}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-5 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5d5a52]">
                            Authority
                          </div>

                          <div className="mt-1 text-sm">
                            {block.authority || "—"}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5d5a52]">
                            Project ID
                          </div>

                          <div className="mt-1 break-all font-mono text-xs">
                            {block.projectId || "—"}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5d5a52]">
                            Previous Hash
                          </div>

                          <div className="mt-1 break-all font-mono text-xs">
                            {shortenHash(block.previousHash)}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5d5a52]">
                            Current Hash
                          </div>

                          <div className="mt-1 break-all font-mono text-xs">
                            {shortenHash(block.hash)}
                          </div>
                        </div>
                      </div>

                      {block.details &&
                        Object.keys(block.details).length > 0 && (
                          <div className="border-t border-[#cfc8b9] px-5 py-5 sm:px-6">
                            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.15em] text-[#5d5a52]">
                              Recorded Details
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                              {Object.entries(block.details).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="border border-[#d8d2c6] bg-[#f3efe6] px-3 py-3"
                                  >
                                    <div className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#5d5a52]">
                                      {key.replaceAll("_", " ")}
                                    </div>

                                    <div className="mt-1 break-words text-xs">
                                      {String(value)}
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Prototype note */}
        <section className="mt-8 border-t border-[#cfc8b9] pt-6">
          <p className="max-w-3xl font-mono text-[9px] uppercase leading-5 tracking-[0.12em] text-[#5d5a52]">
            Prototype trust layer — DHARA currently uses a browser-based
            SHA-256 hash chain for demonstration. Production deployment
            can migrate this trust layer to a permissioned government
            blockchain.
          </p>
        </section>
      </div>
    </main>
  )
}