import { addProblem } from "./services/problemService"
import { addSubmission } from "./services/submissionService"
import { pool } from "./db"

async function main() {
    const problem = await addProblem(
        146,
        "LRU Cache",
        "Medium",
        ["Hash Map", "Linked List", "Design"]
    )

    console.log("Problem:", problem)

    const submission = await addSubmission(
        problem.id,
        "JavaScript",
        "https://github.com/example/lru-cache"
    )

    console.log("Submission:", submission)

    await pool.end()
}

main()