import type { Howl } from 'howler'

type SrcInput = string | undefined | (() => string | undefined)

/**
 * Gestor de música de fondo (Howler).
 * - NUNCA autoplay: solo suena tras una interacción del usuario.
 * - Fades suaves al entrar/salir.
 * - Import dinámico de Howler → seguro para SSR.
 */
export function useAudio(src: SrcInput, options?: { volume?: number; loop?: boolean }) {
  const isPlaying = ref(false)
  const isReady = ref(false)
  const targetVolume = options?.volume ?? 0.4

  let howl: Howl | null = null

  const resolveSrc = (): string | undefined =>
    typeof src === 'function' ? src() : src

  async function ensure(): Promise<Howl | null> {
    if (howl) return howl
    const source = resolveSrc()
    if (!source || import.meta.server) return null

    const { Howl } = await import('howler')
    howl = new Howl({
      src: [source],
      loop: options?.loop ?? true,
      volume: 0,
      html5: true,
      onloaderror: () => {
        isReady.value = false
        isPlaying.value = false
      },
      onplayerror: () => {
        isPlaying.value = false
      },
    })
    howl.once('load', () => {
      isReady.value = true
    })
    return howl
  }

  async function play() {
    if (isPlaying.value) return
    const instance = await ensure()
    if (!instance) return
    instance.play()
    instance.fade(0, targetVolume, 1200)
    isPlaying.value = true
  }

  function pause() {
    if (!howl) return
    const current = howl.volume()
    howl.fade(current, 0, 600)
    howl.once('fade', () => howl?.pause())
    isPlaying.value = false
  }

  async function toggle() {
    if (isPlaying.value) pause()
    else await play()
  }

  onBeforeUnmount(() => {
    howl?.unload()
    howl = null
  })

  return { isPlaying, isReady, play, pause, toggle }
}
