// Certificates — list issued certificates and verify by serial.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsync } from '@/hooks/useAsync';
import { useStudent } from '@/hooks/useStudent';
import { certificatesApi } from '@/services/lms';
import { useToast } from '@/components/Toast';
import {
  Card, Badge, Spinner, ErrorState, EmptyState, PageHeader, Button, Input,
} from '@/components/ui';
import { formatDate } from '@/services/format';

function CertCard({ c }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-card">
      <div className="absolute right-3 top-3 text-3xl">🎓</div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-indigo-600">Certificate of Completion</p>
      <h3 className="font-display mt-2 text-xl font-semibold text-slate-900">{c.CourseTitle || 'Course'}</h3>
      <p className="mt-1 text-sm text-slate-600">Awarded to <span className="font-medium">{c.StudentName || c.StudentEmail}</span></p>
      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-500">
        <span className="font-mono">{c.Serial}</span>
        <span>{formatDate(c.IssuedAt)}</span>
      </div>
    </div>
  );
}

const Certificates = () => {
  const toast = useToast();
  const student = useStudent();
  const [scope, setScope] = useState('mine');
  const filters = scope === 'mine' ? { studentEmail: student.email } : {};
  const certs = useAsync(() => certificatesApi.list(filters), [scope, student.email]);
  const [serial, setSerial] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(undefined); // undefined=idle, null=not found, obj=found

  const rows = certs.data || [];

  async function verify() {
    if (!serial.trim()) return;
    setVerifying(true);
    setVerified(undefined);
    try {
      const c = await certificatesApi.verify(serial.trim());
      setVerified(c || null);
      if (!c) toast.error('No certificate with that serial');
    } catch (e) { toast.error(e?.message || 'Failed'); } finally { setVerifying(false); }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Certificates"
        subtitle="Completion certificates earned across courses."
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-sm">
            <button onClick={() => setScope('mine')} className={`rounded-md px-3 py-1.5 font-medium ${scope === 'mine' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>Mine</button>
            <button onClick={() => setScope('all')} className={`rounded-md px-3 py-1.5 font-medium ${scope === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}>All</button>
          </div>
        }
      />

      <Card title="Verify a certificate">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
          <Input placeholder="Enter serial, e.g. LMS-A1B2C3D4" value={serial} onChange={(e) => setSerial(e.target.value)} className="sm:max-w-sm" />
          <Button onClick={verify} loading={verifying}>Verify</Button>
          {verified === null && <Badge color="red">Not found</Badge>}
          {verified && <Badge color="green">Valid · {verified.CourseTitle} · {verified.StudentName}</Badge>}
        </div>
      </Card>

      {certs.loading ? <Card><Spinner /></Card> : certs.error ? <Card><ErrorState error={certs.error} onRetry={certs.reload} /></Card> :
        rows.length === 0 ? (
          <Card><EmptyState title="No certificates yet" message="Complete a course (100% progress) to earn one." action={<Link to="/learning"><Button>Go to My Learning</Button></Link>} /></Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((c) => <CertCard key={c.Id} c={c} />)}
          </div>
        )}
    </div>
  );
};

export { Certificates };
