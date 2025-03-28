-- Insert main exams
INSERT INTO "Exam" (id, name, category, status, "createdAt", "updatedAt")
VALUES
  ('exam_right_foot', 'INJ RIGHT FOOT', 'Injection', 'active', NOW(), NOW()),
  ('exam_left_foot', 'INJ LEFT FOOT', 'Injection', 'active', NOW(), NOW()),
  ('exam_right_knee', 'INJ RIGHT KNEE', 'Injection', 'active', NOW(), NOW()),
  ('exam_left_knee', 'INJ LEFT KNEE', 'Injection', 'active', NOW(), NOW()),
  ('exam_right_shoulder', 'INJ RIGHT SHOULDER', 'Injection', 'active', NOW(), NOW()),
  ('exam_left_shoulder', 'INJ LEFT SHOULDER', 'Injection', 'active', NOW(), NOW()),
  ('exam_lumbar_esi', 'LUMBAR ESI', 'Injection', 'active', NOW(), NOW()),
  ('exam_cervical_esi', 'CERVICAL ESI', 'Injection', 'active', NOW(), NOW());

-- Insert sub-exams
INSERT INTO "SubExam" (id, "examId", name, price, "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'exam_right_foot', '- RIGHT FOOT INJECTION', 2500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_right_foot', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()),
  
  (gen_random_uuid(), 'exam_left_foot', '- LEFT FOOT INJECTION', 2500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_left_foot', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()),
  
  (gen_random_uuid(), 'exam_right_knee', '20610 - RIGHT KNEE INJECTION', 2500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_right_knee', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()),
  
  (gen_random_uuid(), 'exam_left_knee', '20610 - LEFT KNEE INJECTION', 2500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_left_knee', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()),
  
  (gen_random_uuid(), 'exam_right_shoulder', '20610 - RIGHT SHOULDER INJECTION', 2500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_right_shoulder', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()),
  
  (gen_random_uuid(), 'exam_left_shoulder', '20610 - LEFT SHOULDER INJECTION', 2500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_left_shoulder', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()),
  
  (gen_random_uuid(), 'exam_lumbar_esi', '62323 - LUMBAR EPIDURAL STEROID INJECTION', 3500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_lumbar_esi', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()),
  
  (gen_random_uuid(), 'exam_cervical_esi', '62321 - CERVICAL EPIDURAL STEROID INJECTION', 3500.00, NOW(), NOW()),
  (gen_random_uuid(), 'exam_cervical_esi', '77003 - FLOROSCOPIC IMAGE', 500.00, NOW(), NOW()); 