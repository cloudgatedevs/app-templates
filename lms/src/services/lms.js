// LMS service layer — thin wrappers over the signed Cloudgate workflow API.
//
// Every call is `api.post('/<route>', { op, ...fields })`. Responses are coerced
// into arrays of rows. `list*` helpers return the array; `get/create/update`
// helpers return the first row. Columns are PascalCase (SQLite schema).

import { api } from './api';

function asArray(res) {
  if (Array.isArray(res)) return res;
  if (res == null) return [];
  if (typeof res === 'object') return [res];
  return [];
}

function first(res) {
  const arr = asArray(res);
  return arr.length ? arr[0] : null;
}

function clean(fields = {}) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

const listCall = (route, op, fields) => api.post(route, clean({ op, ...fields })).then(asArray);
const rowCall = (route, op, fields) => api.post(route, clean({ op, ...fields })).then(first);
const voidCall = (route, op, fields) => api.post(route, clean({ op, ...fields }));

export const coursesApi = {
  list: (filters = {}) => listCall('/courses', 'list', filters),
  get: (id) => rowCall('/courses', 'get', { id }),
  create: (fields) => rowCall('/courses', 'create', fields),
  update: (id, fields) => rowCall('/courses', 'update', { id, ...fields }),
  remove: (id) => voidCall('/courses', 'delete', { id }),
};

export const lessonsApi = {
  list: (courseId) => listCall('/lessons', 'list', { courseId }),
  get: (id) => rowCall('/lessons', 'get', { id }),
  create: (fields) => rowCall('/lessons', 'create', fields),
  update: (id, fields) => rowCall('/lessons', 'update', { id, ...fields }),
  remove: (id) => voidCall('/lessons', 'delete', { id }),
};

export const enrollmentsApi = {
  list: (filters = {}) => listCall('/enrollments', 'list', filters),
  get: (id) => rowCall('/enrollments', 'get', { id }),
  create: (fields) => rowCall('/enrollments', 'create', fields),
  update: (id, fields) => rowCall('/enrollments', 'update', { id, ...fields }),
  remove: (id) => voidCall('/enrollments', 'delete', { id }),
};

export const progressApi = {
  forEnrollment: (enrollmentId) => listCall('/progress', 'forEnrollment', { enrollmentId }),
  complete: (enrollmentId, lessonId, completed = true) =>
    rowCall('/progress', 'complete', { enrollmentId, lessonId, completed }),
};

export const quizzesApi = {
  list: (courseId) => listCall('/quizzes', 'list', { courseId }),
  get: (id) => rowCall('/quizzes', 'get', { id }),
  questions: (quizId) => listCall('/quizzes', 'questions', { quizId }),
  create: (fields) => rowCall('/quizzes', 'create', fields),
  update: (id, fields) => rowCall('/quizzes', 'update', { id, ...fields }),
  remove: (id) => voidCall('/quizzes', 'delete', { id }),
  addQuestion: (fields) => rowCall('/quizzes', 'addQuestion', fields),
  deleteQuestion: (questionId) => voidCall('/quizzes', 'deleteQuestion', { questionId }),
};

export const attemptsApi = {
  submit: (fields) => rowCall('/quiz-attempts', 'submit', fields),
  list: (filters = {}) => listCall('/quiz-attempts', 'list', filters),
};

export const certificatesApi = {
  list: (filters = {}) => listCall('/certificates', 'list', filters),
  issue: (fields) => rowCall('/certificates', 'issue', fields),
  verify: (serial) => rowCall('/certificates', 'verify', { serial }),
  remove: (id) => voidCall('/certificates', 'delete', { id }),
};

export const dashboardApi = {
  stats: async () => (await rowCall('/dashboard', 'stats', {})) || {},
  topCourses: () => listCall('/dashboard', 'topcourses', {}),
  recent: () => listCall('/dashboard', 'recent', {}),
  byCategory: () => listCall('/dashboard', 'bycategory', {}),
};

export const activityApi = {
  list: (filters = {}) => listCall('/activity', 'list', filters),
};
