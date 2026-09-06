const LEDGER_STORAGE_KEY = "dhara-blockchain-ledger"

/**
 * Create a SHA-256 hash for a block payload.
 */
async function createHash(payload) {
  const encoder = new TextEncoder()
  const data = encoder.encode(JSON.stringify(payload))

  const hashBuffer = await crypto.subtle.digest("SHA-256", data)

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

/**
 * Load the current DHARA ledger.
 */
export function getLedger() {
  try {
    const stored = JSON.parse(
      localStorage.getItem(LEDGER_STORAGE_KEY) || "[]"
    )

    return Array.isArray(stored) ? stored : []
  } catch {
    return []
  }
}

/**
 * Save the ledger.
 */
function saveLedger(ledger) {
  localStorage.setItem(
    LEDGER_STORAGE_KEY,
    JSON.stringify(ledger)
  )
}

/**
 * Add a verified administrative event to the ledger.
 */
export async function addLedgerEvent({
  projectId,
  parcelId = null,
  event,
  authority,
  details = {},
}) {
  const ledger = getLedger()

  const previousBlock = ledger[ledger.length - 1]

  const block = {
    index: ledger.length + 1,

    timestamp: new Date().toISOString(),

    projectId,

    parcelId,

    event,

    authority,

    details,

    previousHash:
      previousBlock?.hash || "GENESIS",

    hash: null,
  }

  block.hash = await createHash({
    index: block.index,
    timestamp: block.timestamp,
    projectId: block.projectId,
    parcelId: block.parcelId,
    event: block.event,
    authority: block.authority,
    details: block.details,
    previousHash: block.previousHash,
  })

  ledger.push(block)

  saveLedger(ledger)

  return block
}

/**
 * Verify the integrity of the entire ledger.
 */
export async function verifyLedger() {
  const ledger = getLedger()

  if (ledger.length === 0) {
    return {
      valid: true,
      blocks: 0,
      message: "Ledger is empty.",
    }
  }

  for (let i = 0; i < ledger.length; i++) {
    const block = ledger[i]

    const expectedPreviousHash =
      i === 0
        ? "GENESIS"
        : ledger[i - 1].hash

    if (block.previousHash !== expectedPreviousHash) {
      return {
        valid: false,
        blocks: ledger.length,
        invalidBlock: block.index,
        reason: "Previous hash mismatch.",
      }
    }

    const recalculatedHash = await createHash({
      index: block.index,
      timestamp: block.timestamp,
      projectId: block.projectId,
      parcelId: block.parcelId,
      event: block.event,
      authority: block.authority,
      details: block.details,
      previousHash: block.previousHash,
    })

    if (block.hash !== recalculatedHash) {
      return {
        valid: false,
        blocks: ledger.length,
        invalidBlock: block.index,
        reason: "Block hash mismatch.",
      }
    }
  }

  return {
    valid: true,
    blocks: ledger.length,
    message: "Ledger integrity verified.",
  }
}