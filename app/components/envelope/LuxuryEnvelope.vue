<script setup lang="ts">
import { EASE } from '~/utils/ease'
import { useExperienceStore } from '~/stores/experience'

defineProps<{ recipient: string; monogram: string; coupleNames: string }>()
const emit = defineEmits<{ opened: [] }>()

const { $gsap } = useNuxtApp()
const store = useExperienceStore()

const root = ref<HTMLElement>()
const envelope = ref<HTMLElement>()
const flap = ref<HTMLElement>()
const card = ref<HTMLElement>()
const cardContent = ref<HTMLElement>()
const seal = ref<HTMLElement>()
const hint = ref<HTMLElement>()

const opened = ref(false)
let ctx: ReturnType<typeof $gsap.context> | undefined

function open() {
  if (opened.value) return
  opened.value = true
  store.markInteracted()
  store.setPhase('opening')

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) {
    emit('opened')
    return
  }

  ctx = $gsap.context(() => {
    const tl = $gsap.timeline({
      defaults: { ease: EASE.elegant },
      onComplete: () => emit('opened'),
    })

    // 1) El sello se rompe: se levanta y se desvanece.
    tl.to(seal.value!, { y: -6, scale: 1.08, duration: 0.3 })
      .to(seal.value!, { y: -26, scale: 0.5, rotate: 14, opacity: 0, duration: 0.55 })
      // 2) La solapa superior gira hacia atrás en 3D.
      .to(flap.value!, { rotateX: -172, duration: 1.05 }, '<0.05')
      .set(flap.value!, { zIndex: 0 }, '<0.55')
      // 3) La carta emerge deslizándose hacia arriba y su contenido aparece.
      .to(card.value!, { yPercent: -68, scale: 1.03, duration: 1.15 }, '<0.2')
      .to(cardContent.value!, { opacity: 1, duration: 0.6 }, '<0.35')
      .to(hint.value!, { opacity: 0, duration: 0.3 }, '<')
      .to(envelope.value!, { y: -10, duration: 0.9 }, '<0.15')
      // 4) La escena se funde para dar paso a la bienvenida.
      .to(root.value!, { opacity: 0, duration: 0.7, ease: 'power2.inOut' }, '+=0.45')
  })
}

onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <div ref="root" class="flex flex-col items-center">
    <p class="mb-8 text-xs uppercase tracking-[0.5em] text-ink-soft/70">Estás invitado</p>

    <button
      type="button"
      class="scene block cursor-pointer rounded-2xl focus-visible:outline-none"
      :aria-label="`Abrir la invitación de ${recipient}`"
      @click="open"
    >
      <div ref="envelope" class="envelope">
        <!-- Cuerpo trasero -->
        <div class="layer back" />

        <!-- La carta dentro del sobre (oculta tras las solapas) -->
        <div ref="card" class="layer card">
          <div ref="cardContent" class="card__content">
            <p class="card__kicker">Nuestra Boda</p>
            <p class="card__mono font-display">{{ monogram }}</p>
            <OrnamentDivider class="card__orn" />
            <p class="card__names font-display">{{ coupleNames }}</p>
          </div>
        </div>

        <!-- Solapas plegadas del bolsillo -->
        <div class="layer flap-left" />
        <div class="layer flap-right" />
        <div class="layer flap-bottom" />

        <!-- Destinatario en la cara frontal -->
        <div class="recipient">
          <span class="recipient__label">Para</span>
          <span class="recipient__name font-display">{{ recipient }}</span>
        </div>

        <!-- Solapa superior (gira al abrir) -->
        <div ref="flap" class="layer flap-top" />

        <!-- Textura de papel + iluminación -->
        <div class="layer grain" />
        <div class="layer vignette" />
        <div class="center-shadow" />

        <!-- Sello de cera -->
        <div ref="seal" class="seal">
          <WaxSeal :monogram="monogram" />
        </div>
      </div>
    </button>

    <p ref="hint" class="mt-10 text-xs uppercase tracking-[0.35em] text-ink-soft/60">
      Toca el sobre para abrir
    </p>
  </div>
</template>

<style scoped>
.scene {
  perspective: 1500px;
}
.envelope {
  position: relative;
  width: clamp(280px, 84vw, 380px);
  aspect-ratio: 7 / 5;
  transform-style: preserve-3d;
  filter: drop-shadow(0 26px 40px rgba(60,66,40, 0.28));
}
.layer {
  position: absolute;
  inset: 0;
}

