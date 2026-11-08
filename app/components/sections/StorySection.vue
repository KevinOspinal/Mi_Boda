<script setup lang="ts">
import type { StoryBlock } from '~~/shared/types/wedding'

defineProps<{ blocks: StoryBlock[] }>()

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI']

/** Capitular: primera letra aparte para poder agrandarla sin romper el texto. */
function dropCap(text: string) {
  const first = text.slice(0, 1)
  return { first, rest: text.slice(1) }
}
</script>

<template>
  <section class="px-6 py-24">
    <AppReveal>
      <SectionHeading kicker="Nuestra historia" title="Cómo llegamos aquí" />
    </AppReveal>

    <div class="mx-auto mt-16 max-w-2xl space-y-14">
      <!--
        Con foto: dos columnas alternando lado (imagen izquierda/derecha).
        Sin foto: ficha de papel con filete dorado, numeral romano y capitular.
        El hueco de la imagen no se rellena: se cambia de pieza, para que la
        ausencia de foto se lea como decisión editorial y no como un vacío.
      -->
      <AppReveal v-for="(block, i) in blocks" :key="i" :delay="0.05">
        <article
          v-if="block.image"
          class="flex flex-col items-center gap-6 sm:gap-8"
          :class="i % 2 === 1 ? 'sm:flex-row-reverse' : 'sm:flex-row'"
        >
          <div class="w-full sm:w-1/2">
            <NuxtImg
              :src="block.image"
              :alt="block.title"
              class="aspect-[4/5] w-full rounded-xl object-cover shadow-lg"
              loading="lazy"
              sizes="(max-width: 640px) 90vw, 400px"
            />
          </div>

          <div class="w-full text-center sm:w-1/2 sm:text-left">
            <h3 class="font-display text-2xl text-ink sm:text-3xl">{{ block.title }}</h3>
            <div class="my-4 h-px w-12 bg-primary/40 mx-auto sm:mx-0" aria-hidden="true" />
            <p class="text-balance leading-relaxed text-ink-soft">{{ block.text }}</p>
          </div>
        </article>

        <article v-else class="story-card">
          <span class="story-card__numeral" aria-hidden="true">{{ NUMERALS[i] ?? i + 1 }}</span>

          <h3 class="story-card__title font-display text-ink">{{ block.title }}</h3>

          <div class="story-card__rule" aria-hidden="true">
            <span /><i /><span />
          </div>

          <p class="story-card__text"><span class="story-card__cap">{{ dropCap(block.text).first }}</span>{{ dropCap(block.text).rest }}</p>
        </article>
      </AppReveal>
    </div>
  </section>
</template>

<style scoped>
.story-card {
  position: relative;
  padding: 3.5rem 1.75rem 2.75rem;
  background:
    linear-gradient(170deg, var(--color-paper-50) 0%, var(--color-surface) 55%, var(--color-wine-50) 100%);
  border: 1px solid var(--color-line);
  box-shadow: 0 22px 46px -32px rgb(var(--rgb-shadow) / 0.5);
}

/* Filete dorado interior: el detalle de una papelería impresa. */
.story-card::before {
  content: '';
  position: absolute;
  inset: 9px;
  border: 1px solid rgb(var(--rgb-gold) / 0.26);
  pointer-events: none;
}

/* Numeral romano colgado sobre el filete, en una muesca de papel. */
.story-card__numeral {
  position: absolute;
  top: -0.05rem;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0 0.85rem;
  background: var(--color-surface);
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.14em;
  text-indent: 0.14em;
  color: var(--color-gold-500);
}

.story-card__title {
  text-align: center;
  font-size: 1.8rem;
  line-height: 1.15;
}

.story-card__rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  margin: 1rem auto 1.5rem;
}

.story-card__rule span {
  display: block;
  width: 2.25rem;
  height: 1px;
  background: linear-gradient(to right, transparent, rgb(var(--rgb-gold) / 0.55));
}

.story-card__rule span:last-child {
  background: linear-gradient(to left, transparent, rgb(var(--rgb-gold) / 0.55));
}

.story-card__rule i {
  width: 5px;
  height: 5px;
  rotate: 45deg;
  background: var(--color-primary-soft);
}

.story-card__text {
  color: var(--color-ink-soft);
  line-height: 1.85;
  text-align: left;
}

/* Capitular. Flota dentro del párrafo, así que el lector de pantalla
   sigue leyendo la frase completa. */
.story-card__cap {
  float: left;
  margin: 0.4rem 0.6rem 0 0;
  font-family: var(--font-display);
  font-size: 3.9rem;
  line-height: 0.74;
  color: var(--color-primary);
}

@media (min-width: 640px) {
  .story-card {
    padding: 4rem 3.25rem 3.25rem;
  }

  .story-card__title {
    font-size: 2.1rem;
  }

  .story-card__text {
    font-size: 1.05rem;
  }
}
</style>
