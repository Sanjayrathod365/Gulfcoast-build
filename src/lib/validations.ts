import { z } from 'zod'

// User validation
export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['ADMIN', 'DOCTOR', 'ATTORNEY']),
  phone: z.string().optional(),
})

// Doctor validation
export const doctorSchema = z.object({
  prefix: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  faxNumber: z.string().optional(),
  email: z.string().email('Invalid email address'),
  clinicName: z.string().optional(),
  address: z.string().optional(),
  mapLink: z.string().url('Invalid URL').nullable().optional(),
  status: z.enum(['Active', 'Inactive']),
  hasLogin: z.boolean(),
})

// Patient validation
export const patientSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phoneNumber: z.string().optional(),
  email: z.string().email('Invalid email address').optional(),
  address: z.string().optional(),
  insuranceInfo: z.string().optional(),
  medicalHistory: z.string().optional(),
})

// Case validation
export const caseSchema = z.object({
  caseNumber: z.string().min(1, 'Case number is required'),
  status: z.enum(['OPEN', 'PENDING', 'CLOSED', 'ARCHIVED']),
  filingDate: z.string().datetime(),
  notes: z.string().optional(),
})

// Task validation
export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
})

// Appointment validation
export const appointmentSchema = z.object({
  date: z.string().datetime(),
  type: z.string(),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
})

// Status validation
export const statusSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  type: z.enum(['CASE', 'TASK', 'APPOINTMENT', 'REFERRAL']),
})

// User settings validation
export const userSettingsSchema = z.object({
  notifications: z.object({
    email: z.boolean(),
    push: z.boolean(),
    sms: z.boolean(),
  }),
  theme: z.enum(['LIGHT', 'DARK', 'SYSTEM']),
})

// API response validation
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
  status: z.number().optional()
}) 