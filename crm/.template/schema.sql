-- Cloudgate CRM — SQLite schema + sample data
-- Run this against the project's `crm_db` SQLite database after importing
-- .template/workflow-template.json (the Database workflow nodes target this file).
-- Every table requires `Id INTEGER PRIMARY KEY AUTOINCREMENT` (Cloudgate convention).
-- Safe to re-run: tables use IF NOT EXISTS and seed rows are guarded.

CREATE TABLE IF NOT EXISTS companies (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT, Domain TEXT, Industry TEXT, Size TEXT, Website TEXT,
  Phone TEXT, Address TEXT, City TEXT, Country TEXT, Notes TEXT,
  OwnerUserId TEXT, CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT, Sort INTEGER DEFAULT 0, IsWon BOOLEAN DEFAULT 0, IsLost BOOLEAN DEFAULT 0, Color TEXT
);

CREATE TABLE IF NOT EXISTS leads (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  FirstName TEXT, LastName TEXT, Email TEXT, Phone TEXT, JobTitle TEXT,
  CompanyId INTEGER, CompanyName TEXT, Source TEXT, Status TEXT DEFAULT 'new',
  StageId INTEGER, Value DECIMAL DEFAULT 0, Rating TEXT, OwnerUserId TEXT,
  City TEXT, Country TEXT, Notes TEXT,
  LastContactedAt DATETIME, NextFollowUpAt DATETIME,
  IsArchived BOOLEAN DEFAULT 0,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contacts (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  FirstName TEXT, LastName TEXT, Email TEXT, Phone TEXT, JobTitle TEXT,
  CompanyId INTEGER, LeadId INTEGER, OwnerUserId TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  LeadId INTEGER, ContactId INTEGER, Type TEXT, Subject TEXT, Body TEXT,
  OwnerUserId TEXT, Meta TEXT, CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Title TEXT, Description TEXT, LeadId INTEGER, ContactId INTEGER,
  DueAt DATETIME, Priority TEXT DEFAULT 'normal', Status TEXT DEFAULT 'open',
  OwnerUserId TEXT, CompletedAt DATETIME,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tags (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT, Color TEXT
);

CREATE TABLE IF NOT EXISTS lead_tags (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  LeadId INTEGER, TagId INTEGER
);

CREATE TABLE IF NOT EXISTS emails (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  LeadId INTEGER, ContactId INTEGER, Direction TEXT DEFAULT 'outbound',
  FromEmail TEXT, ToEmail TEXT, Subject TEXT, Body TEXT,
  Status TEXT DEFAULT 'queued', ProviderMessageId TEXT, OwnerUserId TEXT,
  SentAt DATETIME, OpenedAt DATETIME, RepliedAt DATETIME,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS email_events (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  EmailId INTEGER, ProviderMessageId TEXT, EventType TEXT, Email TEXT, Url TEXT,
  Payload TEXT, CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_batches (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  FileName TEXT, TotalRows INTEGER DEFAULT 0, Imported INTEGER DEFAULT 0, Skipped INTEGER DEFAULT 0,
  OwnerUserId TEXT, CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_leads_stage ON leads(StageId);
CREATE INDEX IF NOT EXISTS ix_leads_owner ON leads(OwnerUserId);
CREATE INDEX IF NOT EXISTS ix_leads_email ON leads(Email);
CREATE INDEX IF NOT EXISTS ix_activities_lead ON activities(LeadId);
CREATE INDEX IF NOT EXISTS ix_emails_lead ON emails(LeadId);
CREATE INDEX IF NOT EXISTS ix_emails_msgid ON emails(ProviderMessageId);
CREATE INDEX IF NOT EXISTS ix_tasks_owner ON tasks(OwnerUserId);
CREATE INDEX IF NOT EXISTS ix_leadtags_lead ON lead_tags(LeadId);

-- --- Pipeline stages (config) ---
INSERT INTO pipeline_stages (Name, Sort, IsWon, IsLost, Color)
SELECT v.Name, v.Sort, v.IsWon, v.IsLost, v.Color FROM (
  SELECT 'New' Name, 1 Sort, 0 IsWon, 0 IsLost, '#64748b' Color UNION ALL
  SELECT 'Contacted', 2, 0, 0, '#3b82f6' UNION ALL
  SELECT 'Qualified', 3, 0, 0, '#6366f1' UNION ALL
  SELECT 'Proposal', 4, 0, 0, '#a855f7' UNION ALL
  SELECT 'Negotiation', 5, 0, 0, '#f59e0b' UNION ALL
  SELECT 'Won', 6, 1, 0, '#10b981' UNION ALL
  SELECT 'Lost', 7, 0, 1, '#ef4444'
) v
WHERE NOT EXISTS (SELECT 1 FROM pipeline_stages p WHERE p.Name = v.Name);

-- --- Tags (config) ---
INSERT INTO tags (Name, Color)
SELECT v.Name, v.Color FROM (
  SELECT 'Hot' Name, '#ef4444' Color UNION ALL
  SELECT 'Warm', '#f59e0b' UNION ALL
  SELECT 'Cold', '#3b82f6' UNION ALL
  SELECT 'Enterprise', '#6366f1' UNION ALL
  SELECT 'SMB', '#10b981' UNION ALL
  SELECT 'Newsletter', '#a855f7'
) v
WHERE NOT EXISTS (SELECT 1 FROM tags t WHERE t.Name = v.Name);

-- --- Sample data (loaded on Quick Start via schema.sql) ---
INSERT INTO companies (Name, Domain, Industry, Size, Website, City, Country)
SELECT v.Name, v.Domain, v.Industry, v.Size, 'https://' || v.Domain, v.City, v.Country FROM (
  SELECT 'Acme Corp' Name, 'acme.com' Domain, 'Manufacturing' Industry, '201-500' Size, 'Austin' City, 'USA' Country UNION ALL
  SELECT 'Globex', 'globex.io', 'Software', '51-200', 'London', 'UK' UNION ALL
  SELECT 'Initech', 'initech.com', 'Finance', '1000+', 'New York', 'USA' UNION ALL
  SELECT 'Umbrella', 'umbrella.co', 'Healthcare', '500-1000', 'Berlin', 'DE' UNION ALL
  SELECT 'Stark Industries', 'stark.com', 'Energy', '1000+', 'Los Angeles', 'USA'
) v
WHERE NOT EXISTS (SELECT 1 FROM companies c WHERE c.Name = v.Name);

INSERT INTO leads (FirstName, LastName, Email, Phone, JobTitle, CompanyName, Source, Status, StageId, Value, Rating, City, Country)
SELECT v.FirstName, v.LastName, v.Email, v.Phone, v.JobTitle, v.CompanyName, v.Source, v.Status,
       (SELECT Id FROM pipeline_stages WHERE Name = v.Stage), v.Value, v.Rating, v.City, v.Country FROM (
  SELECT 'Jane' FirstName,'Cooper' LastName,'jane.cooper@acme.com' Email,'+1-512-555-0101' Phone,'VP Sales' JobTitle,'Acme Corp' CompanyName,'Web' Source,'new' Status,'New' Stage,12000 Value,'Hot' Rating,'Austin' City,'USA' Country UNION ALL
  SELECT 'Robert','Fox','robert.fox@globex.io','+44-20-555-0102','CTO','Globex','Referral','working','Contacted',45000,'Warm','London','UK' UNION ALL
  SELECT 'Esther','Howard','esther@initech.com','+1-212-555-0103','Procurement','Initech','Import','qualified','Qualified',8000,'Cold','New York','USA' UNION ALL
  SELECT 'Cameron','Williamson','cam@globex.io','+44-20-555-0104','Head of Ops','Globex','Web','new','New',22000,'Warm','London','UK' UNION ALL
  SELECT 'Brooklyn','Simmons','brooklyn@acme.com','+1-512-555-0105','CEO','Acme Corp','Event','working','Proposal',67000,'Hot','Austin','USA' UNION ALL
  SELECT 'Wade','Warren','wade@umbrella.co','+49-30-555-0106','Director','Umbrella','Web','working','Negotiation',54000,'Hot','Berlin','DE' UNION ALL
  SELECT 'Leslie','Alexander','leslie@stark.com','+1-310-555-0107','Buyer','Stark Industries','Referral','working','Contacted',15000,'Warm','Los Angeles','USA' UNION ALL
  SELECT 'Guy','Hawkins','guy@initech.com','+1-212-555-0108','Analyst','Initech','Web','new','New',9000,'Cold','New York','USA'
) v
WHERE NOT EXISTS (SELECT 1 FROM leads l WHERE l.Email = v.Email);

INSERT INTO activities (LeadId, Type, Subject, Body)
SELECT (SELECT Id FROM leads WHERE Email = v.Email), v.Type, v.Subject, v.Body FROM (
  SELECT 'jane.cooper@acme.com' Email,'note' Type,'Initial interest' Subject,'Downloaded the pricing sheet from the website.' Body UNION ALL
  SELECT 'robert.fox@globex.io','call','Discovery call','Discussed integration needs, 30 min.' UNION ALL
  SELECT 'esther@initech.com','email','Sent intro deck','Shared the overview deck.' UNION ALL
  SELECT 'brooklyn@acme.com','meeting','On-site demo','Demoed the platform to the exec team.' UNION ALL
  SELECT 'wade@umbrella.co','note','Budget confirmed','Confirmed budget for Q3.'
) v
WHERE EXISTS (SELECT 1 FROM leads WHERE Email = v.Email);

INSERT INTO tasks (Title, LeadId, DueAt, Priority, Status)
SELECT v.Title, (SELECT Id FROM leads WHERE Email = v.Email), datetime('now', v.Due), v.Priority, 'open' FROM (
  SELECT 'Follow up with Jane' Title,'jane.cooper@acme.com' Email,'+2 days' Due,'high' Priority UNION ALL
  SELECT 'Send proposal to Brooklyn','brooklyn@acme.com','+1 day','high' UNION ALL
  SELECT 'Qualify Esther budget','esther@initech.com','+5 days','normal' UNION ALL
  SELECT 'Schedule demo with Wade','wade@umbrella.co','+3 days','normal'
) v
WHERE EXISTS (SELECT 1 FROM leads WHERE Email = v.Email);

INSERT INTO contacts (FirstName, LastName, Email, JobTitle, CompanyId)
SELECT v.FirstName, v.LastName, v.Email, v.JobTitle,
       (SELECT Id FROM companies WHERE Name = v.CompanyName) FROM (
  SELECT 'Jane' FirstName, 'Cooper' LastName, 'jane.cooper@acme.com' Email, 'VP Sales' JobTitle, 'Acme Corp' CompanyName UNION ALL
  SELECT 'Robert', 'Fox', 'robert.fox@globex.io', 'CTO', 'Globex'
) v
WHERE NOT EXISTS (SELECT 1 FROM contacts c WHERE c.Email = v.Email);
