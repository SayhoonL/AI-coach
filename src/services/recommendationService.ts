import fs from "fs"
import path from "path"
import { pool } from "../db/index.js"
import { getWeakTopics } from "./analyticsService.js"

type MetadataProblem = {
    name: string
    difficulty: string
    category: string
    slug: string
    neetcode_url?: string
    leetcode_url?: string
}

type MetadataFile = {
    problems: MetadataProblem[]
}

export async function recommendProblems(limit = 5) {
    // 1. Get your weak topics
    const weakTopics = await getWeakTopics()

    const weakTopicMap = new Map(
        weakTopics.map(topic => [
            topic.topic,
            {
                weaknessScore: topic.weaknessScore,
                reviewScore: topic.reviewScore
            }
        ])
    )

    // 2. Get everything you've already solved
    const solvedResult = await pool.query(`
        SELECT slug
        FROM problems
    `)

    const solvedSlugs = new Set(
        solvedResult.rows.map(row => row.slug)
    )

    // 3. Load the full NeetCode catalog
    const filePath = path.join(
        process.cwd(),
        "src/data/neetcode250.json"
    )

    const raw = fs.readFileSync(filePath, "utf-8")
    const data: MetadataFile = JSON.parse(raw)

    // 4. Keep unsolved problems from weak categories
    const candidates = data.problems
        .filter(problem => !solvedSlugs.has(problem.slug))
        .filter(problem => {
            const topic = weakTopicMap.get(problem.category)

            return topic && topic.weaknessScore > 0
        })
        .map(problem => {
            const topic = weakTopicMap.get(problem.category)!

            return {
                ...problem,
                weaknessScore: topic.weaknessScore,
                reviewScore: topic.reviewScore
            }
        })

    // 5. Prioritize your weakest categories
    const difficultyOrder: Record<string, number> = {
        Easy: 1,
        Medium: 2,
        Hard: 3
    }

    candidates.sort((a, b) => {
        if (b.weaknessScore !== a.weaknessScore) {
            return b.weaknessScore - a.weaknessScore
        }

        return (
            difficultyOrder[a.difficulty] -
            difficultyOrder[b.difficulty]
        )
    })

    // 6. Return recommendations
    return candidates
        .slice(0, limit)
        .map(problem => ({
            title: problem.name,
            slug: problem.slug,
            difficulty: problem.difficulty,
            topic: problem.category,
            weaknessScore: problem.weaknessScore,
            reason:
                `Your ${problem.category} coverage is relatively low.`,
            neetcodeUrl: problem.neetcode_url,
            leetcodeUrl: problem.leetcode_url
        }))
}

export async function getReviewProblems(limit = 5) {
    const weakTopics = await getWeakTopics()

    const topicScores = new Map(
        weakTopics.map(topic => [
            topic.topic,
            {
                weaknessScore: topic.weaknessScore,
                reviewScore: topic.reviewScore
            }
        ])
    )

    const result = await pool.query(`
        SELECT
            p.id,
            p.slug,
            p.title,
            p.difficulty,
            p.topics,
            COUNT(s.id)::int AS attempts,
            MAX(s.solved_at) AS last_solved
        FROM problems p
        JOIN submissions s
            ON s.problem_id = p.id
        GROUP BY p.id
    `)

    const candidates = result.rows.map(problem => {
        const topic = problem.topics?.[0]

        const topicData = topicScores.get(topic)

        const daysSinceSolved =
            (
                Date.now() -
                new Date(problem.last_solved).getTime()
            ) /
            (1000 * 60 * 60 * 24)

        const weaknessScore =
            topicData?.weaknessScore ?? 0

        const reviewScore =
            topicData?.reviewScore ?? 0

        const score =
            daysSinceSolved +
            weaknessScore * 0.5 +
            reviewScore * 0.5

        return {
            title: problem.title,
            slug: problem.slug,
            difficulty: problem.difficulty,
            topic,
            attempts: problem.attempts,
            lastSolved: problem.last_solved,
            daysSinceSolved: Math.round(daysSinceSolved),
            score: Math.round(score)
        }
    })

    return candidates
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
}