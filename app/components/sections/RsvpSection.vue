<script setup lang="ts">
import type { Guest } from '~~/shared/types/guest'
import type { ExistingRsvp } from '~~/shared/types/rsvp'
import type { MesaResponse, MesaView } from '~~/shared/types/mesa'
import { useRsvp } from '~/composables/useRsvp'
import { useConfetti } from '~/composables/useConfetti'

const props = defineProps<{ guest: Guest; existingRsvp: ExistingRsvp | null }>()

const { submitting, success, errorMsg, submit } = useRsvp()
const { burst } = useConfetti()

// Estado del formulario
const attending = ref<boolean | null>(null)
const guestsCount = ref(props.guest.maxPasses)
const message = ref('')

// ¿Ya había respondido antes (guardado en la BD)? → se bloquea el formulario.
const alreadyResponded = computed(() => props.existingRsvp !== null)
const responded = computed(() => success.value || alreadyResponded.value)
const respondedAttending = computed(() =>
  success.value ? attending.value === true : (props.existingRsvp?.attending ?? false),
)
const respondedCount = computed(() =>
  success.value ? guestsCount.value : (props.existingRsvp?.guestsCount ?? 0),
)

// Mesa asignada (se carga cuando el invitado ya confirmó asistencia).
const mesa = ref<MesaView | null>(null)
const mesaEl = ref<HTMLElement>()
async function loadMesa() {
  try {
    const res = await $fetch<MesaResponse>(`/api/mesa/${props.guest.code}`)
    mesa.value = res.mesa
  } catch {
    mesa.value = null
  }
}

