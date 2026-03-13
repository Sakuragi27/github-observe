const syncTimestamps = new Map<string, number[]>()
const MAX_SYNCS = 3
const WINDOW_MS = 60 * 60 * 1000

export function checkSyncRateLimit(userId: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now()
  const timestamps = syncTimestamps.get(userId) || []
  const recent = timestamps.filter(t => now - t < WINDOW_MS)
  if (recent.length >= MAX_SYNCS) {
    const retryAfterMs = WINDOW_MS - (now - recent[0])
    return { allowed: false, retryAfterMs }
  }
  recent.push(now)
  syncTimestamps.set(userId, recent)
  return { allowed: true }
}
