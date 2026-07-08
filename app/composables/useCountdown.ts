/**
 * Cuenta regresiva reactiva hacia una fecha objetivo (ISO 8601).
 * Se actualiza cada segundo en el cliente; expone días/horas/min/seg y si ya pasó.
 */
export function useCountdown(target: string) {
  const targetMs = new Date(target).getTime()

  const now = ref(Date.now())
  const days = ref(0)
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const isPast = ref(false)

  function update() {
    now.value = Date.now()
    let diff = Math.max(0, targetMs - now.value)
    isPast.value = targetMs - now.value <= 0

    const d = Math.floor(diff / 86_400_000)
    diff -= d * 86_400_000
    const h = Math.floor(diff / 3_600_000)
    diff -= h * 3_600_000
    const m = Math.floor(diff / 60_000)
    diff -= m * 60_000
    const s = Math.floor(diff / 1000)

    days.value = d
    hours.value = h
    minutes.value = m
    seconds.value = s
  }

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })
  onBeforeUnmount(() => {
    if (timer) clearInterval(timer)
  })

  return { days, hours, minutes, seconds, isPast }
}
