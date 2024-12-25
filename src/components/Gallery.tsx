import { createSignal, For, Show } from "solid-js"
import { ImageModal } from "./ImageModal.tsx"
import type { ImageGroup } from "../fetch.ts"

interface Props {
  images: Map<string, ImageGroup>
  repoUrl: string
  branch: string
  columnCount: number
}

export function Gallery(props: Props) {
  const [selectedImage, setSelectedImage] = createSignal<ImageGroup | null>(null)
  const [isOpen, setIsOpen] = createSignal(false)

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => setSelectedImage(null), 300)
  }

  return (
    <>
      <div
        class="gallery"
        style={{ "--columns": props.columnCount }}
      >
        <For each={Array.from(props.images.values())}>
          {(image) => (
            <div
              class="image-container"
              onClick={() => {
                setSelectedImage(image)
                setIsOpen(true)
              }}
            >
              <img src={image.url} alt="" loading="lazy" />
              <div class="image-overlay">
                <div class="image-actions">
                  <a
                    class="download-button"
                    href={image.url}
                    download
                    onClick={(e) => e.stopPropagation()}
                  >
                    ⬇
                  </a>
                </div>
                <div class="image-info">
                  <a
                    href={`${props.repoUrl}/blob/${props.branch}/${Array.from(image.paths)[0]}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {Array.from(image.paths)[0]}
                  </a>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      <Show when={isOpen()}>
        <ImageModal
          image={selectedImage()!}
          repoUrl={props.repoUrl}
          branch={props.branch}
          isOpen={isOpen()}
          onClose={handleClose}
        />
      </Show>
    </>
  )
}
