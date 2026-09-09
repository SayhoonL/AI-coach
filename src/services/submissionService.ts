import { pool } from "../db"

export async function addSubmission(
    problemId: number,
    submissionName: string,
    language: string,
    githubUrl: string,
    githubPath: string
) {
    const result = await pool.query(
        `
        INSERT INTO submissions (
            problem_id,
            submission_name,
            language,
            github_url,
            github_path
        )
        VALUES ($1, $2, $3, $4, $5)

        ON CONFLICT (github_path)
        DO NOTHING

        RETURNING *
        `,
        [
            problemId,
            submissionName,
            language,
            githubUrl,
            githubPath
        ]
    )

    return result.rows[0]
}

export async function updateSubmissionDate(
    githubPath: string,
    solvedAt: string
) {
    await pool.query(
        `
        UPDATE submissions
        SET solved_at = $1
        WHERE github_path = $2
        `,
        [solvedAt, githubPath]
    )
}

export async function getSubmissionsWithoutDates() {
    const result = await pool.query(
        `
        SELECT *
        FROM submissions
        WHERE solved_at IS NULL
        `
    )

    return result.rows
}