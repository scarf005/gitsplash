import * as v from "@valibot/valibot"
import { Octokit, type RestEndpointMethodTypes } from "@octokit/rest"
import type { ImageGroup } from "./types.ts"

export const Integer = v.pipe(v.string(), v.transform(Number), v.integer())
export const catchAll = <Input, Output, Issue extends v.BaseIssue<unknown>>(
  schema: v.BaseSchema<Input, Output, Issue>,
) => v.fallback(v.nullable(schema), null)

export const queryImages = async (
  { auth, ...params }: RestEndpointMethodTypes["git"]["getTree"]["parameters"],
) => {
  const octokit = new Octokit({ auth })
  const { data, headers } = await octokit.rest.git.getTree(
    { ...params, recursive: "true" },
  )
  const rateLimitRemaining = v.parse(catchAll(Integer), headers["x-ratelimit-remaining"])
  const rateLimitReset = v.parse(
    catchAll(v.pipe(Integer, v.transform((x) => new Date(x)))),
    headers["x-ratelimit-reset"],
  )

  const groups = new Map<string, ImageGroup>()

  for (const file of data.tree) {
    if (!file.path || !file.sha || typeof file.path !== "string") continue
    if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.path)) continue

    const url =
      `https://raw.githubusercontent.com/${params.owner}/${params.repo}/${params.tree_sha}/${file.path}`

    const existing = groups.get(file.sha)
    if (existing) {
      existing.paths.add(file.path)
    } else {
      groups.set(file.sha, {
        url,
        paths: new Set([file.path]),
      })
    }
  }

  return { groups, rateLimitRemaining, rateLimitReset }
}
