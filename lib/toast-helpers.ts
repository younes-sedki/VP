/**
 * Toast notification helpers for user actions
 */
import { toast } from '@/hooks/use-toast'

export const showToast = {
  success: (message: string) => {
    toast({
      description: message,
      variant: 'default',
      duration: 3000,
    })
  },
  error: (message: string) => {
    toast({
      description: message,
      variant: 'destructive',
      duration: 4000,
    })
  },
  info: (message: string) => {
    toast({
      description: message,
      variant: 'default',
      duration: 3000,
    })
  },
}
