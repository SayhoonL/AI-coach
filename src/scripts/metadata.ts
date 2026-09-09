import { enrichProblemMetadata } from "../services/metadataService.js"
import { pool } from "../db/index.js"

async function main() {
    try {
        await enrichProblemMetadata()
    } catch (error) {
        console.error("Metadata enrichment failed:", error)
    } finally {
        await pool.end()
    }
}

main()