import { syncGitHub } from "../services/syncService.js"
import { backfillSubmissionDates } from "../services/dateService.js"
import { pool } from "../db/index.js"

async function main() {
    try {
        await syncGitHub()
        await backfillSubmissionDates()
    } catch (error) {
        console.error("Sync failed:", error)
    } finally {
        await pool.end()
    }
}

main()