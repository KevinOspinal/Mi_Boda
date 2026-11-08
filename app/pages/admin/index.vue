<script setup lang="ts">
import { wedding, coupleNames } from '~/config/wedding'
import type { AdminStats, AdminGuestsResponse, InviteStatus, ReconfirmStatus } from '~~/shared/types/admin'

definePageMeta({ middleware: 'admin', layout: 'default' })
useHead({
  title: `Panel · ${coupleNames}`,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const { logout } = useAdminAuth()

const { data: stats } = await useFetch<AdminStats>('/api/admin/stats')
const { data: guestsData, pending, refresh } = await useFetch<AdminGuestsResponse>('/api/admin/guests')

const guests = computed(() => guestsData.value?.guests ?? [])
const groups = computed(() => guestsData.value?.groups ?? [])

// --- Filtros ---------------------------------------------------------------
const search = ref('')
const statusFilter = ref<InviteStatus | 'todos'>('todos')
const groupFilter = ref<string>('todos')

const statusTabs: { key: InviteStatus | 'todos'; label: string }[] = [
  { key: 'todos', label: 'Todas' },
  { key: 'confirmado', label: 'Confirmadas' },
  { key: 'pendiente', label: 'Pendientes' },
  { key: 'no_asiste', label: 'No asisten' },
]

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return guests.value.filter((g) => {
    if (statusFilter.value !== 'todos' && g.status !== statusFilter.value) return false
    if (groupFilter.value !== 'todos' && g.groupLabel !== groupFilter.value) return false
    if (q && !g.displayName.toLowerCase().includes(q) && !(g.groupLabel ?? '').toLowerCase().includes(q))
      return false
    return true
  })
})