// Celebración al confirmar + cargar su mesa, y bajar solo hasta la mesa
// después de ~2.5s para que el invitado no pierda de vista su ubicación.
watch(success, async (ok) => {
  if (!ok || !attending.value) return
  burst()
  await loadMesa()
  await nextTick()
  window.setTimeout(() => {
    mesaEl.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, 1500)
})

// Si ya había confirmado antes que sí, cargar su mesa al abrir.
onMounted(() => {
  if (alreadyResponded.value && respondedAttending.value) loadMesa()
})

const passesLabel = computed(() => (props.guest.maxPasses === 1 ? 'pase' : 'pases'))
const canSubmit = computed(() => attending.value !== null && !submitting.value)

function dec() {
  if (guestsCount.value > 1) guestsCount.value--
}
function inc() {
  if (guestsCount.value < props.guest.maxPasses) guestsCount.value++
}

async function onSubmit() {
  if (attending.value === null) return
  await submit({
    code: props.guest.code,
    attending: attending.value,
    guestsCount: attending.value ? guestsCount.value : 0,
    message: message.value || undefined,
  })
}

const field =
  'w-full rounded-lg border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-soft transition focus:border-primary focus:outline-none'
</script>

<template>
  <section id="rsvp" class="px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="Confirma tu asistencia" title="¿Nos acompañarás?" />
    </AppReveal>

    <AppReveal :delay="0.1" class="mx-auto mt-8 max-w-md">
      <p class="text-center text-sm text-ink-soft">
        Pase reservado para
        <span class="text-ink">{{ guest.displayName }}</span>
        · {{ guest.maxPasses }} {{ passesLabel }}
      </p>

      <!-- Ya respondió (recién enviado o guardado antes) → se bloquea el formulario -->
      <div v-if="responded" class="mt-10 rounded-2xl border border-line bg-white p-10 text-center">
        <div
          class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 class="mt-5 font-display text-2xl text-ink">
          <template v-if="success">
            {{ respondedAttending ? '¡Gracias por confirmar!' : 'Gracias por avisarnos' }}
          </template>
          <template v-else>
            {{ respondedAttending ? '¡Ya confirmaste tu asistencia!' : 'Ya registramos tu respuesta' }}
          </template>
        </h3>
        <p class="mt-2 text-sm text-ink-soft">
          <template v-if="respondedAttending">
            <template v-if="respondedCount > 1">
              Te esperamos con {{ respondedCount }} personas. ¡Nos hace muy felices que nos
              acompañes!
            </template>
            <template v-else>
              Nos hace muy felices que nos acompañes en este día tan especial.
            </template>
          </template>
          <template v-else> Lamentamos que no puedas acompañarnos. ¡Te tendremos presente! </template>
        </p>
        <p class="mt-5 text-[0.65rem] uppercase tracking-[0.25em] text-ink-soft">
          Tu respuesta quedó guardada
        </p>
      </div>

      <!-- Formulario (solo si aún no ha respondido) -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="onSubmit">
        <!-- Asistencia -->
        <fieldset>
          <legend class="mb-3 block text-xs uppercase tracking-[0.2em] text-ink-soft">
            ¿Confirmas tu asistencia?
          </legend>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              class="rounded-lg border px-4 py-3 text-sm transition"
              :class="
                attending === true
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-white text-ink hover:border-primary/50'
              "
              @click="attending = true"
            >
              Sí, asistiré
            </button>
            <button
              type="button"
              class="rounded-lg border px-4 py-3 text-sm transition"
              :class="
                attending === false
                  ? 'border-primary bg-primary text-white'
                  : 'border-line bg-white text-ink hover:border-primary/50'
              "
              @click="attending = false"
            >
              No podré
            </button>
          </div>
        </fieldset>

        <!-- Detalles (solo si asiste) -->
        <template v-if="attending === true">
          <div v-if="guest.maxPasses > 1">
            <label class="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft">
              ¿Cuántos asistirán?
            </label>
            <div class="flex items-center gap-4">
              <button
                type="button"
                class="grid h-11 w-11 place-items-center rounded-full border border-line text-lg text-ink transition hover:border-primary disabled:opacity-40"
                :disabled="guestsCount <= 1"
                aria-label="Quitar acompañante"
                @click="dec"
              >
                −
              </button>
              <span class="w-8 text-center font-display text-2xl tabular-nums text-ink">
                {{ guestsCount }}
              </span>
              <button
                type="button"
                class="grid h-11 w-11 place-items-center rounded-full border border-line text-lg text-ink transition hover:border-primary disabled:opacity-40"
                :disabled="guestsCount >= guest.maxPasses"
                aria-label="Agregar acompañante"
                @click="inc"
              >
                +
              </button>
              <span class="text-sm text-ink-soft">de {{ guest.maxPasses }}</span>
            </div>
          </div>
        </template>

        <!-- Mensaje (siempre) -->
        <div>
          <label for="rsvp-msg" class="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft">
            Mensaje para los novios
          </label>
          <textarea id="rsvp-msg" v-model="message" :class="field" rows="3" />
        </div>

        <p v-if="errorMsg" class="text-center text-sm text-primary" role="alert">{{ errorMsg }}</p>

        <AppButton type="submit" variant="primary" class="w-full" :disabled="!canSubmit">
          {{ submitting ? 'Enviando…' : 'Enviar confirmación' }}
        </AppButton>
      </form>
    </AppReveal>

    <!-- Mesa asignada (solo si confirmó asistencia y tiene mesa) -->
    <div ref="mesaEl" class="scroll-mt-8">
      <AppReveal v-if="mesa" :delay="0.15" class="mt-16 text-center">
      <p class="mb-2 text-[0.7rem] uppercase tracking-[0.45em] text-primary">Tu ubicación</p>
      <h3 class="mb-10 font-display text-2xl text-ink sm:text-3xl">
        Te esperamos en la {{ mesa.nombre }}
      </h3>
      <MesaReveal :mesa="mesa" />
      <p class="mx-auto mt-10 max-w-xs text-balance text-sm leading-relaxed text-ink-soft">
        Este es tu lugar y quienes compartirán la mesa contigo 🌿
      </p>
      </AppReveal>
    </div>
  </section>
</template>
