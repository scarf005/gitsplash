import { Portal } from "solid-js/web"
import { createSignal, Show } from "solid-js"
import type { ImageGroup } from "../types.ts"

interface Props {
  image: ImageGroup | null
  isOpen: boolean
  onClose: () => void
  repoUrl: string
  branch: string
}

export function ImageModal(props: Props) {
  let modalRef: HTMLDivElement | undefined
  const [isClosing, setIsClosing] = createSignal(false)

  const handleClose = () => {
    setIsClosing(true)
    modalRef?.addEventListener("animationend", () => {
      setIsClosing(false)
      props.onClose()
    }, { once: true })
  }

  return (
    <Show when={props.image}>
      <Portal>
        <div
          ref={modalRef}
          class={`modal-overlay ${props.isOpen ? "open" : ""} ${isClosing() ? "closing" : ""}`}
          onClick={handleClose}
        >
          <div
            class="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={props.image?.url} alt="" />
            <div class="modal-info">
              <div class="modal-actions">
                <a
                  class="download-button"
                  href={props.image?.url}
                  download
                >
                  ⬇ Download
                </a>
                <a
                  href={`${props.repoUrl}/blob/${props.branch}/${
                    Array.from(props.image?.paths || [])[0]
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in Repository
                </a>
              </div>
              <div class="modal-paths">
                {Array.from(props.image?.paths || []).map((path) => <div class="path">{path}</div>)}
              </div>
            </div>
          </div>
        </div>
      </Portal>
    </Show>
  )
}
