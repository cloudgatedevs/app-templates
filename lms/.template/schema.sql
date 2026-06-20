-- Cloudgate LMS — SQLite schema + demo seed for the `lms_db` database.
-- Safe to re-run: tables use IF NOT EXISTS and seed rows use explicit Ids with
-- INSERT OR IGNORE, so running this again will not duplicate data.

CREATE TABLE IF NOT EXISTS courses (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  Title TEXT NOT NULL,
  Slug TEXT,
  Summary TEXT,
  Description TEXT,
  Category TEXT,
  Level TEXT DEFAULT 'Beginner',
  Instructor TEXT,
  CoverColor TEXT DEFAULT '#0d9488',
  DurationHours REAL DEFAULT 0,
  Published INTEGER DEFAULT 1,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  CourseId INTEGER NOT NULL,
  Title TEXT NOT NULL,
  Content TEXT,
  ContentType TEXT DEFAULT 'text',
  VideoUrl TEXT,
  SortOrder INTEGER DEFAULT 0,
  DurationMin INTEGER DEFAULT 0,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enrollments (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  CourseId INTEGER NOT NULL,
  StudentName TEXT,
  StudentEmail TEXT,
  Status TEXT DEFAULT 'active',
  ProgressPct INTEGER DEFAULT 0,
  EnrolledAt TEXT DEFAULT CURRENT_TIMESTAMP,
  CompletedAt TEXT,
  UNIQUE(CourseId, StudentEmail)
);

CREATE TABLE IF NOT EXISTS lesson_progress (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  EnrollmentId INTEGER NOT NULL,
  LessonId INTEGER NOT NULL,
  Completed INTEGER DEFAULT 0,
  CompletedAt TEXT,
  UNIQUE(EnrollmentId, LessonId)
);

CREATE TABLE IF NOT EXISTS quizzes (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  CourseId INTEGER NOT NULL,
  Title TEXT NOT NULL,
  Description TEXT,
  PassingScore INTEGER DEFAULT 70,
  CreatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  QuizId INTEGER NOT NULL,
  Question TEXT NOT NULL,
  OptionsJson TEXT,
  CorrectIndex INTEGER DEFAULT 0,
  SortOrder INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  QuizId INTEGER NOT NULL,
  EnrollmentId INTEGER,
  StudentName TEXT,
  StudentEmail TEXT,
  Score INTEGER DEFAULT 0,
  Passed INTEGER DEFAULT 0,
  AnswersJson TEXT,
  AttemptedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certificates (
  Id INTEGER PRIMARY KEY AUTOINCREMENT,
  CourseId INTEGER NOT NULL,
  EnrollmentId INTEGER,
  StudentName TEXT,
  StudentEmail TEXT,
  Serial TEXT,
  IssuedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ---- Seed: courses ----
INSERT OR IGNORE INTO courses (Id,Title,Slug,Summary,Description,Category,Level,Instructor,CoverColor,DurationHours,Published) VALUES
 (1,'Web Development Fundamentals','web-dev-fundamentals','Build your first websites with HTML, CSS and JavaScript.','A hands-on introduction to how the web works. Write semantic HTML, style pages with modern CSS, and add interactivity with JavaScript.','Development','Beginner','Dr. Maya Chen','#0d9488',8,1),
 (2,'React from Zero to Hero','react-zero-to-hero','Master modern React with hooks, routing and state.','Go from components to production apps: hooks, context, routing, data fetching and performance patterns.','Development','Intermediate','James Okoro','#0ea5e9',12,1),
 (3,'Data Science with Python','data-science-python','Analyse data and build models with pandas and scikit-learn.','Learn the data science workflow: cleaning data, visualising insights, and training your first ML models.','Data','Intermediate','Dr. Priya Nair','#8b5cf6',16,1),
 (4,'UI/UX Design Essentials','ui-ux-essentials','Design intuitive, beautiful interfaces users love.','Principles of visual hierarchy, colour, typography and usability, plus a practical Figma workflow.','Design','Beginner','Lena Hoffmann','#fb7185',6,1),
 (5,'Cloud & DevOps Foundations','cloud-devops-foundations','Ship and scale apps with containers and CI/CD.','Understand cloud computing, Docker, CI/CD pipelines and infrastructure as code.','Cloud','Advanced','Marco Rossi','#f59e0b',14,1),
 (6,'Digital Marketing Masterclass','digital-marketing','Grow an audience with SEO, content and analytics.','A practical tour of SEO, content marketing, social and measuring what matters with analytics.','Marketing','Beginner','Aisha Bello','#14b8a6',7,0);

-- ---- Seed: lessons ----
INSERT OR IGNORE INTO lessons (Id,CourseId,Title,Content,SortOrder,DurationMin) VALUES
 (1,1,'How the Web Works','An overview of clients, servers, HTTP and the request/response cycle.',1,15),
 (2,1,'Semantic HTML','Structure content with the right tags for accessibility and SEO.',2,25),
 (3,1,'Styling with CSS','Selectors, the box model, flexbox and responsive layouts.',3,30),
 (4,1,'JavaScript Basics','Variables, functions, the DOM and handling events.',4,35),
 (5,1,'Your First Project','Put it together by building a small landing page.',5,40),
 (6,2,'Thinking in Components','Break UIs into reusable, composable components.',1,20),
 (7,2,'State and Props','Manage data flow with props and the useState hook.',2,30),
 (8,2,'Effects and Lifecycle','Synchronise with the outside world using useEffect.',3,30),
 (9,2,'Routing','Add multiple pages with React Router.',4,25),
 (10,2,'Fetching Data','Load and cache remote data the right way.',5,35),
 (11,3,'The Data Science Workflow','From question to insight: the end-to-end process.',1,20),
 (12,3,'Pandas Fundamentals','Load, filter and transform tabular data.',2,40),
 (13,3,'Data Visualisation','Tell stories with matplotlib and seaborn.',3,35),
 (14,3,'Intro to Machine Learning','Supervised vs unsupervised learning explained.',4,30),
 (15,3,'Your First Model','Train and evaluate a model with scikit-learn.',5,45),
 (16,4,'Design Principles','Hierarchy, contrast, balance and alignment.',1,20),
 (17,4,'Colour and Typography','Build accessible, harmonious type and colour systems.',2,25),
 (18,4,'Wireframing','Sketch and structure layouts before visual design.',3,20),
 (19,4,'Figma Workflow','Design, prototype and hand off in Figma.',4,30),
 (20,5,'Cloud Computing 101','Core cloud concepts and service models.',1,20),
 (21,5,'Containers with Docker','Package apps consistently with Docker.',2,40),
 (22,5,'CI/CD Pipelines','Automate build, test and deploy.',3,35),
 (23,5,'Infrastructure as Code','Provision repeatable infrastructure.',4,35),
 (24,6,'Marketing Foundations','Audiences, funnels and positioning.',1,15),
 (25,6,'SEO Essentials','Rank higher with on-page and technical SEO.',2,30),
 (26,6,'Content & Social','Plan content that converts.',3,25),
 (27,6,'Measuring Success','Track the metrics that matter.',4,20);

-- ---- Seed: quizzes + questions ----
INSERT OR IGNORE INTO quizzes (Id,CourseId,Title,Description,PassingScore) VALUES
 (1,1,'HTML & CSS Basics Quiz','Check your understanding of core web fundamentals.',70),
 (2,2,'React Fundamentals Quiz','Test your grasp of components, props and hooks.',70),
 (3,3,'Python Data Quiz','A quick check on the data science basics.',60);

INSERT OR IGNORE INTO quiz_questions (Id,QuizId,Question,OptionsJson,CorrectIndex,SortOrder) VALUES
 (1,1,'Which tag is used for the largest heading?','["<h1>","<head>","<heading>","<h6>"]',0,1),
 (2,1,'Which CSS property controls text size?','["font-weight","font-size","text-style","size"]',1,2),
 (3,1,'What does HTML stand for?','["Hyperlinks Text Mark Language","HyperText Markup Language","Home Tool Markup Language","HyperText Machine Language"]',1,3),
 (4,2,'Which hook manages local state?','["useEffect","useState","useRef","useMemo"]',1,1),
 (5,2,'How do you pass data to a child component?','["state","context only","props","refs"]',2,2),
 (6,2,'When does useEffect run by default?','["Before render","After every render","Never","Only on unmount"]',1,3),
 (7,3,'Which library is used for dataframes?','["numpy","pandas","flask","requests"]',1,1),
 (8,3,'Which is a supervised learning task?','["Clustering","Classification","Dimensionality reduction","Association"]',1,2);

-- ---- Seed: enrolments (demo students) ----
INSERT OR IGNORE INTO enrollments (Id,CourseId,StudentName,StudentEmail,Status,ProgressPct,CompletedAt) VALUES
 (1,1,'Ava Thompson','ava@example.com','completed',100,CURRENT_TIMESTAMP),
 (2,2,'Ava Thompson','ava@example.com','active',60,NULL),
 (3,1,'Liam Carter','liam@example.com','active',40,NULL),
 (4,3,'Liam Carter','liam@example.com','active',20,NULL),
 (5,2,'Sofia Reyes','sofia@example.com','completed',100,CURRENT_TIMESTAMP),
 (6,4,'Sofia Reyes','sofia@example.com','active',50,NULL),
 (7,5,'Noah Patel','noah@example.com','active',30,NULL),
 (8,6,'Emma Brooks','emma@example.com','completed',100,CURRENT_TIMESTAMP),
 (9,1,'Emma Brooks','emma@example.com','active',80,NULL),
 (10,3,'Noah Patel','noah@example.com','active',10,NULL);

INSERT OR IGNORE INTO lesson_progress (Id,EnrollmentId,LessonId,Completed,CompletedAt) VALUES
 (1,1,1,1,CURRENT_TIMESTAMP),(2,1,2,1,CURRENT_TIMESTAMP),(3,1,3,1,CURRENT_TIMESTAMP),(4,1,4,1,CURRENT_TIMESTAMP),(5,1,5,1,CURRENT_TIMESTAMP),
 (6,3,1,1,CURRENT_TIMESTAMP),(7,3,2,1,CURRENT_TIMESTAMP),
 (8,9,1,1,CURRENT_TIMESTAMP),(9,9,2,1,CURRENT_TIMESTAMP),(10,9,3,1,CURRENT_TIMESTAMP),(11,9,4,1,CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO quiz_attempts (Id,QuizId,EnrollmentId,StudentName,StudentEmail,Score,Passed,AnswersJson) VALUES
 (1,1,1,'Ava Thompson','ava@example.com',100,1,'[0,1,1]'),
 (2,1,3,'Liam Carter','liam@example.com',66,0,'[0,1,3]'),
 (3,2,5,'Sofia Reyes','sofia@example.com',100,1,'[1,2,1]');

INSERT OR IGNORE INTO certificates (Id,CourseId,EnrollmentId,StudentName,StudentEmail,Serial) VALUES
 (1,1,1,'Ava Thompson','ava@example.com','LMS-' || upper(hex(randomblob(4)))),
 (2,2,5,'Sofia Reyes','sofia@example.com','LMS-' || upper(hex(randomblob(4)))),
 (3,6,8,'Emma Brooks','emma@example.com','LMS-' || upper(hex(randomblob(4))));
