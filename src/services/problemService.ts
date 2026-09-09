import { pool } from "../db"

export async function addProblem(
    slug: string,
    title: string
) {
    const result = await pool.query(
        `
        INSERT INTO problems (
            slug,
            title
        )
        VALUES ($1, $2)

        ON CONFLICT (slug)
        DO UPDATE SET
            title = EXCLUDED.title

        RETURNING *
        `,
        [slug, title]
    )

    return result.rows[0]
}