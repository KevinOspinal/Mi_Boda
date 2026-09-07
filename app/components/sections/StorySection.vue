<script setup lang="ts">
import type { StoryBlock } from '~~/shared/types/wedding'

defineProps<{ blocks: StoryBlock[] }>()
</script>

<template>
  <section class="bg-surface-alt/40 px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="Nuestra historia" title="Cómo llegamos aquí" />
    </AppReveal>

    <div class="mx-auto mt-16 max-w-2xl space-y-16">
      <!--
        Con foto: dos columnas alternando lado (imagen izquierda/derecha).
        Sin foto: bloque centrado a una sola columna, como el resto de
        secciones (nada de marcos vacíos rellenando el hueco).
      -->
      <AppReveal v-for="(block, i) in blocks" :key="i" :delay="0.05">
        <article
          class="flex flex-col items-center gap-6 sm:gap-8"
          :class="block.image ? (i % 2 === 1 ? 'sm:flex-row-reverse' : 'sm:flex-row') : ''"
        >
          <div v-if="block.image" class="w-full sm:w-1/2">
            <NuxtImg
              :src="block.image"
              :alt="block.title"
              class="aspect-[4/5] w-full rounded-xl object-cover shadow-lg"
              loading="lazy"
              sizes="(max-width: 640px) 90vw, 400px"
            />
          </div>

          <div class="w-full text-center" :class="block.image ? 'sm:w-1/2 sm:text-left' : ''">
            <h3 class="font-display text-2xl text-ink sm:text-3xl">{{ block.title }}</h3>
            <div
              class="my-4 h-px w-12 bg-primary/40 mx-auto"
              :class="block.image ? 'sm:mx-0' : ''"
              aria-hidden="true"
            />
            <p
              class="text-balance leading-relaxed text-ink-soft"
              :class="block.image ? '' : 'mx-auto max-w-md'"
            >
              {{ block.text }}
            </p>
          </div>
        </article>
      </AppReveal>
    </div>
  </section>
</template>
