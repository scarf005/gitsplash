import { DAY } from "@std/datetime"
import { render } from "solid-js/web"
import { QueryClient } from "@tanstack/solid-query"
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister"
import { SolidQueryDevtools } from "@tanstack/solid-query-devtools"
import { Router } from "@solidjs/router"
import { PersistQueryClientProvider } from "@tanstack/solid-query-persist-client"
import { Serializer } from "@denostack/superserial"
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
      refetchOnReconnect: false,
    },
  },
})

const serializer = new Serializer()
const localStoragePersister = createSyncStoragePersister({
  storage: globalThis.localStorage,
  serialize: (x) => serializer.serialize(x),
  deserialize: (x) => serializer.deserialize(x),
})

const root = document.getElementById("root")

const routes = [
  { path: "/", component: App },
  { path: "/:owner/:repo", component: App },
  { path: "/:owner/:repo/tree/:tree", component: App },
]

render(
  () => (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: localStoragePersister }}
    >
      <Router>
        {routes}
      </Router>
      <SolidQueryDevtools buttonPosition="bottom-left" />
    </PersistQueryClientProvider>
  ),
  root!,
)
