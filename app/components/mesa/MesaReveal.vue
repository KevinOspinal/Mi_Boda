<script setup lang="ts">
import type { MesaView } from '~~/shared/types/mesa'

const props = defineProps<{ mesa: MesaView }>()

// Posición de cada asiento alrededor de la mesa (en %).
const positions = computed(() =>
  props.mesa.seats.map((_, i) => {
    const n = props.mesa.seats.length
    const angle = ((-90 + (360 / n) * i) * Math.PI) / 180
    return {
      left: `${50 + 39 * Math.cos(angle)}%`,
      top: `${50 + 39 * Math.sin(angle)}%`,
    }
  }),
)
</script>

<template>
  <div class="scene">
    <!-- Mesa central -->
    <div class="table" :class="{ honor: mesa.esHonor }">
      <svg v-if="mesa.esHonor" class="crown" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z" />
      </svg>
      <p class="table__name">{{ mesa.nombre }}</p>
      <p class="table__count">{{ mesa.seats.length }} / {{ mesa.capacidad }}</p>
    </div>

    <!-- Asientos -->
    <div
      v-for="(seat, i) in mesa.seats"
      :key="i"
      class="seat"
      :style="positions[i]"
    >
      <div
        class="avatar"
        :class="{
          own: seat.propio,
          honor: seat.siempreVisible,
          locked: !seat.revealed,
          novio: seat.esNovio,
        }"
      >
        <svg
          v-if="seat.esNovio"
          class="crown-badge"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M3 8l4 4 5-7 5 7 4-4-2 11H5L3 8z" />
        </svg>
        <svg v-if="seat.revealed" viewBox="0 0 24 24" class="ico" fill="none" stroke="currentColor" stroke-width="1.6">
          <circle cx="12" cy="8.5" r="3.5" />
          <path d="M5.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
        </svg>
        <svg v-else viewBox="0 0 24 24" class="ico" fill="none" stroke="currentColor" stroke-width="1.6">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7.5a4 4 0 0 1 8 0V11" />
        </svg>
      </div>
      <span class="seat__name" :class="{ locked: !seat.revealed }">
        {{ seat.nombre ?? '···' }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.scene {
  position: relative;
  width: min(100%, 400px);
  aspect-ratio: 1;
  margin: 0 auto;
}

/* Mesa central */
.table {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 46%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  background: radial-gradient(circle at 50% 35%, var(--color-white), var(--color-surface-alt));
  box-shadow: 0 10px 30px -12px rgb(var(--rgb-shadow) / 0.4);
  border: 1px solid var(--color-line);
}
.table.honor {
  background: radial-gradient(circle at 50% 35%, #fffcf4, #f7ead0);
  border: 1.5px solid var(--color-gold-400);
  box-shadow: 0 12px 34px -12px rgb(var(--rgb-gold) / 0.45);
}
.crown {
  width: 22px;
  height: 22px;
  color: var(--color-gold-500);
  margin-bottom: 2px;
}
.table__name {
  font-family: var(--font-display);
  font-size: clamp(0.85rem, 3.4vw, 1.05rem);
  color: var(--color-ink);
  text-align: center;
  line-height: 1.1;
  padding: 0 12%;
}
.table__count {
  margin-top: 3px;
  font-size: 0.7rem;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

/* Asientos */
.seat {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 58px;
  gap: 3px;
}
.avatar {
  position: relative;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 9999px;
  border: 2px solid var(--color-primary);
  background: var(--color-surface);
  color: var(--color-primary);
  box-shadow: 0 3px 8px -3px rgb(var(--rgb-shadow) / 0.35);
}
/* Novios: anillo dorado + corona */
.avatar.novio {
  border-color: var(--color-gold-400);
  color: var(--color-gold-500);
}
.crown-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  width: 17px;
  height: 17px;
  color: var(--color-gold-500);
  filter: drop-shadow(0 1px 1px rgb(var(--rgb-gold) / 0.4));
}
.avatar.honor {
  border-color: var(--color-gold-400);
  color: var(--color-gold-500);
  background: #fffcf4;
}
.avatar.locked {
  border-color: var(--color-line);
  color: color-mix(in srgb, var(--color-ink-soft) 55%, transparent);
  background: var(--color-surface-alt);
  box-shadow: none;
}
.ico {
  width: 22px;
  height: 22px;
}
.seat__name {
  font-size: 0.62rem;
  line-height: 1.05;
  text-align: center;
  color: var(--color-ink);
  overflow-wrap: break-word;
  hyphens: auto;
}
.seat__name.locked {
  color: color-mix(in srgb, var(--color-ink-soft) 45%, transparent);
  letter-spacing: 0.1em;
}
</style>
