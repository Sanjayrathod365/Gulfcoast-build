import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Doctor } from '@/types/doctor'

const doctorSchema = z.object({
  prefix: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  faxNumber: z.string().optional(),
  email: z.string().email('Invalid email address'),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  mapLink: z.string().url('Invalid URL').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
  hasLogin: z.boolean(),
})

type DoctorFormData = z.infer<typeof doctorSchema>

interface DoctorFormProps {
  doctor?: Doctor | null
  onSubmit: (data: Omit<Doctor, 'id'> | Partial<Doctor>) => void
  onCancel: () => void
}

export function DoctorForm({ doctor, onSubmit, onCancel }: DoctorFormProps) {
  const form = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      prefix: doctor?.prefix || '',
      name: doctor?.name || '',
      phoneNumber: doctor?.phoneNumber || '',
      faxNumber: doctor?.faxNumber || '',
      email: doctor?.email || '',
      clinicName: doctor?.clinicName || '',
      address: doctor?.address || '',
      mapLink: doctor?.mapLink || '',
      status: doctor?.status || 'ACTIVE',
      hasLogin: doctor?.hasLogin || false,
    },
  })

  const handleSubmit = (data: DoctorFormData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prefix"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prefix</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select prefix" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Dr.">Dr.</SelectItem>
                  <SelectItem value="Prof.">Prof.</SelectItem>
                  <SelectItem value="Mr.">Mr.</SelectItem>
                  <SelectItem value="Mrs.">Mrs.</SelectItem>
                  <SelectItem value="Ms.">Ms.</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Doctor's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="doctor@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="(XXX) XXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="faxNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fax Number</FormLabel>
              <FormControl>
                <Input placeholder="(XXX) XXX-XXXX" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="clinicName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic Name</FormLabel>
              <FormControl>
                <Input placeholder="Clinic name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="Clinic address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mapLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Map Link</FormLabel>
              <FormControl>
                <Input placeholder="Google Maps link" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hasLogin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </FormControl>
              <FormLabel>Has Login Access</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {doctor ? 'Update' : 'Create'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 