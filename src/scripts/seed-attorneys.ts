import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const sampleAttorneys = [
  {
    name: 'John Smith',
    email: 'john.smith@lawfirm.com',
    password: 'password123',
    phone: '(555) 123-4567',
    faxNumber: '(555) 123-4568',
    address: '123 Main Street',
    city: 'Houston',
    state: 'TX',
    zipcode: '77002',
    notes: 'Experienced personal injury attorney with 15 years of practice.',
    caseManagers: [
      {
        name: 'Sarah Johnson',
        email: 'sarah.j@lawfirm.com',
        phone: '(555) 234-5678',
        phoneExt: '101',
        faxNumber: '(555) 234-5679'
      },
      {
        name: 'Michael Brown',
        email: 'michael.b@lawfirm.com',
        phone: '(555) 345-6789',
        phoneExt: '102',
        faxNumber: '(555) 345-6790'
      }
    ]
  },
  {
    name: 'Emily Davis',
    email: 'emily.davis@lawfirm.com',
    password: 'password123',
    phone: '(555) 456-7890',
    faxNumber: '(555) 456-7891',
    address: '456 Oak Avenue',
    city: 'Dallas',
    state: 'TX',
    zipcode: '75201',
    notes: 'Specialized in family law and divorce cases.',
    caseManagers: [
      {
        name: 'Lisa Wilson',
        email: 'lisa.w@lawfirm.com',
        phone: '(555) 567-8901',
        phoneExt: '201',
        faxNumber: '(555) 567-8902'
      }
    ]
  },
  {
    name: 'Robert Wilson',
    email: 'robert.wilson@lawfirm.com',
    password: 'password123',
    phone: '(555) 678-9012',
    faxNumber: '(555) 678-9013',
    address: '789 Pine Street',
    city: 'Austin',
    state: 'TX',
    zipcode: '78701',
    notes: 'Criminal defense attorney with expertise in white-collar crimes.',
    caseManagers: [
      {
        name: 'David Lee',
        email: 'david.l@lawfirm.com',
        phone: '(555) 789-0123',
        phoneExt: '301',
        faxNumber: '(555) 789-0124'
      }
    ]
  },
  {
    name: 'Jennifer Martinez',
    email: 'jennifer.m@lawfirm.com',
    password: 'password123',
    phone: '(555) 890-1234',
    faxNumber: '(555) 890-1235',
    address: '321 Elm Street',
    city: 'San Antonio',
    state: 'TX',
    zipcode: '78205',
    notes: 'Real estate and property law specialist.',
    caseManagers: [
      {
        name: 'Rachel Garcia',
        email: 'rachel.g@lawfirm.com',
        phone: '(555) 901-2345',
        phoneExt: '401',
        faxNumber: '(555) 901-2346'
      }
    ]
  },
  {
    name: 'William Taylor',
    email: 'william.t@lawfirm.com',
    password: 'password123',
    phone: '(555) 012-3456',
    faxNumber: '(555) 012-3457',
    address: '654 Maple Drive',
    city: 'Fort Worth',
    state: 'TX',
    zipcode: '76102',
    notes: 'Corporate law and business litigation expert.',
    caseManagers: [
      {
        name: 'Thomas Anderson',
        email: 'thomas.a@lawfirm.com',
        phone: '(555) 123-4567',
        phoneExt: '501',
        faxNumber: '(555) 123-4568'
      }
    ]
  }
]

async function seedAttorneys() {
  try {
    for (const attorney of sampleAttorneys) {
      // Hash password
      const hashedPassword = await bcrypt.hash(attorney.password, 10)

      // Create user first
      const user = await prisma.user.create({
        data: {
          email: attorney.email,
          password: hashedPassword,
          name: attorney.name,
          role: 'ATTORNEY',
        },
      })

      // Create attorney with case managers
      await prisma.attorney.create({
        data: {
          userId: user.id,
          phone: attorney.phone,
          faxNumber: attorney.faxNumber,
          address: attorney.address,
          city: attorney.city,
          state: attorney.state,
          zipcode: attorney.zipcode,
          notes: attorney.notes,
          caseManagers: {
            create: attorney.caseManagers
          }
        } as any
      })

      console.log(`Created attorney: ${attorney.name}`)
    }

    console.log('Successfully seeded attorneys')
  } catch (error) {
    console.error('Error seeding attorneys:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAttorneys() 