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
      <AppReveal v-for="(block, i) in blocks" :key="i" :delay="0.05">
        <article
          class="flex flex-col items-center gap-6 sm:gap-8"
          :class="i % 2 === 1 ? 'sm:flex-row-reverse' : 'sm:flex-row'"
        >
          <div class="w-full sm:w-1/2">
            <NuxtImg
              v-if="block.image"
              :src="block.image"
              :alt="block.title"
              class="aspect-[4/5] w-full rounded-xl object-cover shadow-lg"
              loading="lazy"
              sizes="(max-width: 640px) 90vw, 400px"
            />
            <div
              v-else
              class="grid aspect-[4/5] w-full place-items-center rounded-xl border border-line bg-surface"
              aria-hidden="true"
            >
              <span class="font-display text-5xl text-primary/30">♥</span>
            </div>
          </div>

          <div class="w-full text-center sm:w-1/2 sm:text-left">
            <h3 class="font-display text-2xl text-ink sm:text-3xl">{{ block.title }}</h3>
            <div class="my-4 h-px w-12 bg-primary/40 max-sm:mx-auto" aria-hidden="true" />
            <p class="text-balance leading-relaxed text-ink-soft">{{ block.text }}</p>
          </div>
        </article>
      </AppReveal>
    </div>
  </section>
</template>
