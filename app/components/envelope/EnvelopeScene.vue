<script setup lang="ts">
import { useExperienceStore } from '~/stores/experience'

defineProps<{ recipient: string; monogram: string; coupleNames: string }>()
const emit = defineEmits<{ complete: [] }>()

const store = useExperienceStore()
const stage = ref<'loading' | 'envelope'>('loading')

function onIntroDone() {
  stage.value = 'envelope'
  store.setPhase('envelope')
}

function onOpened() {
  store.setPhase('experience')
  emit('complete')
}

function skip() {
  store.setPhase('experience')
  emit('complete')
}
</script>

<template>
  <div class="fixed inset-0 z-40 grid place-items-center overflow-hidden bg-surface px-6">
    <!-- Halo cálido de fondo -->
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,rgba(212,106,136,0.12),transparent_70%)]"
    />

    <Transition name="fade" mode="out-in">
      <LoadingIntro v-if="stage === 'loading'" :monogram="monogram" @done="onIntroDone" />
      <LuxuryEnvelope
        v-else
        :recipient="recipient"
        :monogram="monogram"
        :couple-names="coupleNames"
        @opened="onOpened"
      />
    </Transition>

    <button
      type="button"
      class="absolute bottom-6 right-6 text-[0.65rem] uppercase tracking-[0.3em] text-ink-soft/50 transition hover:text-ink-soft"
      @click="skip"
    >
      Saltar intro
    </button>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
