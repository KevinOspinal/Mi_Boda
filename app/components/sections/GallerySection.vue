<script setup lang="ts">
const props = defineProps<{ images: string[] }>()

// Con contenido real muestra las fotos; sin él, tarjetas placeholder elegantes.
const tiles = computed(() => (props.images.length ? props.images : Array.from({ length: 6 }, () => '')))
</script>

<template>
  <section class="px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="Momentos" title="Nuestra galería" />
    </AppReveal>

    <div class="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      <AppReveal
        v-for="(src, i) in tiles"
        :key="i"
        :delay="(i % 3) * 0.08"
        class="overflow-hidden rounded-xl"
      >
        <NuxtImg
          v-if="src"
          :src="src"
          :alt="`Foto ${i + 1}`"
          class="aspect-square w-full object-cover transition-transform duration-700 hover:scale-105"
          :class="i % 5 === 0 ? 'row-span-2 aspect-[3/4]' : ''"
          loading="lazy"
          sizes="(max-width: 640px) 45vw, 280px"
        />
        <div
          v-else
          class="grid aspect-square w-full place-items-center border border-line bg-surface-alt/50"
          aria-hidden="true"
        >
          <span class="font-display text-3xl text-primary/25">♥</span>
        </div>
      </AppReveal>
    </div>
  </section>
</template>
