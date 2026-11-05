<script setup lang="ts">
import { weddingDayStart } from '~/config/wedding'
import type { AdminReconfirm } from '~~/shared/types/admin'

const { data } = await useFetch<AdminReconfirm>('/api/admin/reconfirm')
const saving = ref(false)

const overrides: { key: AdminReconfirm['override']; label: string }[] = [
  { key: 'auto', label: 'Automática' },
  { key: 'abrir', label: 'Abrir ahora' },
  { key: 'cerrar', label: 'Cerrar' },
]

async function post(body: Record<string, unknown>) {
  saving.value = true
  try {
    data.value = await $fetch<AdminReconfirm>('/api/admin/reconfirm', { method: 'POST', body })
  } finally {
    saving.value = false
  }
}

async function setOverride(override: AdminReconfirm['override']) {
  if (saving.value || data.value?.override === override) return
  await post({ override })
}

// --- Parámetro editable: días antes de la boda -----------------------------
const diasApertura = ref(data.value?.diasAntesApertura ?? 15)
const diasLimite = ref(data.value?.diasAntesLimite ?? 7)
watch(data, (d) => {
  if (!d) return
  diasApertura.value = d.diasAntesApertura
  diasLimite.value = d.diasAntesLimite ?? diasLimite.value
})
const diasChanged = computed(
  () =>
    !!data.value &&
    (diasApertura.value !== data.value.diasAntesApertura ||
      diasLimite.value !== (data.value.diasAntesLimite ?? diasLimite.value)),
)
async function saveDias() {
  if (!diasChanged.value || saving.value) return
  await post({ daysBefore: diasApertura.value, deadlineDaysBefore: diasLimite.value })
}

// Vista previa en vivo de la fecha de apertura según los días escritos.
const previewApertura = computed(() => {
  const base = new Date(weddingDayStart).getTime()
  const d = new Date(base - (diasApertura.value || 0) * 86_400_000)
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
})

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
}
</script>

<template>
  <section
    v-if="data"
    class="relative overflow-hidden rounded-3xl border border-line bg-white p-6 sm:p-7"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-[0.68rem] uppercase tracking-[0.3em] text-primary/70">Reconfirmación</p>
        <h2 class="mt-1 font-display text-2xl font-light text-ink">
          Ventana de reconfirmación
        </h2>
      </div>
      <span
        class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.72rem] font-medium uppercase tracking-[0.12em]"
        :class="data.open ? 'border-primary/25 bg-primary/10 text-primary' : 'border-line bg-surface-alt/60 text-ink-soft'"
      >
        <span class="h-2 w-2 rounded-full" :class="data.open ? 'bg-primary' : 'bg-ink-soft/40'" />
        {{ data.open ? 'Abierta' : 'Cerrada' }}
      </span>
    </div>

    <!-- Control segmentado -->
    <div class="mt-5">
      <div class="inline-flex flex-wrap gap-1 rounded-full border border-line bg-surface-alt/40 p-1">
        <button
          v-for="o in overrides"
          :key="o.key"
          class="rounded-full px-4 py-1.5 text-xs uppercase tracking-[0.1em] transition-colors disabled:opacity-50"
          :class="data.override === o.key ? 'bg-primary text-white' : 'text-ink-soft hover:text-primary'"
          :disabled="saving"
          @click="setOverride(o.key)"
        >
          {{ o.label }}
        </button>
      </div>
      <p class="mt-3 text-sm text-ink-soft">
        <template v-if="data.override === 'auto'">
          Se abre sola el <strong class="text-ink">{{ fmt(data.from) }}</strong>
          <template v-if="data.diasParaBoda >= 0"> · faltan {{ data.diasParaBoda }} días para la boda</template>
        </template>
        <template v-else-if="data.override === 'abrir'">
          Forzada <strong class="text-ink">abierta</strong>: los confirmados verán el aviso de reconfirmación.
        </template>
        <template v-else>
          Forzada <strong class="text-ink">cerrada</strong>: nadie verá el aviso, aunque llegue la fecha.
        </template>
      </p>
      <p v-if="data.deadline" class="mt-1 text-xs text-ink-soft/70">
        Fecha límite mostrada a los invitados: {{ fmt(data.deadline) }}
      </p>

      <!-- Parámetro editable: días antes de la boda -->
      <div class="mt-4 rounded-2xl border border-line bg-surface-alt/30 p-4">
        <p class="text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">Cuándo se abre (parametrizable)</p>
        <div class="mt-3 flex flex-wrap items-end gap-x-6 gap-y-3">
          <label class="flex items-center gap-2 text-sm text-ink-soft">
            Se abre
            <input
              v-model.number="diasApertura"
              type="number"
              min="0"
              max="180"
              class="w-16 rounded-lg border border-line bg-white px-2 py-1.5 text-center text-ink outline-none focus:border-primary/70"
            >
            días antes
          </label>
          <label class="flex items-center gap-2 text-sm text-ink-soft">
            Fecha límite
            <input
              v-model.number="diasLimite"
              type="number"
              min="0"
              max="180"
              class="w-16 rounded-lg border border-line bg-white px-2 py-1.5 text-center text-ink outline-none focus:border-primary/70"
            >
            días antes
          </label>
          <button
            class="rounded-full bg-primary px-4 py-1.5 text-xs uppercase tracking-[0.12em] text-white transition-opacity hover:bg-primary-soft disabled:opacity-40"
            :disabled="!diasChanged || saving"
            @click="saveDias"
          >
            {{ saving ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
        <p class="mt-2 text-xs text-ink-soft/70">
          Con la boda el 11 de octubre, {{ diasApertura }} días antes = se abriría el
          <strong class="text-ink">{{ previewApertura }}</strong> (en modo automático).
        </p>
      </div>
    </div>

    <!-- Métricas de reconfirmación -->
    <div class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div class="rounded-2xl border border-line bg-surface-alt/30 p-4">
        <span class="font-display text-3xl font-light text-primary">{{ data.reconfirmados }}</span>
        <span class="mt-1 block text-[0.65rem] uppercase tracking-[0.15em] text-ink-soft">Reconfirmados</span>
      </div>
      <div class="rounded-2xl border border-line bg-surface-alt/30 p-4">
        <span class="font-display text-3xl font-light text-amber-600">{{ data.porReconfirmar }}</span>
        <span class="mt-1 block text-[0.65rem] uppercase tracking-[0.15em] text-ink-soft">Por reconfirmar</span>
      </div>
      <div class="rounded-2xl border border-line bg-surface-alt/30 p-4">
        <span class="font-display text-3xl font-light text-rose-500">{{ data.cancelados }}</span>
        <span class="mt-1 block text-[0.65rem] uppercase tracking-[0.15em] text-ink-soft">Cancelaron</span>
      </div>
      <div class="rounded-2xl border border-line bg-surface-alt/30 p-4">
        <span class="font-display text-3xl font-light text-ink">{{ data.personasSeguras }}</span>
        <span class="mt-1 block text-[0.65rem] uppercase tracking-[0.15em] text-ink-soft">Personas seguras</span>
      </div>
    </div>
  </section>
</template>
