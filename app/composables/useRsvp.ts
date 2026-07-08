import type { RsvpInput } from '~~/shared/types/rsvp'

/**
 * Envía la confirmación de asistencia al BFF (`POST /api/rsvp`) y expone
 * el estado de la operación para la UI.
 */
export function useRsvp() {
  const submitting = ref(false)
  const success = ref(false)
  const errorMsg = ref('')

  async function submit(payload: RsvpInput) {
    submitting.value = true
    errorMsg.value = ''
    try {
      await $fetch('/api/rsvp', { method: 'POST', body: payload })
      success.value = true
    } catch (e) {
      const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
      errorMsg.value =
        err?.data?.statusMessage ??
        err?.statusMessage ??
        'No pudimos enviar tu confirmación. Inténtalo de nuevo.'
    } finally {
      submitting.value = false
    }
  }

  return { submitting, success, errorMsg, submit }
}
