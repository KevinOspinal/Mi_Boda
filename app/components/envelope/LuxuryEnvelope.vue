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
const sealShadow = ref<HTMLElement>()
const shine = ref<HTMLElement>()
const hint = ref<HTMLElement>()

const opened = ref(false)
/**
 * Qué cara de la solapa se ve. No se puede dejar en manos de
 * `backface-visibility`: el `filter` del sobre aplana el 3D y entonces el giro
 * del padre no se compone con el de la cara, así que el navegador nunca da por
 * volteada la cara interior. Se decide aquí, leyendo el ángulo real.
 */
const flipped = ref(false)
let idleCtx: ReturnType<typeof $gsap.context> | undefined
let openCtx: ReturnType<typeof $gsap.context> | undefined

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Reposo: el sobre respira, un brillo recorre el papel de vez en cuando y la
 * pista late. Sin esto el sobre parece una imagen fija y mucha gente no cae en
 * que hay que tocarlo.
 */
onMounted(() => {
  if (reducedMotion()) return

  idleCtx = $gsap.context(() => {
    $gsap.to(envelope.value!, {
      y: -5,
      duration: 3.2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })

    $gsap.set(shine.value!, { skewX: -12, xPercent: -180 })
    $gsap.to(shine.value!, {
      xPercent: 320,
      duration: 1.7,
      ease: 'sine.inOut',
      repeat: -1,
      repeatDelay: 4.5,
      delay: 2,
    })

    $gsap.to(hint.value!, {
      opacity: 0.45,
      duration: 1.9,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
    })
  }, root.value)
})

function open() {
  if (opened.value) return
  opened.value = true
  store.markInteracted()
  store.setPhase('opening')

  if (reducedMotion()) {
    emit('opened')
    return
  }

  // El reposo se detiene aquí: si sigue vivo, pelea con la apertura por las
  // mismas propiedades. GSAP arranca desde donde haya quedado cada elemento.
  idleCtx?.revert()
  idleCtx = undefined

  openCtx = $gsap.context(() => {
    const tl = $gsap.timeline({
      defaults: { ease: EASE.elegant },
      onComplete: () => emit('opened'),
    })

    tl
      // 1) La cera cede bajo el pulgar y se parte de golpe.
      .to(seal.value!, { scale: 0.93, duration: 0.14, ease: 'power2.out' })
      .to(seal.value!, { scale: 1.13, rotate: -6, duration: 0.2, ease: 'back.out(3.5)' })
      // 2) El trozo de sello cae fuera de cuadro y su sombra se va con él.
      .to(seal.value!, { y: -34, rotate: 24, scale: 0.4, opacity: 0, duration: 0.6 })
      .to(sealShadow.value!, { opacity: 0, duration: 0.5 }, '<')
      // 3) El sobre se inclina para dejar salir la carta y la solapa se pliega.
      .to(envelope.value!, { rotateX: 6, y: -6, duration: 0.95 }, '<0.05')
      .to(
        flap.value!,
        {
          rotateX: -168,
          duration: 1.1,
          // Al cruzar los 90° la solapa está de canto (altura cero), así que
          // el cambio de cara no se nota: no hace falta fundido.
          onUpdate: () => {
            flipped.value = Math.abs(Number($gsap.getProperty(flap.value!, 'rotateX'))) > 90
          },
        },
        '<',
      )
      .set(flap.value!, { zIndex: 0 }, '<0.55')
      // 4) La carta sale tirada hacia arriba, con un balanceo que luego asienta.
      .to(card.value!, { yPercent: -70, scale: 1.04, rotate: -0.9, duration: 1.2 }, '<0.3')
      .to(
        card.value!,
        { boxShadow: '0 26px 42px -18px rgba(60, 66, 40, 0.5)', duration: 1 },
        '<',
      )
      .to(card.value!, { rotate: 0, duration: 0.55 }, '-=0.4')
      .to(cardContent.value!, { opacity: 1, duration: 0.65 }, '<0.05')
      .to(hint.value!, { opacity: 0, duration: 0.3 }, '<')
      // 5) El sobre, ya vacío, se asienta.
      .to(envelope.value!, { rotateX: 2, y: 6, duration: 0.95 }, '<')
      // 6) Fundido hacia la bienvenida, con una pausa para leer la carta.
      .to(root.value!, { opacity: 0, duration: 0.75, ease: 'power2.inOut' }, '+=0.8')
  }, root.value)
}

