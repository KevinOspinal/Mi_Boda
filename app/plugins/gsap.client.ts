import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Flip } from 'gsap/Flip'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { CustomEase } from 'gsap/CustomEase'

/**
 * Registra los plugins de GSAP una sola vez, solo en el cliente.
 * (SplitText se importará puntualmente donde se use para no cargarlo de más.)
 */
export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, Flip, MotionPathPlugin, CustomEase)

  // Ease "de marca" reutilizable en toda la experiencia.
  if (!CustomEase.get('elegant')) {
    CustomEase.create('elegant', '0.22, 1, 0.36, 1')
  }

  return {
    provide: { gsap },
  }
})
