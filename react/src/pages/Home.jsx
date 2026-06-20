import { useAuthContext } from '@/auth';
import { getProfileDisplayName } from '@/auth';

const Home = () => {
  const { headerUser } = useAuthContext();
  const user = headerUser?.user;
  const displayName = getProfileDisplayName({
    name: user?.name,
    surname: user?.surname,
    email: user?.emailAddress,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {displayName}</h1>
        <p className="mt-1 text-sm text-gray-600">
          You are signed in via the IdP login flow. This is a placeholder home page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {['Overview', 'Activity', 'Settings'].map((title) => (
          <div key={title} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-xs text-gray-500">Placeholder content.</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
        Start building your app here.
      </div>
    </div>
  );
};

export { Home };
