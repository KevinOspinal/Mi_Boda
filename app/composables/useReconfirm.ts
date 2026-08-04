/**
 * Envía la reconfirmación de asistencia (semanas antes de la boda).
 * `coming` = true sigue asistiendo; false libera el puesto.
 */
export function useReconfirm() {
  const submitting = ref(false)
  const errorMsg = ref('')

  async function submit(code: string, coming: boolean): Promise<boolean> {
    submitting.value = true
    errorMsg.value = ''
    try {
      await $fetch('/api/reconfirm', { method: 'POST', body: { code, coming } })
      return true
    } catch (e) {
      const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
      errorMsg.value =
        err?.data?.statusMessage ?? err?.statusMessage ?? 'No pudimos registrar tu reconfirmación. Inténtalo de nuevo.'
      return false
    } finally {
      submitting.value = false
    }
  }

  return { submitting, errorMsg, submit }
}
