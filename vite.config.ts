import { defineConfig } from "vite"
import deno from "@deno/vite-plugin"
import solid from "vite-plugin-solid"
import devtools from "solid-devtools/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [deno(), solid(), devtools()],
  base: "/gitsplash/",
})
