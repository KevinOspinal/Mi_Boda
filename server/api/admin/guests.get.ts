import type { AdminGuest, AdminGuestsResponse, InviteStatus, ReconfirmStatus } from '~~/shared/types/admin'
import { wedding } from '~~/app/config/wedding'

// Plantillas de WhatsApp: viven en app/config/wedding.ts junto al resto del
// contenido del evento, para no tener los nombres escritos en dos sitios.
const DEFAULT_MESSAGE = wedding.messages.invite
const RECONFIRM_MESSAGE = wedding.messages.reconfirm

/**
 * GET /api/admin/guests
 * Lista completa de invitados con su confirmación y enlaces listos para enviar
 * (invitación + WhatsApp). Requiere sesión.
 */
export default defineEventHandler(async (event): Promise<AdminGuestsResponse> => {
  await requireAdmin(event)

  const sql = db()
  const config = useRuntimeConfig()
  const siteUrl = (config.public.siteUrl || 'http://localhost:3000').replace(/\/+$/, '')

  // Plantilla del mensaje configurada (si existe), o la de por defecto.
  const [settings] = await sql`select invite_message from public.wedding_settings where id = 1`
  const template: string = settings?.invite_message || DEFAULT_MESSAGE

  const rows = await sql`
    select
      g.id, g.code, g.display_name, g.max_passes, g.group_label, g.phone, g.opened_at,
      r.attending, r.guests_count, r.attendee_names, r.dietary, r.message, r.reconfirmed, r.updated_at
    from public.guests g
    left join public.rsvps r on r.guest_id = g.id
    order by g.group_label nulls last, g.display_name
  `

  const wa = (phone: string | null, message: string) =>
    `https://wa.me/${(phone || '').replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`

  const guests: AdminGuest[] = rows.map((g) => {
    const status: InviteStatus =
      g.attending === null || g.attending === undefined
        ? 'pendiente'
        : g.attending
          ? 'confirmado'
          : 'no_asiste'

    const reconfirmStatus: ReconfirmStatus =
      status !== 'confirmado'
        ? 'no_aplica'
        : g.reconfirmed === true
          ? 'reconfirmado'
          : g.reconfirmed === false
            ? 'cancelado'
            : 'por_reconfirmar'

    const inviteUrl = `${siteUrl}/invite/${g.code}`

    // Las invitaciones son por FAMILIA, así que una de tres pases no puede
    // recibir un mensaje escrito en tú. `{singular|plural}` resuelve según
    // los pases y evita tener que mantener dos plantillas paralelas.
    const varios = g.max_passes > 1
    const fill = (tpl: string) =>
      tpl
        .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_m, uno: string, muchos: string) =>
          varios ? muchos : uno,
        )
        .replace(/\{name\}/g, g.display_name)
        .replace(/\{passes\}/g, varios ? `${g.max_passes} pases` : '1 pase')
        .replace(/\{link\}/g, inviteUrl)

    const suggestedMessage = fill(template)

    return {
      id: g.id,
      code: g.code,
      displayName: g.display_name,
      maxPasses: g.max_passes,
      groupLabel: g.group_label,
      phone: g.phone,
      openedAt: g.opened_at ? new Date(g.opened_at).toISOString() : null,
      status,
      reconfirmStatus,
      rsvp:
        status === 'pendiente'
          ? null
          : {
              attending: g.attending,
              guestsCount: g.guests_count,
              attendeeNames: g.attendee_names,
              dietary: g.dietary,
              message: g.message,
              reconfirmed: g.reconfirmed ?? null,
              updatedAt: g.updated_at ? new Date(g.updated_at).toISOString() : '',
            },
      inviteUrl,
      suggestedMessage,
      whatsappUrl: wa(g.phone, suggestedMessage),
      reconfirmWhatsappUrl: wa(g.phone, fill(RECONFIRM_MESSAGE)),
    }
  })

  const groups = [...new Set(guests.map((g) => g.groupLabel).filter((x): x is string => Boolean(x)))].sort()

  return { guests, groups }
})
