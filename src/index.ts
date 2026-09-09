import dotenv from "dotenv"
import { getWeakTopics } from "./services/analyticsService"
import { pool } from "./db"

dotenv.config()

async function main() {
    try {
        const weakTopics = await getWeakTopics()

        console.table(weakTopics)
    } catch (error) {
        console.error("Weak topic analysis failed:", error)
    } finally {
        await pool.end()
    }
}

main()