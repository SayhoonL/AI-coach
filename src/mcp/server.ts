import { McpServer } from "@modelcontextprotocol/server"
import { serveStdio } from "@modelcontextprotocol/server/stdio"
import {
    getWeakTopics,
    getRecentActivity,
    getProgress
} from "../services/analyticsService.js"
import { recommendProblems } from "../services/recommendationService.js"
function createServer() {
    const server = new McpServer({
        name: "dsa-coach",
        version: "1.0.0"
    })

    server.registerTool(
        "get_weak_topics",
        {
            description:
                "Analyze the user's DSA practice history and return topics with low coverage and review urgency."
        },
        async () => {
            const topics = await getWeakTopics()

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(topics, null, 2)
                    }
                ]
            }
        }
    )
    server.registerTool(
        "get_recent_activity",
        {
            description:
                "Return the user's recent DSA submissions from the last 7 days."
        },
        async () => {
            const recent = await getRecentActivity(7)

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(recent, null, 2)
                    }
                ]
            }
        }
    )
    server.registerTool(
        "get_progress",
        {
            description:
                "Return an overall summary of the user's DSA practice progress."
        },
        async () => {
            const progress = await getProgress()

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(progress, null, 2)
                    }
                ]
            }
        }
    )
    server.registerTool(
        "recommend_problems",
        {
            description:
                "Recommend unsolved DSA problems based on the user's weakest practice categories."
        },
        async () => {
            const recommendations = await recommendProblems(5)

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(
                            recommendations,
                            null,
                            2
                        )
                    }
                ]
            }
        }
    )

    return server
}

void serveStdio(createServer)

console.error("DSA Coach MCP server running")

