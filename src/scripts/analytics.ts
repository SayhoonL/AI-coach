import {
    getProgress,
    getWeakTopics
} from "../services/analyticsService.js"

import { pool } from "../db/index.js"

async function main() {
    try {
        console.log("\n=== PROGRESS ===")
        console.dir(await getProgress(), { depth: null })

        console.log("\n=== WEAK TOPICS ===")
        console.table(await getWeakTopics())
    } catch (error) {
        console.error("Analytics failed:", error)
    } finally {
        await pool.end()
    }
}

main()