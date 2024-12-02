import { DAY } from "@std/datetime"
import { render } from "solid-js/web"
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query"
import { persistQueryClient } from "@tanstack/query-persist-client-core"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools"
import { Router } from "@solidjs/router"

import "./index.css"
import App from "./App.tsx"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DAY,
      gcTime: DAY,
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    },
  },
})

const localStoragePersister = createSyncStoragePersister({
  storage: globalThis.localStorage,
})

persistQueryClient({
  queryClient,
  persister: localStoragePersister,
})

const root = document.getElementById("root")

const routes = [
  { path: "/gitsplash/", component: App },
  { path: "/gitsplash/:owner/:repo", component: App },
  { path: "/gitsplash/:owner/:repo/tree/:tree", component: App },
]

render(
  () => (
    <QueryClientProvider client={queryClient}>
      <Router>
        {routes}
      </Router>
      <SolidQueryDevtools />
    </QueryClientProvider>
  ),
  root!,
)
