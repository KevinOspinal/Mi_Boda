<script setup lang="ts">
import type { WeddingConfig } from '~~/shared/types/wedding'

defineProps<{ dressCode: WeddingConfig['dressCode'] }>()
</script>

<template>
  <section class="bg-surface-alt/40 px-6 py-24">
    <AppReveal>
      <SectionHeading :title="dressCode.title" kicker="Etiqueta" />
    </AppReveal>

    <AppReveal :delay="0.1">
      <div class="mx-auto mt-14 flex max-w-lg items-center justify-center gap-6 sm:gap-10">
        <!-- Ilustración: vestido + traje en perchas -->
        <div class="w-32 shrink-0 text-primary/85 sm:w-40">
          <AttireIllustration />
        </div>

        <!-- Nivel + nota -->
        <div class="text-left">
          <p class="font-display text-3xl leading-none text-ink sm:text-4xl">
            {{ dressCode.level }}
          </p>
          <p class="mt-4 max-w-[15rem] leading-relaxed text-ink-soft">
            {{ dressCode.description }}
          </p>
        </div>
      </div>
    </AppReveal>
  </section>
</template>
