/**
 * Acciones de sesión del panel (login / logout) con estado para la UI.
 */
export function useAdminAuth() {
  const submitting = ref(false)
  const errorMsg = ref('')

  async function login(password: string) {
    submitting.value = true
    errorMsg.value = ''
    try {
      await $fetch('/api/admin/login', { method: 'POST', body: { password } })
      await navigateTo('/admin')
    } catch (e) {
      const err = e as { data?: { statusMessage?: string }; statusMessage?: string }
      errorMsg.value =
        err?.data?.statusMessage ?? err?.statusMessage ?? 'No pudimos iniciar sesión. Inténtalo de nuevo.'
    } finally {
      submitting.value = false
    }
  }

  async function logout() {
    try {
      await $fetch('/api/admin/logout', { method: 'POST' })
    } finally {
      await navigateTo('/admin/login')
    }
  }

  return { submitting, errorMsg, login, logout }
}
