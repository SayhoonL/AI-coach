import { getRepoContents } from "../github/githubService"
import { addProblem } from "./problemService"
import { addSubmission } from "./submissionService"

function slugToTitle(slug: string) {
    return slug
        .split("-")
        .map(
            word =>
                word.charAt(0).toUpperCase() +
                word.slice(1)
        )
        .join(" ")
}

function getLanguage(filename: string) {
    const extension = filename.split(".").pop()

    if (extension === "js") return "JavaScript"
    if (extension === "ts") return "TypeScript"
    if (extension === "py") return "Python"
    if (extension === "java") return "Java"
    if (extension === "cpp") return "C++"

    return extension ?? "Unknown"
}

export async function syncGitHub() {
    const rootPath = "Data Structures & Algorithms"

    const folders = await getRepoContents(rootPath)

    let problemsScanned = 0
    let submissionsAdded = 0

    for (const folder of folders) {
        if (folder.type !== "dir") {
            continue
        }

        const slug = folder.name
        const title = slugToTitle(slug)

        const problem = await addProblem(
            slug,
            title
        )

        problemsScanned++

        const files = await getRepoContents(folder.path)

        for (const file of files) {
            if (file.type !== "file") {
                continue
            }

            if (!file.name.startsWith("submission-")) {
                continue
            }

            const language = getLanguage(file.name)

            const submission = await addSubmission(
                problem.id,
                file.name,
                language,
                file.html_url,
                file.path
            )

            if (submission) {
                submissionsAdded++

                console.log(
                    `Added: ${title} → ${file.name}`
                )
            }
        }
    }

    console.log("")
    console.log("Sync complete")
    console.log(`Problems scanned: ${problemsScanned}`)
    console.log(`New submissions: ${submissionsAdded}`)
}