import { pool } from "./index"

async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problems (
                id SERIAL PRIMARY KEY,
                leetcode_id INTEGER UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                difficulty VARCHAR(20),
                topics TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                id SERIAL PRIMARY KEY,
                problem_id INTEGER NOT NULL REFERENCES problems(id),
                language VARCHAR(50),
                github_url TEXT,
                solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        console.log("Database initialized successfully")
    } catch (error) {
        console.error("Database initialization failed:", error)
    } finally {
        await pool.end()
    }
}

initDatabase()