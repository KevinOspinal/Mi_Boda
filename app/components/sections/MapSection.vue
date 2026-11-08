<script setup lang="ts">
import type { EventVenue } from '~~/shared/types/wedding'

const props = defineProps<{ venues: EventVenue[] }>()

const primary = computed(() => props.venues[0])

const embedUrl = computed(() =>
  primary.value
    ? `https://www.google.com/maps?q=${primary.value.lat},${primary.value.lng}&z=15&output=embed`
    : '',
)

function directionsUrl(v: EventVenue) {
  return v.mapsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`
}
</script>

<template>
  <section class="bg-surface-alt px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="Ubicación" title="Cómo llegar" />
    </AppReveal>

    <AppReveal :delay="0.1" class="mx-auto mt-12 max-w-2xl">
      <!--
        Paspartú de papel + filete dorado, igual que las fichas de la historia,
        para que el mapa no entre como un recorte ajeno a la invitación.
      -->
      <div class="map-frame">
        <iframe
          v-if="embedUrl"
          :src="embedUrl"
          class="map-frame__canvas h-72 w-full sm:h-96"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          title="Mapa del evento"
        />
      </div>

      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <AppButton
          v-for="(v, i) in venues"
          :key="i"
          tag="a"
          variant="outline"
          :href="directionsUrl(v)"
          target="_blank"
          rel="noopener"
        >
          Cómo llegar · {{ v.label }}
        </AppButton>
      </div>
    </AppReveal>
  </section>
</template>

<style scoped>
.map-frame {
  position: relative;
  padding: 10px;
  background: linear-gradient(170deg, var(--color-paper-50), var(--color-surface));
  border: 1px solid var(--color-line);
  box-shadow: 0 22px 46px -30px rgb(var(--rgb-shadow) / 0.55);
}

.map-frame::after {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid rgb(var(--rgb-gold) / 0.3);
  pointer-events: none;
  z-index: 1;
}

/* Un punto de calidez sobre los verdes y blancos de Google, para que el mapa
   converse con el marfil. Es solo el previo: el botón abre Maps sin tocar. */
.map-frame__canvas {
  display: block;
  border: 0;
  filter: sepia(0.16) saturate(0.82) contrast(0.96);
}
</style>
