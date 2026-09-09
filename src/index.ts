import dotenv from "dotenv"
import { backfillSubmissionDates } from "./services/dateService"
import { pool } from "./db"

dotenv.config()

async function main() {
    try {
        await backfillSubmissionDates()
    } catch (error) {
        console.error("Date backfill failed:", error)
    } finally {
        await pool.end()
    }
}

main()