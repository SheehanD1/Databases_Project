USE internship_tracker;

INSERT INTO companies (company_id, name, industry) VALUES
  (1, 'IBM', 'Technology'),
  (2, 'Humana', 'Healthcare'),
  (3, 'Figma', 'Software'),
  (4, 'Capital One', 'Financial Services'),
  (5, 'Microsoft', 'Technology');

INSERT INTO statuses (status_id, name) VALUES
  (1, 'Applied'),
  (2, 'Assessment'),
  (3, 'Interview'),
  (4, 'Offer'),
  (5, 'Rejected'),
  (6, 'Withdrawn');

INSERT INTO applications
  (application_id, company_id, status_id, role_title, location, application_date, notes) VALUES
  (1, 1, 1, 'Software Engineering Intern', 'Poughkeepsie, NY', '2026-09-01', 'Sample data'),
  (2, 2, 2, 'Software Developer Intern', 'Remote', '2026-09-05', 'Sample data'),
  (3, 3, 3, 'Frontend Engineering Intern', 'San Francisco, CA', '2026-09-10', 'Sample data'),
  (4, 4, 4, 'Technology Intern', 'McLean, VA', '2026-09-15', 'Sample data'),
  (5, 5, 5, 'Software Engineering Intern', 'Redmond, WA', '2026-09-20', 'Sample data'),
  (6, 1, 6, 'Backend Engineering Intern', 'Remote', '2026-10-01', 'Sample data'),
  (7, 5, 1, 'Cloud Engineering Intern', 'Redmond, WA', '2026-10-03', 'Sample data');
