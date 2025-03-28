-- First, run the status seeding
\i prisma/migrations/seed_statuses.sql

-- Add statusId column (nullable initially)
ALTER TABLE "Patient" ADD COLUMN "statusId" TEXT;

-- Create a default "active" status if it doesn't exist
INSERT INTO "Status" (id, name, description, color, "createdAt", "updatedAt")
SELECT 
  'status_active',
  'Active',
  'Default active status',
  '#10B981',
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Status" WHERE id = 'status_active'
);

-- Update statusId based on existing status strings
UPDATE "Patient"
SET "statusId" = CASE 
  WHEN status = 'active' THEN 'status_active'
  WHEN status = 'new' THEN 'status_new'
  WHEN status = 'scheduled' THEN 'status_scheduled'
  WHEN status = 'completed' THEN 'status_completed'
  WHEN status = 'cancelled' THEN 'status_cancelled'
  ELSE 'status_active'
END;

-- Make statusId required and add foreign key constraint
ALTER TABLE "Patient" ALTER COLUMN "statusId" SET NOT NULL;
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "Status"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop the old status column
ALTER TABLE "Patient" DROP COLUMN "status"; 