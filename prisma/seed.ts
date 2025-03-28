import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gulfcoast.com' },
    update: {},
    create: {
      email: 'admin@gulfcoast.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  })
  console.log({ admin })

  // Create sample payers
  const payers = [
    { id: 'medicare', name: 'Medicare', isActive: true },
    { id: 'medicaid', name: 'Medicaid', isActive: true },
    { id: 'bcbs', name: 'Blue Cross Blue Shield', isActive: true },
    { id: 'aetna', name: 'Aetna', isActive: true },
    { id: 'uhc', name: 'UnitedHealthcare', isActive: true },
    { id: 'cigna', name: 'Cigna', isActive: true },
    { id: 'humana', name: 'Humana', isActive: true },
  ]

  for (const payer of payers) {
    await prisma.payer.upsert({
      where: { id: payer.id },
      update: {},
      create: payer,
    })
  }

  console.log('Sample payers created successfully')

  // Create initial statuses
  const statuses = [
    { name: 'Scheduled', color: '#4CAF50' },
    { name: 'Pending', color: '#FFC107' },
    { name: 'Completed', color: '#2196F3' },
    { name: 'Cancelled', color: '#F44336' },
    { name: 'Rescheduled', color: '#9C27B0' },
  ]

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { name: status.name },
      update: {},
      create: status,
    })
  }

  // Create sample facilities
  const facilities = [
    {
      id: 'facility1',
      name: 'Gulf Coast Medical Center',
      address: '123 Medical Drive',
      city: 'Tampa',
      state: 'FL',
      zip: '33601',
      phone: '813-555-0101',
      fax: '813-555-0102',
      email: 'info@gcmc.com',
      mapLink: 'https://maps.google.com/?q=Gulf+Coast+Medical+Center',
      status: 'active',
    },
    {
      id: 'facility2',
      name: 'Coastal Imaging Center',
      address: '456 Imaging Way',
      city: 'St. Petersburg',
      state: 'FL',
      zip: '33701',
      phone: '727-555-0201',
      fax: '727-555-0202',
      email: 'info@coastalimaging.com',
      mapLink: 'https://maps.google.com/?q=Coastal+Imaging+Center',
      status: 'active',
    },
    {
      id: 'facility3',
      name: 'Bayfront Surgery Center',
      address: '789 Surgery Blvd',
      city: 'Clearwater',
      state: 'FL',
      zip: '33755',
      phone: '727-555-0301',
      fax: '727-555-0302',
      email: 'info@bayfront.com',
      mapLink: 'https://maps.google.com/?q=Bayfront+Surgery+Center',
      status: 'active',
    },
  ]

  for (const facility of facilities) {
    await prisma.facility.upsert({
      where: { id: facility.id },
      update: {},
      create: facility,
    })
  }

  // Create sample physicians
  const physicians = [
    {
      id: 'physician1',
      prefix: 'Dr.',
      name: 'John Smith',
      suffix: 'MD',
      phoneNumber: '813-555-0401',
      email: 'john.smith@gcmc.com',
      npiNumber: '1234567890',
      isActive: true,
    },
    {
      id: 'physician2',
      prefix: 'Dr.',
      name: 'Sarah Johnson',
      suffix: 'DO',
      phoneNumber: '727-555-0402',
      email: 'sarah.johnson@coastalimaging.com',
      npiNumber: '0987654321',
      isActive: true,
    },
    {
      id: 'physician3',
      prefix: 'Dr.',
      name: 'Michael Brown',
      suffix: 'MD',
      phoneNumber: '727-555-0403',
      email: 'michael.brown@bayfront.com',
      npiNumber: '1122334455',
      isActive: true,
    },
  ]

  for (const physician of physicians) {
    await prisma.physician.upsert({
      where: { id: physician.id },
      update: {},
      create: physician,
    })
  }

  // Get the Scheduled status
  const scheduledStatus = await prisma.status.findUnique({
    where: { name: 'Scheduled' },
  })

  if (!scheduledStatus) {
    throw new Error('Scheduled status not found')
  }

  // Create a sample patient
  const patient = await prisma.patient.upsert({
    where: { id: 'patient1' },
    update: {},
    create: {
      id: 'patient1',
      firstName: 'John',
      lastName: 'Doe',
      dateOfBirth: new Date('1980-01-01'),
      phone: '813-555-0501',
      gender: 'M',
      address: '123 Main St',
      city: 'Tampa',
      zip: '33601',
      statusId: scheduledStatus.id,
      payerId: 'medicare',
      orderDate: new Date(),
      orderFor: 'MRI',
    },
  })

  // Create a sample procedure
  const procedure = await prisma.procedure.upsert({
    where: { id: 'procedure1' },
    update: {},
    create: {
      id: 'procedure1',
      patientId: patient.id,
      exam: 'MRI of Lumbar Spine',
      scheduleDate: new Date('2024-04-01'),
      scheduleTime: '10:00',
      facilityId: 'facility1',
      physicianId: 'physician1',
      statusId: scheduledStatus.id,
      lop: 'Approved',
      isCompleted: false,
    },
  })

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 