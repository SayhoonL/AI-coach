import { pool } from "../db"

export async function addSubmission(
    problemId: number,
    language: string,
    githubUrl: string
) {
    const result = await pool.query(
        `
        INSERT INTO submissions (
            problem_id,
            language,
            github_url
        )
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [problemId, language, githubUrl]
    )

    return result.rows[0]
}