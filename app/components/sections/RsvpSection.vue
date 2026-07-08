<script setup lang="ts">
import type { Guest } from '~~/shared/types/guest'
import { useRsvp } from '~/composables/useRsvp'
import { useConfetti } from '~/composables/useConfetti'

const props = defineProps<{ guest: Guest }>()

const { submitting, success, errorMsg, submit } = useRsvp()
const { burst } = useConfetti()

// Estado del formulario
const attending = ref<boolean | null>(null)
const guestsCount = ref(props.guest.maxPasses)
const message = ref('')

// Celebración al confirmar asistencia.
watch(success, (ok) => {
  if (ok && attending.value) burst()
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
  'w-full rounded-lg border border-line bg-white px-4 py-3 text-ink placeholder:text-ink-soft/50 transition focus:border-primary focus:outline-none'
</script>

<template>
  <section id="rsvp" class="bg-surface-alt/40 px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="Confirma tu asistencia" title="¿Nos acompañarás?" />
    </AppReveal>

    <AppReveal :delay="0.1" class="mx-auto mt-8 max-w-md">
      <p class="text-center text-sm text-ink-soft">
        Pase reservado para
        <span class="text-ink">{{ guest.displayName }}</span>
        · {{ guest.maxPasses }} {{ passesLabel }}
      </p>

      <!-- Estado de éxito -->
      <div v-if="success" class="mt-10 rounded-2xl border border-line bg-white p-10 text-center">
        <div
          class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 class="mt-5 font-display text-2xl text-ink">
          {{ attending ? '¡Gracias por confirmar!' : 'Gracias por avisarnos' }}
        </h3>
        <p class="mt-2 text-sm text-ink-soft">
          {{
            attending
              ? 'Nos hace muy felices que nos acompañes en este día tan especial.'
              : 'Lamentamos que no puedas acompañarnos. ¡Te tendremos presente!'
          }}
        </p>
      </div>

      <!-- Formulario -->
      <form v-else class="mt-8 space-y-6" @submit.prevent="onSubmit">
        <!-- Asistencia -->
        <fieldset>
          <legend class="mb-3 block text-xs uppercase tracking-[0.2em] text-ink-soft/70">
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
            <label class="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft/70">
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
          <label for="rsvp-msg" class="mb-2 block text-xs uppercase tracking-[0.2em] text-ink-soft/70">
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
  </section>
</template>