onBeforeUnmount(() => {
  idleCtx?.revert()
  openCtx?.revert()
})
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

        <!-- Solapa superior: dos caras, para que al plegarse se vea el forro
             en vez de desaparecer al pasar de los 90°. -->
        <div ref="flap" class="layer flap-top">
          <div class="flap-face flap-face--out" :class="{ 'is-hidden': flipped }" />
          <div class="flap-face flap-face--in" :class="{ 'is-hidden': !flipped }" />
        </div>

        <!-- Textura de papel + iluminación -->
        <div class="layer grain" />
        <div class="layer vignette" />

        <!-- Brillo que recorre el papel en reposo -->
        <div class="layer shine-mask">
          <div ref="shine" class="shine" />
        </div>

        <div ref="sealShadow" class="center-shadow" />

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
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}
/* Solo donde hay puntero de verdad: en móvil el :hover se queda pegado. */
@media (hover: hover) {
  .scene:hover {
    transform: translateY(-6px);
  }
  .scene:hover .envelope {
    filter: drop-shadow(0 34px 52px rgba(60, 66, 40, 0.34));
  }
}
.scene:active {
  transform: translateY(-2px) scale(0.99);
}

.envelope {
  position: relative;
  width: clamp(280px, 84vw, 380px);
  aspect-ratio: 7 / 5;
  /* El `filter` aplana el 3D de los hijos (lo exige la especificación CSS) y
     aquí conviene: con 3D real la solapa giraría POR DETRÁS del sobre y no se
     vería nada, porque la cámara mira el sobre de frente. Aplanado, la solapa
     se pliega hacia arriba, que es justo como se ve un sobre abierto. */
  transform-style: preserve-3d;
  filter: drop-shadow(0 26px 40px rgba(60, 66, 40, 0.28));
  transition: filter 0.5s cubic-bezier(0.22, 1, 0.36, 1);
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

/* Solapa superior (se abre). El contenedor gira; dentro van las dos caras. */
.flap-top {
  z-index: 4;
  transform-origin: 50% 0%;
  transform-style: preserve-3d;
}
.flap-face {
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 100% 0, 50% 52%);
  border-radius: 9px 9px 0 0;
}
.flap-face.is-hidden {
  opacity: 0;
}
/* Cara exterior: la que se ve con el sobre cerrado. */
.flap-face--out {
  background: linear-gradient(180deg, #f3f1e3 0%, #e9e7d4 70%, #dddbc4 100%);
  filter: drop-shadow(0 4px 5px rgba(60, 66, 40, 0.22));
}
/* Forro interior: aparece al pasar de los 90°. Más oscuro junto al pliegue,
   como el papel que queda a la sombra. */
.flap-face--in {
  background: linear-gradient(180deg, #d5d1b6 0%, #e3dfcb 55%, #edeada 100%);
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
    radial-gradient(120% 90% at 50% 55%, transparent 55%, rgba(60, 66, 40, 0.12) 100%);
}

/* Brillo viajero del reposo (recortado al contorno del sobre) */
.shine-mask {
  z-index: 5;
  overflow: hidden;
  border-radius: 9px;
  pointer-events: none;
}
.shine {
  position: absolute;
  top: -25%;
  bottom: -25%;
  left: 0;
  width: 38%;
  background: linear-gradient(
    100deg,
    transparent 0%,
    rgba(255, 255, 255, 0.5) 50%,
    transparent 100%
  );
  /* Aparcado fuera del recorte. Hace falta en CSS y no solo en GSAP: antes de
     hidratar, y con las animaciones reducidas, nadie mueve este elemento y se
     quedaría una franja blanca fija sobre el papel. */
  transform: translateX(-180%) skewX(-12deg);
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
  background: radial-gradient(closest-side, rgba(60, 66, 40, 0.28), transparent 72%);
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

/* Sin animación para quien la ha desactivado en su sistema */
@media (prefers-reduced-motion: reduce) {
  .scene,
  .envelope {
    transition: none;
  }
  .scene:hover,
  .scene:active {
    transform: none;
  }
}
</style>
