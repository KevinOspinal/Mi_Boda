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
  <section class="px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="Ubicación" title="Cómo llegar" />
    </AppReveal>

    <AppReveal :delay="0.1" class="mx-auto mt-12 max-w-2xl">
      <div class="overflow-hidden rounded-2xl border border-line shadow-lg">
        <iframe
          v-if="embedUrl"
          :src="embedUrl"
          class="h-72 w-full sm:h-96"
          style="border: 0"
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
