// Resolve a placeholder cover image for a course.
//
// Priority: explicit CoverImage (if you add one) -> per-course image keyed by
// Slug -> per-category fallback -> generic default. Files live in
// /public/course-covers and are served from the site root.

const BASE = '/course-covers';

const BY_SLUG = {
  'web-dev-fundamentals': `${BASE}/web-dev-fundamentals.svg`,
  'react-zero-to-hero': `${BASE}/react-zero-to-hero.svg`,
  'data-science-python': `${BASE}/data-science-python.svg`,
  'ui-ux-essentials': `${BASE}/ui-ux-essentials.svg`,
  'cloud-devops-foundations': `${BASE}/cloud-devops-foundations.svg`,
  'digital-marketing': `${BASE}/digital-marketing.svg`,
};

const BY_CATEGORY = {
  Development: `${BASE}/web-dev-fundamentals.svg`,
  Data: `${BASE}/data-science-python.svg`,
  Design: `${BASE}/ui-ux-essentials.svg`,
  Cloud: `${BASE}/cloud-devops-foundations.svg`,
  Marketing: `${BASE}/digital-marketing.svg`,
};

export const DEFAULT_COVER = `${BASE}/default.svg`;

/** Best placeholder cover URL for a course row. */
export function coverFor(course = {}) {
  if (course.CoverImage) return course.CoverImage;
  if (course.Slug && BY_SLUG[course.Slug]) return BY_SLUG[course.Slug];
  if (course.Category && BY_CATEGORY[course.Category]) return BY_CATEGORY[course.Category];
  return DEFAULT_COVER;
}
