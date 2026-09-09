import { pool } from "../db"

export async function getTopicStats() {
    const result = await pool.query(`
        SELECT
            UNNEST(topics) AS topic,
            COUNT(DISTINCT p.id) AS problems_solved,
            COUNT(s.id) AS total_submissions,
            MAX(s.solved_at) AS last_practiced
        FROM problems p
        LEFT JOIN submissions s
            ON s.problem_id = p.id
        WHERE topics IS NOT NULL
        GROUP BY topic
        ORDER BY problems_solved DESC
    `)

    return result.rows
}

export async function getDifficultyStats() {
    const result = await pool.query(`
        SELECT
            difficulty,
            COUNT(DISTINCT p.id) AS problems_solved,
            COUNT(s.id) AS total_submissions
        FROM problems p
        LEFT JOIN submissions s
            ON s.problem_id = p.id
        WHERE difficulty IS NOT NULL
        GROUP BY difficulty
        ORDER BY difficulty
    `)

    return result.rows
}

export async function getRecentActivity(days = 7) {
    const result = await pool.query(
        `
        SELECT
            p.title,
            p.difficulty,
            p.topics,
            s.submission_name,
            s.language,
            s.solved_at
        FROM submissions s
        JOIN problems p
            ON p.id = s.problem_id
        WHERE s.solved_at >= NOW() - ($1 * INTERVAL '1 day')
        ORDER BY s.solved_at DESC
        `,
        [days]
    )

    return result.rows
}

export async function getWeakTopics() {
    const result = await pool.query(`
        SELECT
            UNNEST(p.topics) AS topic,
            COUNT(DISTINCT p.id)::int AS problems_solved,
            COUNT(s.id)::int AS total_submissions,
            MAX(s.solved_at) AS last_practiced
        FROM problems p
        JOIN submissions s
            ON s.problem_id = p.id
        WHERE p.topics IS NOT NULL
        GROUP BY topic
    `)

    return result.rows.map(row => {
        const problemsSolved = Number(row.problems_solved)

        const daysSincePractice =
            (
                Date.now() -
                new Date(row.last_practiced).getTime()
            ) /
            (1000 * 60 * 60 * 24)

        // Maximum useful coverage = 10 problems
        const coverageRatio =
            Math.min(problemsSolved / 10, 1)

        // Higher = less experience with the topic
        const weaknessScore =
            Math.round((1 - coverageRatio) * 100)

        // 30+ days without practice = maximum review urgency
        const reviewScore =
            Math.round(
                Math.min(daysSincePractice / 30, 1) * 100
            )

        return {
            topic: row.topic,
            problemsSolved,
            totalSubmissions: Number(row.total_submissions),
            lastPracticed: row.last_practiced,
            daysSincePractice: Math.round(daysSincePractice),
            weaknessScore,
            reviewScore
        }
    })
    .sort((a, b) => b.weaknessScore - a.weaknessScore)
}

export async function getProgress() {
    const totals = await pool.query(`
        SELECT
            COUNT(DISTINCT p.id)::int AS total_problems,
            COUNT(s.id)::int AS total_submissions
        FROM problems p
        LEFT JOIN submissions s
            ON s.problem_id = p.id
    `)

    const difficulty = await getDifficultyStats()
    const topics = await getTopicStats()
    const weakTopics = await getWeakTopics()

    return {
        totalProblems: totals.rows[0].total_problems,
        totalSubmissions: totals.rows[0].total_submissions,
        difficulty,
        topPracticedTopics: topics.slice(0, 5),
        weakestTopics: weakTopics.slice(0, 5)
    }
}

export async function getProblemHistory(query: string) {
    // Try exact slug/title first
    let problemResult = await pool.query(
        `
        SELECT *
        FROM problems
        WHERE slug = $1
           OR LOWER(title) = LOWER($1)
        LIMIT 1
        `,
        [query]
    )

    // If no exact match, try partial title
    if (problemResult.rows.length === 0) {
        problemResult = await pool.query(
            `
            SELECT *
            FROM problems
            WHERE title ILIKE $1
            LIMIT 1
            `,
            [`%${query}%`]
        )
    }

    if (problemResult.rows.length === 0) {
        return null
    }

    const problem = problemResult.rows[0]

    const submissionsResult = await pool.query(
        `
        SELECT
            submission_name,
            language,
            github_url,
            solved_at
        FROM submissions
        WHERE problem_id = $1
        ORDER BY solved_at ASC
        `,
        [problem.id]
    )

    const submissions = submissionsResult.rows

    return {
        title: problem.title,
        slug: problem.slug,
        difficulty: problem.difficulty,
        topics: problem.topics,

        totalAttempts: submissions.length,

        firstAttempt:
            submissions.length > 0
                ? submissions[0].solved_at
                : null,

        lastAttempt:
            submissions.length > 0
                ? submissions[submissions.length - 1].solved_at
                : null,

        submissions
    }
}