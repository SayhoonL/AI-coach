export async function getRepoContents(path = "") {
    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO
    const token = process.env.GITHUB_TOKEN

    const encodedPath = path
        .split("/")
        .map(encodeURIComponent)
        .join("/")

    const url = encodedPath
        ? `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`
        : `https://api.github.com/repos/${owner}/${repo}/contents`

    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`
        }
    })

    if (!response.ok) {
        throw new Error(
            `GitHub request failed: ${response.status} ${response.statusText}`
        )
    }

    return response.json()
}

export async function getCommitDateForPath(path: string) {
    const owner = process.env.GITHUB_OWNER
    const repo = process.env.GITHUB_REPO
    const token = process.env.GITHUB_TOKEN

    const params = new URLSearchParams({
        path,
        per_page: "1"
    })

    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?${params}`,
        {
            headers: {
                Accept: "application/vnd.github+json",
                Authorization: `Bearer ${token}`
            }
        }
    )

    if (!response.ok) {
        throw new Error(
            `GitHub commit request failed: ${response.status}`
        )
    }

    const commits = await response.json()

    if (commits.length === 0) {
        return null
    }

    return commits[0].commit.author.date
}