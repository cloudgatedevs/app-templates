-- Admin Starter (Light) — SQLite schema + sample data
-- Run this against the project's `admin_light_db` SQLite database after importing
-- .template/workflow-template.json (the Database workflow nodes target this file).
-- Every table requires `Id INTEGER PRIMARY KEY AUTOINCREMENT` (Cloudgate convention).
-- Safe to re-run: tables use IF NOT EXISTS and seed rows are guarded.

CREATE TABLE IF NOT EXISTS users (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Name TEXT, Surname TEXT, Email TEXT, Phone TEXT,
  Role TEXT DEFAULT 'member',            -- admin | manager | member
  Status TEXT DEFAULT 'active',          -- active | invited | disabled
  AvatarUrl TEXT, LastLoginAt DATETIME,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Reference TEXT, UserId INTEGER,
  CustomerName TEXT, CustomerEmail TEXT,
  Items INTEGER DEFAULT 1, Total DECIMAL DEFAULT 0, Currency TEXT DEFAULT 'USD',
  Status TEXT DEFAULT 'pending',         -- pending | paid | shipped | completed | cancelled
  Notes TEXT,
  CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP, UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_users_email ON users(Email);
CREATE INDEX IF NOT EXISTS ix_users_status ON users(Status);
CREATE INDEX IF NOT EXISTS ix_orders_ref ON orders(Reference);
CREATE INDEX IF NOT EXISTS ix_orders_user ON orders(UserId);
CREATE INDEX IF NOT EXISTS ix_orders_status ON orders(Status);
CREATE INDEX IF NOT EXISTS ix_orders_created ON orders(CreatedAt);

-- --- Sample users (loaded on Quick Start via schema.sql) ---
INSERT INTO users (Name, Surname, Email, Phone, Role, Status, LastLoginAt, CreatedAt)
SELECT v.Name, v.Surname, v.Email, v.Phone, v.Role, v.Status,
       datetime('now', v.LastLogin), datetime('now', v.Created) FROM (
  SELECT 'Ava' Name,'Nkosi' Surname,'ava.nkosi@example.com' Email,'+27-82-555-0101' Phone,'admin' Role,'active' Status,'-2 hours' LastLogin,'-320 days' Created UNION ALL
  SELECT 'Liam','Botha','liam.botha@example.com','+27-83-555-0102','manager','active','-1 days','-280 days' UNION ALL
  SELECT 'Zanele','Dlamini','zanele.dlamini@example.com','+27-84-555-0103','member','active','-3 days','-240 days' UNION ALL
  SELECT 'Noah','van Wyk','noah.vanwyk@example.com','+27-82-555-0104','member','active','-5 hours','-200 days' UNION ALL
  SELECT 'Emma','Petersen','emma.petersen@example.com','+27-83-555-0105','manager','active','-7 days','-170 days' UNION ALL
  SELECT 'Sipho','Mokoena','sipho.mokoena@example.com','+27-84-555-0106','member','invited',NULL,'-40 days' UNION ALL
  SELECT 'Mia','Jacobs','mia.jacobs@example.com','+27-82-555-0107','member','active','-12 days','-150 days' UNION ALL
  SELECT 'Ethan','Naidoo','ethan.naidoo@example.com','+27-83-555-0108','member','disabled','-90 days','-400 days' UNION ALL
  SELECT 'Lerato','Molefe','lerato.molefe@example.com','+27-84-555-0109','manager','active','-2 days','-120 days' UNION ALL
  SELECT 'Lucas','Fourie','lucas.fourie@example.com','+27-82-555-0110','member','active','-30 hours','-90 days' UNION ALL
  SELECT 'Chloe','Meyer','chloe.meyer@example.com','+27-83-555-0111','member','invited',NULL,'-12 days' UNION ALL
  SELECT 'Thabo','Sithole','thabo.sithole@example.com','+27-84-555-0112','member','active','-6 days','-60 days'
) v
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.Email = v.Email);

-- --- Sample orders (dates spread over ~90 days so the 30-day revenue stat is meaningful) ---
INSERT INTO orders (Reference, UserId, CustomerName, CustomerEmail, Items, Total, Status, CreatedAt)
SELECT v.Reference,
       (SELECT Id FROM users u WHERE u.Email = v.CustomerEmail),
       v.CustomerName, v.CustomerEmail, v.Items, v.Total, v.Status, datetime('now', v.Created) FROM (
  SELECT 'ORD-1001' Reference,'Ava Nkosi' CustomerName,'ava.nkosi@example.com' CustomerEmail,3 Items,149.85 Total,'completed' Status,'-85 days' Created UNION ALL
  SELECT 'ORD-1002','Liam Botha','liam.botha@example.com',1,29.99,'completed','-72 days' UNION ALL
  SELECT 'ORD-1003','Zanele Dlamini','zanele.dlamini@example.com',5,412.50,'completed','-64 days' UNION ALL
  SELECT 'ORD-1004','Noah van Wyk','noah.vanwyk@example.com',2,89.90,'cancelled','-55 days' UNION ALL
  SELECT 'ORD-1005','Emma Petersen','emma.petersen@example.com',4,260.00,'completed','-41 days' UNION ALL
  SELECT 'ORD-1006','Mia Jacobs','mia.jacobs@example.com',1,19.99,'completed','-33 days' UNION ALL
  SELECT 'ORD-1007','Lerato Molefe','lerato.molefe@example.com',2,158.00,'completed','-28 days' UNION ALL
  SELECT 'ORD-1008','Lucas Fourie','lucas.fourie@example.com',6,540.75,'shipped','-21 days' UNION ALL
  SELECT 'ORD-1009','Ava Nkosi','ava.nkosi@example.com',2,99.98,'completed','-18 days' UNION ALL
  SELECT 'ORD-1010','Zanele Dlamini','zanele.dlamini@example.com',3,225.00,'paid','-14 days' UNION ALL
  SELECT 'ORD-1011','Chloe Meyer','chloe.meyer@example.com',1,49.99,'shipped','-11 days' UNION ALL
  SELECT 'ORD-1012','Thabo Sithole','thabo.sithole@example.com',4,310.40,'paid','-8 days' UNION ALL
  SELECT 'ORD-1013','Emma Petersen','emma.petersen@example.com',2,120.00,'completed','-6 days' UNION ALL
  SELECT 'ORD-1014','Liam Botha','liam.botha@example.com',1,75.50,'pending','-4 days' UNION ALL
  SELECT 'ORD-1015','Mia Jacobs','mia.jacobs@example.com',3,199.97,'paid','-3 days' UNION ALL
  SELECT 'ORD-1016','Noah van Wyk','noah.vanwyk@example.com',2,88.00,'pending','-2 days' UNION ALL
  SELECT 'ORD-1017','Lucas Fourie','lucas.fourie@example.com',1,32.99,'pending','-1 days' UNION ALL
  SELECT 'ORD-1018','Lerato Molefe','lerato.molefe@example.com',5,455.25,'paid','-20 hours' UNION ALL
  SELECT 'ORD-1019','Ava Nkosi','ava.nkosi@example.com',2,140.00,'pending','-9 hours' UNION ALL
  SELECT 'ORD-1020','Zanele Dlamini','zanele.dlamini@example.com',1,59.99,'pending','-2 hours'
) v
WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.Reference = v.Reference);
