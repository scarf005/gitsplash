import { A } from "@solidjs/router"
import { JSX } from "solid-js/jsx-runtime"
import { GitHubIcon, SocialLink } from "./SocialIcon.tsx"

export const Header = ({ children }: { children: JSX.Element }) => {
  return (
    <header>
      <A href="/">
        <h1>
          GitSplash
        </h1>
      </A>
      <section>
        <p>Convert any GitHub repository into an image gallery</p>
        <SocialLink
          href="https://github.com/scarf005/gitsplash"
          title="project repository"
        >
          <GitHubIcon />
        </SocialLink>
      </section>
      {children}
    </header>
  )
}