/* Cuerpo trasero (papel) */
.back {
  border-radius: 9px;
  background: linear-gradient(155deg, #f6f4ea 0%, #ecead8 60%, #e0dec7 100%);
}

/* Carta interior */
.card {
  left: 5%;
  right: 5%;
  top: 5%;
  height: 86%;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12%;
  border-radius: 4px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfaf1 100%);
  box-shadow: 0 8px 18px -10px rgba(60, 66, 40, 0.35);
  transform-origin: bottom center;
}
/* Marco interior delicado */
.card::before {
  content: '';
  position: absolute;
  inset: 6.5%;
  border: 1px solid var(--color-primary);
  border-radius: 3px;
  opacity: 0.32;
  pointer-events: none;
}
.card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  opacity: 0;
}
.card__kicker {
  font-size: 0.5rem;
  letter-spacing: 0.45em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.card__mono {
  margin-top: 6px;
  font-size: clamp(1.7rem, 8.5vw, 2.5rem);
  font-weight: 500;
  line-height: 1;
  color: var(--color-primary);
}
.card__orn {
  width: 66% !important;
  margin: 9px 0;
}
.card__names {
  font-size: clamp(0.95rem, 4.6vw, 1.25rem);
  letter-spacing: 0.02em;
  color: var(--color-ink);
}

/* Solapas plegadas — distintos tonos crean las costuras (papel real) */
.flap-left,
.flap-right,
.flap-bottom {
  z-index: 2;
}
.flap-left {
  clip-path: polygon(0 0, 0 100%, 50% 52%);
  background: linear-gradient(90deg, #f6f4ea 0%, #eae8d5 100%);
}
.flap-right {
  clip-path: polygon(100% 0, 100% 100%, 50% 52%);
  background: linear-gradient(270deg, #e2e0c9 0%, #e9e7d3 100%);
}
.flap-bottom {
  clip-path: polygon(0 100%, 100% 100%, 50% 52%);
  background: linear-gradient(0deg, #d8d6bc 0%, #e6e4cf 100%);
  border-radius: 0 0 9px 9px;
}

/* Destinatario */
.recipient {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 12%;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 0 9%;
}
.recipient__label {
  font-size: 0.58rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
}
.recipient__name {
  font-size: clamp(1.2rem, 5.2vw, 1.7rem);
  line-height: 1.15;
  text-align: center;
  text-wrap: balance;
  color: var(--color-ink);
}

/* Solapa superior (se abre) */
.flap-top {
  z-index: 4;
  transform-origin: 50% 0%;
  transform: rotateX(0deg);
  backface-visibility: hidden;
  clip-path: polygon(0 0, 100% 0, 50% 52%);
  background: linear-gradient(180deg, #f3f1e3 0%, #e9e7d4 70%, #dddbc4 100%);
  border-radius: 9px 9px 0 0;
  filter: drop-shadow(0 4px 5px rgba(60,66,40, 0.22));
}

/* Textura de papel (grano fino) */
.grain {
  z-index: 5;
  pointer-events: none;
  border-radius: 9px;
  opacity: 0.07;
  mix-blend-mode: multiply;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 150px 150px;
}

/* Iluminación: brillo arriba, oscurecimiento en bordes */
.vignette {
  z-index: 5;
  pointer-events: none;
  border-radius: 9px;
  background:
    radial-gradient(80% 55% at 50% 8%, rgba(255, 255, 255, 0.45), transparent 60%),
    radial-gradient(120% 90% at 50% 55%, transparent 55%, rgba(60,66,40, 0.12) 100%);
}

/* Sombra bajo el sello (asienta la cera en el pliegue) */
.center-shadow {
  position: absolute;
  left: 50%;
  top: 52%;
  width: 34%;
  aspect-ratio: 1;
  z-index: 5;
  transform: translate(-50%, -50%);
  border-radius: 9999px;
  background: radial-gradient(closest-side, rgba(60,66,40, 0.28), transparent 72%);
  pointer-events: none;
}

/* Sello */
.seal {
  position: absolute;
  left: 50%;
  top: 52%;
  transform: translate(-50%, -50%);
  z-index: 6;
}
</style>
