import { defineStore } from 'pinia'

/** Fases del recorrido cinematográfico. */
export type ExperiencePhase = 'loading' | 'envelope' | 'opening' | 'letter' | 'experience'

/**
 * Estado global y ligero de la experiencia: en qué fase estamos, si el usuario
 * ya interactuó (necesario para poder reproducir audio) y el estado de la música.
 */
export const useExperienceStore = defineStore('experience', () => {
  const phase = ref<ExperiencePhase>('loading')
  const hasInteracted = ref(false)
  const musicEnabled = ref(false)

  function setPhase(next: ExperiencePhase) {
    phase.value = next
  }

  function markInteracted() {
    hasInteracted.value = true
  }

  function setMusic(enabled: boolean) {
    musicEnabled.value = enabled
  }

  return { phase, hasInteracted, musicEnabled, setPhase, markInteracted, setMusic }
})
