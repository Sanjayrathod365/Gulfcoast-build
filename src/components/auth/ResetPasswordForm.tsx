import { useForm, ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

interface ResetPasswordFormProps {
  onSubmit: (data: ResetPasswordFormData) => void
  onCancel: () => void
}

export function ResetPasswordForm({ onSubmit, onCancel }: ResetPasswordFormProps) {
  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const handleSubmit = (data: ResetPasswordFormData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }: { field: ControllerRenderProps<ResetPasswordFormData, "email"> }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Send Reset Link
          </Button>
        </div>
      </form>
    </Form>
  )
} 