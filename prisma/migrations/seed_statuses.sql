-- Insert scheduling-related statuses
INSERT INTO "Status" (id, name, description, color, "createdAt", "updatedAt")
VALUES
  ('status_new', 'New', 'New patient or case that needs to be processed', '#3B82F6', NOW(), NOW()),
  ('status_scheduling', 'Scheduling', 'In the process of scheduling', '#F59E0B', NOW(), NOW()),
  ('status_scheduled', 'Scheduled', 'Appointment has been scheduled', '#10B981', NOW(), NOW()),
  ('status_completed', 'Completed', 'All procedures completed', '#059669', NOW(), NOW()),
  ('status_cancelled', 'Cancelled', 'Appointment or procedure cancelled', '#EF4444', NOW(), NOW()),
  ('status_rescheduling', 'Rescheduling', 'Needs to be rescheduled', '#8B5CF6', NOW(), NOW()),
  ('status_pending_auth', 'Pending Authorization', 'Waiting for insurance authorization', '#6366F1', NOW(), NOW()),
  ('status_pending_records', 'Pending Records', 'Waiting for medical records', '#EC4899', NOW(), NOW()),
  ('status_no_show', 'No Show', 'Patient did not show up for appointment', '#DC2626', NOW(), NOW()),
  ('status_on_hold', 'On Hold', 'Case temporarily on hold', '#9CA3AF', NOW(), NOW()); 