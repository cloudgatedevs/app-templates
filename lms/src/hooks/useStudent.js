import { useAuthContext } from '@/auth';

/**
 * Resolve the signed-in IdP user as the LMS "student" identity.
 * Single-role app: everyone is a learner who can also author content.
 */
export function useStudent() {
  const { headerUser } = useAuthContext();
  const u = headerUser?.user || {};
  const name = [u.name, u.surname].filter(Boolean).join(' ').trim() || u.emailAddress || 'Student';
  const email = u.emailAddress || 'student@example.com';
  return { name, email, photoUrl: u.photoUrl || null };
}
