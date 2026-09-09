import { pool } from "./index"

async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS problems (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                leetcode_id INTEGER,
                difficulty VARCHAR(20),
                topics TEXT[],
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `)

        await pool.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                id SERIAL PRIMARY KEY,
                problem_id INTEGER NOT NULL REFERENCES problems(id),
                submission_name VARCHAR(255) NOT NULL,
                language VARCHAR(50),
                github_url TEXT NOT NULL,
                github_path TEXT UNIQUE NOT NULL,
                solved_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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