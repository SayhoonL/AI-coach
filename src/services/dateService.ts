import { getCommitDateForPath } from "../github/githubService"
import {
    getSubmissionsWithoutDates,
    updateSubmissionDate
} from "./submissionService"

export async function backfillSubmissionDates() {
    const submissions = await getSubmissionsWithoutDates()

    console.log(
        `Finding dates for ${submissions.length} submissions...`
    )

    let updated = 0

    for (const submission of submissions) {
        const date = await getCommitDateForPath(
            submission.github_path
        )

        if (!date) {
            console.log(
                `No commit found: ${submission.submission_name}`
            )
            continue
        }

        await updateSubmissionDate(
            submission.github_path,
            date
        )

        updated++

        console.log(
            `Updated ${submission.submission_name} → ${date}`
        )
    }

    console.log("")
    console.log(`Dates updated: ${updated}`)
}