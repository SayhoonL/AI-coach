import { pool } from "../db"

export async function addProblem(
    leetcodeId: number,
    title: string,
    difficulty: string,
    topics: string[]
) {
    const result = await pool.query(
        `
        INSERT INTO problems (
            leetcode_id,
            title,
            difficulty,
            topics
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (leetcode_id)
        DO UPDATE SET
            title = EXCLUDED.title,
            difficulty = EXCLUDED.difficulty,
            topics = EXCLUDED.topics
        RETURNING *
        `,
        [leetcodeId, title, difficulty, topics]
    )

    console.log("DB rows:", result.rows)

    return result.rows[0]
}