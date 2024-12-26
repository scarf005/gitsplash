import { createSignal, Match, Switch } from "solid-js"
import { createQuery } from "@tanstack/solid-query"
import { useNavigate, useParams } from "@solidjs/router"
import { Gallery } from "./components/Gallery.tsx"
import { Time } from "./components/Time.tsx"
import { queryImages } from "./fetch.ts"
import { Header } from "./components/Header.tsx"
import "./App.css"

export default function App() {
  const params = useParams<{ owner?: string; repo?: string; tree?: string }>()
  const navigate = useNavigate()
  const [token, setToken] = createSignal<string | null>(null)
  const [columnCount, setColumnCount] = createSignal(4)

  const repoQuery = createQuery(() => ({
    queryKey: ["owner", params.owner, "repo", params.repo, "tree", params.tree, "token", token()],
    queryFn: () => {
      if (!params.owner || !params.repo) {
        throw new Error("Please provide repository path in format 'owner/repo'")
      }
      return queryImages({
        owner: params.owner,
        repo: params.repo,
        tree_sha: params.tree || "main",
        auth: token(),
      })
    },
    enabled: Boolean(params.owner && params.repo),
    initialData: undefined,
  }))
  console.log(repoQuery.data)

  const handleSubmit = (e: Event) => {
    e.preventDefault()
    if (repoQuery.isSuccess) {
      repoQuery.refetch()
      return
    }

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
      <Header>
        <div class="rate-limit-info">
          <span>Rate Limit Remaining: {repoQuery.data?.rateLimitRemaining}</span>
          <span>
            Rate Limit Reset:{"  "}{repoQuery.data?.rateLimitReset instanceof Date
              ? <Time time={repoQuery.data?.rateLimitReset} />
              : (
                "-"
              )}
          </span>
        </div>
      </Header>

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
          <Switch fallback={<button type="submit">Load Images</button>}>
            <Match when={repoQuery.isSuccess}>
              <button type="submit">Reload Images</button>
              <p>
                last fetched at:{" "}
                {repoQuery.dataUpdatedAt ? <Time time={new Date(repoQuery.dataUpdatedAt)} /> : "-"}
              </p>
            </Match>
          </Switch>
        </div>
      </form>

      <Switch>
        <Match when={repoQuery.isError}>
          <div class="error">{(repoQuery.error as Error).message}</div>
        </Match>
        <Match when={repoQuery.isFetching}>
          <div class="loading">Loading images...</div>
        </Match>
        <Match when={repoQuery.data}>
          {(data) => (
            <Gallery
              images={data().groups}
              repoUrl={params.owner && params.repo
                ? `https://github.com/${params.owner}/${params.repo}`
                : ""}
              branch={params.tree || "main"}
              columnCount={columnCount()}
            />
          )}
        </Match>
      </Switch>
    </main>
  )
}
