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

export async function updateProblemMetadata(
    slug: string,
    title: string,
    difficulty: string,
    category: string
) {
    const result = await pool.query(
        `
        UPDATE problems
        SET
            title = $1,
            difficulty = $2,
            topics = $3
        WHERE slug = $4
        RETURNING *
        `,
        [
            title,
            difficulty,
            [category],
            slug
        ]
    )

    return result.rows[0]
}