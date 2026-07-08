<script setup lang="ts">
defineProps<{ monogram: string }>()
</script>

<template>
  <div class="wax" aria-hidden="true">
    <div class="wax__shadow" />
    <div class="wax__disc">
      <div class="wax__rim" />
      <span class="wax__mono font-display">{{ monogram }}</span>
      <div class="wax__sheen" />
    </div>
  </div>
</template>

<style scoped>
.wax {
  position: relative;
  width: clamp(60px, 17vw, 76px);
  aspect-ratio: 1;
}

/* Sombra proyectada de la cera sobre el papel */
.wax__shadow {
  position: absolute;
  inset: 12% 8% -6% 8%;
  border-radius: 9999px;
  background: rgba(120, 30, 55, 0.4);
  filter: blur(7px);
  opacity: 0.55;
}

/* Disco de cera con borde irregular */
.wax__disc {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border-radius: 9999px;
  background:
    radial-gradient(65% 60% at 34% 28%, #ef92aa 0%, #d76a89 38%, #bd5074 70%, #a23f63 100%);
  box-shadow:
    inset 0 3px 5px rgba(255, 220, 230, 0.55),
    inset 0 -6px 10px rgba(110, 25, 50, 0.6),
    inset 4px 0 8px rgba(110, 25, 50, 0.25),
    inset -4px 0 8px rgba(110, 25, 50, 0.25);
  clip-path: polygon(
    50% 1%, 61% 3%, 68% 0%, 77% 6%, 84% 3%, 89% 12%, 97% 16%, 95% 27%,
    100% 36%, 96% 46%, 99% 57%, 93% 66%, 96% 77%, 87% 82%, 84% 92%,
    74% 91%, 66% 98%, 56% 95%, 46% 100%, 37% 94%, 28% 96%, 22% 87%,
    12% 86%, 9% 76%, 2% 70%, 5% 59%, 0% 48%, 4% 38%, 1% 27%, 9% 20%,
    8% 10%, 18% 8%, 24% 2%, 34% 5%, 42% 0%
  );
}

/* Anillo interior en relieve (como un sello estampado) */
.wax__rim {
  position: absolute;
  inset: 13%;
  border-radius: 9999px;
  box-shadow:
    inset 0 1px 1px rgba(255, 220, 230, 0.4),
    inset 0 -2px 3px rgba(110, 25, 50, 0.55),
    0 1px 1px rgba(255, 220, 230, 0.25);
  border: 1px solid rgba(110, 25, 50, 0.3);
}

/* Monograma grabado (debossed) */
.wax__mono {
  position: relative;
  z-index: 2;
  font-size: clamp(1.05rem, 4vw, 1.45rem);
  font-weight: 500;
  letter-spacing: 0.01em;
  color: #b8577a;
  text-shadow:
    0 -1px 0 rgba(110, 25, 50, 0.55),
    0 1px 1px rgba(255, 225, 235, 0.5);
}

/* Brillo especular */
.wax__sheen {
  position: absolute;
  top: 12%;
  left: 16%;
  width: 42%;
  height: 34%;
  border-radius: 9999px;
  background: radial-gradient(closest-side, rgba(255, 255, 255, 0.55), transparent 70%);
  mix-blend-mode: screen;
  pointer-events: none;
}
</style>
