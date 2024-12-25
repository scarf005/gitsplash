import { Octokit } from "@octokit/rest"
import { createMemo, createSignal, Match, Show, Switch } from "solid-js"
import { createQuery } from "@tanstack/solid-query"
import { useNavigate, useParams } from "@solidjs/router"
import { Gallery } from "./components/Gallery.tsx"
import type { ImageGroup } from "./types.ts"
import { Time } from "./components/Time.tsx"
import "./App.css"
import { GitHubIcon, SocialLink } from "./components/SocialIcon.tsx"

export default function App() {
  const params = useParams<{ owner?: string; repo?: string; tree?: string }>()
  const navigate = useNavigate()
  const [token, setToken] = createSignal<string | null>(null)
  const [rateLimitRemaining, setRateLimitRemaining] = createSignal<number | null>(null)
  const [rateLimitReset, setRateLimitReset] = createSignal<Date | null>(null)
  const [columnCount, setColumnCount] = createSignal(4)

  const repoQuery = createQuery(() => ({
    queryKey: ["owner", params.owner, "repo", params.repo, "tree", params.tree, "token", token()],
    queryFn: async () => {
      if (!params.owner || !params.repo) {
        throw new Error("Please provide repository path in format 'owner/repo'")
      }

      const octokit = new Octokit({ auth: token() })

      const { data, headers } = await octokit.rest.git.getTree(
        {
          owner: params.owner,
          repo: params.repo,
          tree_sha: params.tree || "main",
          recursive: "true",
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        },
      )
      return { data, headers }
    },
    enabled: Boolean(params.owner && params.repo),
    initialData: undefined,
  }))

  // Transform raw data into image groups
  const imageGroups = createMemo(() => {
    if (!repoQuery.data?.data?.tree) return new Map<string, ImageGroup>()

    const { data, headers } = repoQuery.data

    // Update rate limit info
    if (headers) {
      setRateLimitRemaining(
        headers["x-ratelimit-remaining"] ? Number(headers["x-ratelimit-remaining"]) : null,
      )
      setRateLimitReset(
        headers["x-ratelimit-reset"] ? new Date(Number(headers["x-ratelimit-reset"]) * 1000) : null,
      )
    }

    const groups = new Map<string, ImageGroup>()

    for (const file of data.tree) {
      if (!file.path || !file.sha || typeof file.path !== "string") continue
      if (!/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.path)) continue

      const url = `https://raw.githubusercontent.com/${params.owner}/${params.repo}/${
        params.tree || "main"
      }/${file.path}`

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

    return groups
  })

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    const form = e.currentTarget as HTMLFormElement
    const formData = new FormData(form)
    const path = formData.get("repo") as string
    const tree = formData.get("tree") as string
    const [owner, repo] = path.split("/")

    if (owner && repo) {
      navigate(`/${owner}/${repo}${tree !== "main" ? `/tree/${tree}` : ""}`)
    }
  }

  return (
    <main class="container">
      <header>
        <h1>GitSplash</h1>
        <section>
          <p>Convert any GitHub repository into an image gallery</p>
          <SocialLink
            href="https://github.com/scarf005/gitsplash"
            title="project repository"
          >
            <GitHubIcon />
          </SocialLink>
        </section>
        <div class="rate-limit-info">
          <span>Rate Limit Remaining: {rateLimitRemaining()}</span>
          <span>
            Rate Limit Reset:{"  "}
            <Switch fallback="-">
              <Match when={rateLimitReset()}>{(reset) => <Time time={reset()} />}</Match>
            </Switch>
          </span>
        </div>
      </header>

      <form onSubmit={handleSubmit} class="search-form">
        <div class="form-group">
          <input
            type="text"
            name="repo"
            value={params.owner && params.repo ? `${params.owner}/${params.repo}` : ""}
            placeholder="Enter repository path (e.g. owner/repo)"
          />
          <input
            type="text"
            name="tree"
            value={params.tree || "main"}
            placeholder="Enter branch or commit SHA (default: main)"
          />
          <input
            type="password"
            value={token() || ""}
            onInput={(e) => setToken(e.currentTarget.value)}
            placeholder="GitHub token (optional)"
          />
          <div class="column-control">
            <label>Columns</label>
            <input
              type="range"
              min="1"
              max="12"
              value={columnCount()}
              onInput={(e) => setColumnCount(parseInt(e.currentTarget.value))}
            />
          </div>
          <button type="submit">Load Images</button>
        </div>
      </form>

      <Show when={repoQuery.error}>
        <div class="error">{(repoQuery.error as Error).message}</div>
      </Show>

      <Show when={repoQuery.isLoading}>
        <div class="loading">Loading images...</div>
      </Show>

      <Show when={!repoQuery.isLoading}>
        <Gallery
          images={imageGroups()}
          repoUrl={params.owner && params.repo
            ? `https://github.com/${params.owner}/${params.repo}`
            : ""}
          branch={params.tree || "main"}
          columnCount={columnCount()}
        />
      </Show>
    </main>
  )
}