// --- Detalle expandible ----------------------------------------------------
const expanded = ref<Set<string>>(new Set())
function toggle(id: string) {
  const next = new Set(expanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expanded.value = next
}

// --- Copiar al portapapeles ------------------------------------------------
const copiedKey = ref<string | null>(null)
let copyTimer: ReturnType<typeof setTimeout> | null = null
async function copy(text: string, key: string) {
  try {
    await navigator.clipboard.writeText(text)
    copiedKey.value = key
    if (copyTimer) clearTimeout(copyTimer)
    copyTimer = setTimeout(() => (copiedKey.value = null), 1800)
  } catch {
    /* clipboard no disponible */
  }
}

// --- Presentación ----------------------------------------------------------
const statusMeta: Record<InviteStatus, { label: string; pill: string; dot: string }> = {
  confirmado: { label: 'Confirmado', pill: 'bg-primary/10 text-primary border-primary/25', dot: 'bg-primary' },
  pendiente: { label: 'Pendiente', pill: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-400' },
  no_asiste: { label: 'No asiste', pill: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-400' },
}

const reconfirmMeta: Record<ReconfirmStatus, { label: string; pill: string }> = {
  reconfirmado: { label: 'Reconfirmó', pill: 'bg-primary/10 text-primary border-primary/25' },
  por_reconfirmar: { label: 'Falta reconfirmar', pill: 'bg-amber-50 text-amber-700 border-amber-200' },
  cancelado: { label: 'Canceló', pill: 'bg-rose-50 text-rose-700 border-rose-200' },
  no_aplica: { label: '', pill: '' },
}

const confirmPct = computed(() => {
  const t = stats.value?.invitaciones ?? 0
  const c = stats.value?.confirmados ?? 0
  return t ? Math.round((c / t) * 100) : 0
})

function initials(name: string) {
  return name
    .replace(/^(fam\.?|familia)\s+/i, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

function fmtDate(iso: string | null) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="mx-auto max-w-6xl px-5 pb-24 pt-8 sm:px-8">
    <!-- ══ Encabezado ══ -->
    <header class="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p class="mb-2 text-[0.68rem] uppercase tracking-[0.4em] text-primary/70">Panel de novios</p>
        <h1 class="font-display text-4xl font-light leading-none text-ink sm:text-5xl">
          {{ wedding.couple.groomFirstName }}
          <span class="italic text-primary">&amp;</span>
          {{ wedding.couple.brideFirstName }}
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink-soft transition-colors hover:border-primary/50 hover:text-primary"
          @click="refresh()"
        >
          <svg class="h-4 w-4" :class="pending && 'animate-spin'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <path d="M21 12a9 9 0 10-2.6 6.4M21 12v5m0-5h-5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Actualizar
        </button>
        <a
          href="/api/admin/backup"
          download
          class="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink-soft transition-colors hover:border-primary/50 hover:text-primary"
          title="Descarga un .sql con todos los invitados, confirmaciones y mesas"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Respaldo
        </a>
        <button
          class="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-xs uppercase tracking-[0.15em] text-ink-soft transition-colors hover:border-rose-300 hover:text-rose-600"
          @click="logout()"
        >
          <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <path d="M15 12H4m0 0l3.5-3.5M4 12l3.5 3.5M14 5h4a2 2 0 012 2v10a2 2 0 01-2 2h-4" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          Salir
        </button>
      </div>
    </header>

    <!-- ══ Banda de resumen ══ -->
    <section class="mt-8 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <!-- Progreso de confirmaciones -->
      <div class="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-white to-wine-50 p-7">
        <BotanicalSprig class="pointer-events-none absolute -right-4 -top-3 w-20 rotate-12 opacity-40" />
        <p class="text-[0.7rem] uppercase tracking-[0.3em] text-ink-soft">Confirmaciones</p>
        <div class="mt-2 flex items-baseline gap-3">
          <span class="font-display text-6xl font-light leading-none text-ink">{{ stats?.confirmados ?? 0 }}</span>
          <span class="text-ink-soft">de {{ stats?.invitaciones ?? 0 }} invitaciones</span>
        </div>
        <div class="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-wine-100">
          <div
            class="h-full rounded-full bg-primary transition-[width] duration-700"
            :style="{ width: confirmPct + '%' }"
          />
        </div>
        <div class="mt-3 flex items-center justify-between text-sm text-ink-soft">
          <span>{{ confirmPct }}% respondió que sí</span>
          <span class="font-medium text-primary">{{ stats?.personas ?? 0 }} personas asistirán</span>
        </div>
      </div>

      <!-- Mini métricas -->
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col justify-center rounded-3xl border border-line bg-white p-5">
          <span class="font-display text-4xl font-light text-amber-600">{{ stats?.pendientes ?? 0 }}</span>
          <span class="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">Pendientes</span>
        </div>
        <div class="flex flex-col justify-center rounded-3xl border border-line bg-white p-5">
          <span class="font-display text-4xl font-light text-rose-500">{{ stats?.noAsisten ?? 0 }}</span>
          <span class="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">No asisten</span>
        </div>
        <div class="flex flex-col justify-center rounded-3xl border border-line bg-white p-5">
          <span class="font-display text-4xl font-light text-primary">{{ stats?.vieron ?? 0 }}</span>
          <span class="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">Vieron la invitación</span>
        </div>
        <div class="flex flex-col justify-center rounded-3xl border border-line bg-white p-5">
          <span class="font-display text-4xl font-light text-ink">{{ stats?.pasesTotales ?? 0 }}</span>
          <span class="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">Pases repartidos</span>
        </div>
      </div>
    </section>

    <!-- ══ Reconfirmación ══ -->
    <div class="mt-6">
      <AdminReconfirmPanel />
    </div>

    <!-- ══ Invitados ══ -->
    <section class="mt-12">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="font-display text-2xl font-light text-ink">Invitaciones</h2>
        <span class="text-sm text-ink-soft">{{ filtered.length }} de {{ guests.length }}</span>
      </div>

      <!-- Controles -->
      <div class="mt-5 space-y-4">
        <div class="relative">
          <svg class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4-4" stroke-linecap="round" />
          </svg>
          <input
            v-model="search"
            type="search"
            placeholder="Buscar por nombre o grupo…"
            class="w-full rounded-full border border-line bg-white py-3 pl-11 pr-4 text-ink outline-none transition-colors placeholder:text-ink-soft/40 focus:border-primary/70"
          >
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tab in statusTabs"
            :key="tab.key"
            class="rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors"
            :class="statusFilter === tab.key ? 'border-primary bg-primary text-white' : 'border-line text-ink-soft hover:border-primary/50 hover:text-primary'"
            @click="statusFilter = tab.key"
          >
            {{ tab.label }}
          </button>
          <span v-if="groups.length" class="mx-1 hidden h-5 w-px bg-line sm:block" />
          <select
            v-model="groupFilter"
            class="rounded-full border border-line bg-white px-4 py-1.5 text-xs uppercase tracking-[0.12em] text-ink-soft outline-none transition-colors focus:border-primary/70"
          >
            <option value="todos">Todos los grupos</option>
            <option v-for="grp in groups" :key="grp" :value="grp">{{ grp }}</option>
          </select>
        </div>
      </div>

      <!-- Lista -->
      <ul class="mt-6 space-y-3">
        <li
          v-for="g in filtered"
          :key="g.id"
          class="overflow-hidden rounded-2xl border border-line bg-white transition-shadow hover:shadow-[0_18px_50px_-38px_rgba(42,24,22,0.5)]"
        >
          <!-- Fila principal -->
          <div class="flex flex-wrap items-center gap-4 p-4 sm:flex-nowrap">
            <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wine-100 font-display text-lg text-primary">
              {{ initials(g.displayName) }}
            </div>

            <button class="min-w-0 flex-1 text-left" @click="toggle(g.id)">
              <p class="truncate font-medium text-ink">{{ g.displayName }}</p>
              <p class="mt-0.5 flex items-center gap-2 text-xs text-ink-soft">
                <span v-if="g.groupLabel">{{ g.groupLabel }}</span>
                <span v-if="g.groupLabel" class="h-0.5 w-0.5 rounded-full bg-ink-soft/40" />
                <span>{{ g.rsvp?.guestsCount ?? 0 }}/{{ g.maxPasses }} pases</span>
                <span v-if="g.openedAt" class="hidden items-center gap-1 text-primary/70 sm:inline-flex">
                  <span class="h-0.5 w-0.5 rounded-full bg-ink-soft/40" />
                  visto
                </span>
              </p>
            </button>

            <div class="flex shrink-0 flex-wrap items-center gap-1.5">
              <span
                class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.1em]"
                :class="statusMeta[g.status].pill"
              >
                <span class="h-1.5 w-1.5 rounded-full" :class="statusMeta[g.status].dot" />
                {{ statusMeta[g.status].label }}
              </span>
              <span
                v-if="g.reconfirmStatus !== 'no_aplica'"
                class="inline-flex items-center rounded-full border px-2.5 py-1 text-[0.62rem] font-medium uppercase tracking-[0.08em]"
                :class="reconfirmMeta[g.reconfirmStatus].pill"
              >
                {{ reconfirmMeta[g.reconfirmStatus].label }}
              </span>
            </div>

            <!-- Acciones -->
            <div class="flex shrink-0 items-center gap-1">
              <button
                class="relative rounded-full p-2.5 text-ink-soft transition-colors hover:bg-wine-50 hover:text-primary"
                title="Copiar enlace de invitación"
                @click="copy(g.inviteUrl, g.id + ':link')"
              >
                <svg v-if="copiedKey === g.id + ':link'" class="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                  <path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1.5 1.5M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1.5-1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
              <a
                :href="g.whatsappUrl"
                target="_blank"
                rel="noopener"
                class="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-wine-50 hover:text-primary"
                title="Enviar por WhatsApp"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 004.79 1.22c5.46 0 9.9-4.44 9.9-9.9S17.5 2 12.04 2zm0 18.13a8.2 8.2 0 01-4.19-1.15l-.3-.18-3.11.82.83-3.03-.2-.31a8.23 8.23 0 1115.28-4.38 8.23 8.23 0 01-8.11 8.42zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.8-.79.97-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.42l-.48-.01c-.16 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.13.16 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
                </svg>
              </a>
              <a
                v-if="g.reconfirmStatus !== 'no_aplica'"
                :href="g.reconfirmWhatsappUrl"
                target="_blank"
                rel="noopener"
                class="rounded-full p-2.5 text-ink-soft transition-colors hover:bg-amber-50 hover:text-amber-600"
                title="Pedir reconfirmación por WhatsApp"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                  <rect x="3" y="4.5" width="18" height="17" rx="2.5" />
                  <path d="M3 9h18M8 3v3M16 3v3M9 14.5l2 2 4-4" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </a>
              <button
                class="rounded-full p-2.5 text-ink-soft transition-transform hover:text-primary"
                :class="expanded.has(g.id) && 'rotate-180 text-primary'"
                title="Ver detalle"
                @click="toggle(g.id)"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                  <path d="M6 9l6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Detalle -->
          <transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[32rem]"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 max-h-[32rem]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div v-if="expanded.has(g.id)" class="overflow-hidden border-t border-line bg-wine-50/40">
              <dl class="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
                <div>
                  <dt class="text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">Enlace personal</dt>
                  <dd class="mt-1">
                    <button
                      class="flex max-w-full items-center gap-2 text-sm text-primary hover:underline"
                      @click="copy(g.inviteUrl, g.id + ':link2')"
                    >
                      <span class="truncate">{{ g.inviteUrl }}</span>
                      <span class="shrink-0 text-[0.65rem] uppercase tracking-wider text-ink-soft">
                        {{ copiedKey === g.id + ':link2' ? '¡copiado!' : 'copiar' }}
                      </span>
                    </button>
                  </dd>
                </div>
                <div>
                  <dt class="text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">Teléfono</dt>
                  <dd class="mt-1 text-sm text-ink">{{ g.phone || '—' }}</dd>
                </div>
                <div v-if="g.rsvp">
                  <dt class="text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">Asistentes</dt>
                  <dd class="mt-1 text-sm text-ink">{{ g.rsvp.attendeeNames || `${g.rsvp.guestsCount} persona(s)` }}</dd>
                </div>
                <div v-if="g.rsvp?.dietary">
                  <dt class="text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">Restricciones</dt>
                  <dd class="mt-1 text-sm text-ink">{{ g.rsvp.dietary }}</dd>
                </div>
                <div v-if="g.rsvp?.message" class="sm:col-span-2">
                  <dt class="text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">Mensaje</dt>
                  <dd class="mt-1 rounded-xl border border-line bg-white p-3 text-sm italic text-ink">“{{ g.rsvp.message }}”</dd>
                </div>
                <div class="sm:col-span-2 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-ink-soft">
                  <span>Abrió la invitación: <strong class="font-medium text-ink">{{ fmtDate(g.openedAt) || 'Aún no' }}</strong></span>
                  <span v-if="g.rsvp">Respondió: <strong class="font-medium text-ink">{{ fmtDate(g.rsvp.updatedAt) }}</strong></span>
                </div>
              </dl>
            </div>
          </transition>
        </li>
      </ul>

      <!-- Vacío -->
      <div v-if="!pending && filtered.length === 0" class="mt-10 flex flex-col items-center gap-3 py-14 text-center">
        <BotanicalSprig class="w-10 opacity-50" />
        <p class="text-ink-soft">No hay invitaciones que coincidan con el filtro.</p>
      </div>
    </section>
  </div>
</template>
