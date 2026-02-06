import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY environment variable')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

export const EMAIL_FROM = `${process.env.EMAIL_FROM_NAME || 'Sedkiy'} <${process.env.EMAIL_FROM || 'no-reply@sedkiy.dev'}>`
export const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO || undefined
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://sedkiy.dev'
