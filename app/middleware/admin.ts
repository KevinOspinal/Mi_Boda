/**
 * Protege las rutas del panel: si no hay sesión, redirige al login.
 * Reenvía la cookie durante el render en servidor para que la sesión se
 * detecte también en la primera carga (SSR).
 */
export default defineNuxtRouteMiddleware(async () => {
  try {
    const { authenticated } = await $fetch<{ authenticated: boolean }>('/api/admin/session', {
      headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
    })
    if (!authenticated) {
      return navigateTo('/admin/login')
    }
  } catch {
    return navigateTo('/admin/login')
  }
})
