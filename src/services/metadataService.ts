import fs from "fs"
import path from "path"
import { updateProblemMetadata } from "./problemService"

type MetadataProblem = {
    name: string
    difficulty: string
    category: string
    slug: string
}

type MetadataFile = {
    problems: MetadataProblem[]
}

const manualMetadata: MetadataProblem[] = [
    {
        slug: "count-vowel-strings-in-ranges",
        name: "Count Vowel Strings In Ranges",
        difficulty: "Medium",
        category: "Arrays & Hashing"
    },
    {
        slug: "first-unique-character-in-a-string",
        name: "First Unique Character In A String",
        difficulty: "Easy",
        category: "Arrays & Hashing"
    },
    {
        slug: "replace-elements-with-greatest-element-on-right-side",
        name: "Replace Elements With Greatest Element On Right Side",
        difficulty: "Easy",
        category: "Arrays & Hashing"
    }
]

export async function enrichProblemMetadata() {
    const filePath = path.join(
        process.cwd(),
        "src/data/neetcode250.json"
    )

    const raw = fs.readFileSync(filePath, "utf-8")

    const data: MetadataFile = JSON.parse(raw)

    let updated = 0
    let skipped = 0

    // Main NeetCode metadata
    for (const metadata of data.problems) {
        const problem = await updateProblemMetadata(
            metadata.slug,
            metadata.name,
            metadata.difficulty,
            metadata.category
        )

        if (problem) {
            updated++

            console.log(
                `Updated: ${metadata.name} → ${metadata.difficulty} / ${metadata.category}`
            )
        } else {
            skipped++
        }
    }

    // Problems missing from the metadata file
    for (const metadata of manualMetadata) {
        const problem = await updateProblemMetadata(
            metadata.slug,
            metadata.name,
            metadata.difficulty,
            metadata.category
        )

        if (problem) {
            updated++

            console.log(
                `Manual update: ${metadata.name} → ${metadata.difficulty} / ${metadata.category}`
            )
        }
    }

    console.log("")
    console.log("Metadata enrichment complete")
    console.log(`Problems updated: ${updated}`)
    console.log(`Metadata entries not in your DB: ${skipped}`)
}