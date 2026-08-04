<script setup lang="ts">
import type { InviteData } from '~~/shared/types/guest'
import { useReconfirm } from '~/composables/useReconfirm'
import { useConfetti } from '~/composables/useConfetti'

const props = defineProps<{ guest: InviteData }>()

const { submitting, errorMsg, submit } = useReconfirm()
const { burst } = useConfetti()

// Estado local de reconfirmación (optimista tras enviar).
const reconfirmed = ref<boolean | null>(props.guest.rsvp?.reconfirmed ?? null)

// Solo aplica si la ventana está abierta y el invitado había confirmado asistencia.
const show = computed(() => props.guest.reconfirm.open && props.guest.rsvp?.attending === true)

const deadlineLabel = computed(() => {
  if (!props.guest.reconfirm.deadline) return null
  return new Date(props.guest.reconfirm.deadline).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
})

async function respond(coming: boolean) {
  if (submitting.value) return
  const ok = await submit(props.guest.code, coming)
  if (ok) {
    reconfirmed.value = coming
    if (coming) burst()
  }
}
</script>

<template>
  <section v-if="show" id="reconfirmar" class="scroll-mt-4 px-6 pt-16">
    <AppReveal class="mx-auto max-w-md">
      <div
        class="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-white to-olive-50 p-8 text-center shadow-[0_24px_70px_-45px_rgba(46,51,32,0.55)] sm:p-10"
      >
        <BotanicalSprig class="pointer-events-none absolute -right-3 -top-2 w-16 rotate-12 opacity-40" />
        <BotanicalSprig class="pointer-events-none absolute -left-3 -top-2 w-16 -rotate-12 opacity-40" />

        <!-- Pendiente de reconfirmar -->
        <template v-if="reconfirmed === null">
          <p class="text-[0.68rem] uppercase tracking-[0.4em] text-primary/70">Se acerca el gran día</p>
          <h3 class="mt-4 font-display text-3xl font-light leading-tight text-ink sm:text-4xl">
            ¿Nos acompañarás?
          </h3>
          <OrnamentDivider class="mx-auto mt-4" />
          <p class="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-ink-soft">
            Estamos ultimando cada detalle 💛 Para reservar tu lugar con seguridad, por favor
            <strong class="font-medium text-ink">reconfirma</strong> tu asistencia.
          </p>
          <p v-if="deadlineLabel" class="mt-3 text-xs uppercase tracking-[0.2em] text-primary/70">
            Antes del {{ deadlineLabel }}
          </p>

          <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <AppButton variant="primary" :disabled="submitting" class="sm:min-w-[11rem]" @click="respond(true)">
              <svg v-if="submitting" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" opacity="0.25" />
                <path d="M21 12a9 9 0 00-9-9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
              </svg>
              Sí, allí estaré
            </AppButton>
            <AppButton variant="outline" :disabled="submitting" @click="respond(false)">
              Lamentablemente no podré
            </AppButton>
          </div>
          <p v-if="errorMsg" class="mt-4 text-sm text-primary" role="alert">{{ errorMsg }}</p>
        </template>

        <!-- Reconfirmó que SÍ -->
        <template v-else-if="reconfirmed === true">
          <div class="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10 text-primary" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <h3 class="mt-5 font-display text-3xl font-light text-ink">¡Reconfirmado! 🤍</h3>
          <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Gracias por reconfirmar. Tu lugar está asegurado y contamos los días para celebrar
            contigo.
          </p>
        </template>

        <!-- Reconfirmó que NO -->
        <template v-else>
          <h3 class="font-display text-2xl font-light text-ink">Gracias por avisarnos</h3>
          <p class="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
            Lamentamos que no puedas acompañarnos. Si algo cambia, aún estás a tiempo de decirnos
            que sí.
          </p>
          <AppButton variant="outline" :disabled="submitting" class="mt-6" @click="respond(true)">
            Sí podré asistir
          </AppButton>
          <p v-if="errorMsg" class="mt-4 text-sm text-primary" role="alert">{{ errorMsg }}</p>
        </template>
      </div>
    </AppReveal>
  </section>
</template>
