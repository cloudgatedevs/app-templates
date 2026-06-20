// Quizzes — take auto-graded quizzes and manage questions.
import { useState } from 'react';
import { useAsync } from '@/hooks/useAsync';
import { useStudent } from '@/hooks/useStudent';
import { quizzesApi, attemptsApi, enrollmentsApi } from '@/services/lms';
import { useToast } from '@/components/Toast';
import { Modal } from '@/components/Modal';
import {
  Card, Badge, Spinner, ErrorState, EmptyState, PageHeader, Button, Field, Input,
} from '@/components/ui';
import { formatNumber } from '@/services/format';

function parseOptions(raw) {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : []; } catch { return []; }
}

function TakeQuiz({ quiz, onClose }) {
  const toast = useToast();
  const student = useStudent();
  const questions = useAsync(() => quizzesApi.questions(quiz.Id), [quiz.Id]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const qs = questions.data || [];

  async function submit() {
    if (qs.length === 0) return;
    let correct = 0;
    qs.forEach((q) => { if (Number(answers[q.Id]) === Number(q.CorrectIndex)) correct += 1; });
    const score = Math.round((correct / qs.length) * 100);
    const passed = score >= (Number(quiz.PassingScore) || 70);
    setSubmitting(true);
    try {
      let enrollmentId;
      try {
        const en = await enrollmentsApi.list({ courseId: quiz.CourseId, studentEmail: student.email });
        enrollmentId = en?.[0]?.Id;
      } catch { /* ignore */ }
      await attemptsApi.submit({
        quizId: quiz.Id, enrollmentId, studentName: student.name, studentEmail: student.email,
        answers: qs.map((q) => Number(answers[q.Id] ?? -1)), score, passed: passed ? 1 : 0,
      });
      setResult({ score, passed, correct, total: qs.length });
      toast[passed ? 'success' : 'info'](`Score ${score}% — ${passed ? 'passed' : 'keep practising'}`);
    } catch (e) { toast.error(e?.message || 'Failed to submit'); } finally { setSubmitting(false); }
  }

  return (
    <Modal open onClose={onClose} title={quiz.Title} maxWidth="max-w-xl" footer={
      result ? <Button onClick={onClose}>Close</Button> : <>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button loading={submitting} onClick={submit} disabled={qs.length === 0}>Submit answers</Button>
      </>
    }>
      {questions.loading ? <Spinner /> : questions.error ? <ErrorState error={questions.error} onRetry={questions.reload} /> :
        result ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-white ${result.passed ? 'bg-emerald-500' : 'bg-rose-500'}`}>{result.score}%</div>
            <p className="text-sm font-medium text-slate-800">{result.passed ? 'Passed! 🎉' : 'Not passed yet'}</p>
            <p className="text-xs text-slate-500">{result.correct} of {result.total} correct · pass mark {quiz.PassingScore}%</p>
          </div>
        ) : qs.length === 0 ? <EmptyState title="No questions" message="This quiz has no questions yet." /> : (
          <div className="flex flex-col gap-5">
            {qs.map((q, i) => {
              const opts = parseOptions(q.OptionsJson);
              return (
                <div key={q.Id} className="flex flex-col gap-2">
                  <p className="text-sm font-medium text-slate-800">{i + 1}. {q.Question}</p>
                  <div className="flex flex-col gap-1.5">
                    {opts.map((o, idx) => (
                      <label key={idx} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${Number(answers[q.Id]) === idx ? 'border-indigo-400 bg-indigo-50 text-indigo-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'}`}>
                        <input type="radio" name={`q${q.Id}`} checked={Number(answers[q.Id]) === idx} onChange={() => setAnswers((a) => ({ ...a, [q.Id]: idx }))} />
                        {o}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </Modal>
  );
}

function ManageQuestions({ quiz, onClose, onChanged }) {
  const toast = useToast();
  const questions = useAsync(() => quizzesApi.questions(quiz.Id), [quiz.Id]);
  const [form, setForm] = useState({ question: '', o0: '', o1: '', o2: '', o3: '', correctIndex: 0 });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const qs = questions.data || [];

  async function add() {
    const options = [form.o0, form.o1, form.o2, form.o3].map((x) => x.trim()).filter(Boolean);
    if (!form.question.trim() || options.length < 2) return toast.error('Need a question and at least 2 options');
    setSaving(true);
    try {
      await quizzesApi.addQuestion({ quizId: quiz.Id, question: form.question, options, correctIndex: Number(form.correctIndex), sortOrder: qs.length + 1 });
      toast.success('Question added');
      setForm({ question: '', o0: '', o1: '', o2: '', o3: '', correctIndex: 0 });
      questions.reload(); onChanged();
    } catch (e) { toast.error(e?.message || 'Failed'); } finally { setSaving(false); }
  }
  async function del(qid) {
    try { await quizzesApi.deleteQuestion(qid); questions.reload(); onChanged(); }
    catch (e) { toast.error(e?.message || 'Failed'); }
  }

  return (
    <Modal open onClose={onClose} title={`Manage: ${quiz.Title}`} maxWidth="max-w-xl" footer={<Button variant="secondary" onClick={onClose}>Done</Button>}>
      <div className="flex flex-col gap-4">
        {questions.loading ? <Spinner /> : (
          <ul className="flex flex-col gap-2">
            {qs.map((q, i) => (
              <li key={q.Id} className="flex items-start gap-2 rounded-lg border border-slate-200 p-2.5">
                <span className="grow text-sm text-slate-700">{i + 1}. {q.Question}</span>
                <button onClick={() => del(q.Id)} className="shrink-0 text-xs text-rose-500 hover:underline">Delete</button>
              </li>
            ))}
            {qs.length === 0 && <p className="px-1 text-xs text-slate-400">No questions yet.</p>}
          </ul>
        )}
        <div className="flex flex-col gap-2 rounded-lg border border-dashed border-slate-300 p-3">
          <Field label="New question"><Input value={form.question} onChange={(e) => set('question', e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1, 2, 3].map((idx) => (
              <label key={idx} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={Number(form.correctIndex) === idx} onChange={() => set('correctIndex', idx)} title="Mark correct" />
                <Input placeholder={`Option ${idx + 1}`} value={form[`o${idx}`]} onChange={(e) => set(`o${idx}`, e.target.value)} />
              </label>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">Select the radio next to the correct option.</p>
          <div className="flex justify-end"><Button size="sm" loading={saving} onClick={add}>Add question</Button></div>
        </div>
      </div>
    </Modal>
  );
}

const Quizzes = () => {
  const quizzes = useAsync(() => quizzesApi.list(), []);
  const [taking, setTaking] = useState(null);
  const [managing, setManaging] = useState(null);
  const rows = quizzes.data || [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Quizzes" subtitle="Take auto-graded quizzes or manage their questions." />

      {quizzes.loading ? <Card><Spinner /></Card> : quizzes.error ? <Card><ErrorState error={quizzes.error} onRetry={quizzes.reload} /></Card> :
        rows.length === 0 ? <Card><EmptyState title="No quizzes yet" message="Add quizzes from a course page." /></Card> : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((qz) => (
              <Card key={qz.Id}>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <Badge color="violet">{formatNumber(qz.QuestionCount)} questions</Badge>
                    <Badge color="gray">pass {qz.PassingScore}%</Badge>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900">{qz.Title}</h3>
                  <p className="line-clamp-2 text-xs text-slate-500">{qz.Description}</p>
                  <div className="mt-1 flex gap-2">
                    <Button size="sm" onClick={() => setTaking(qz)} disabled={!Number(qz.QuestionCount)}>Take quiz</Button>
                    <Button size="sm" variant="secondary" onClick={() => setManaging(qz)}>Manage</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      {taking && <TakeQuiz quiz={taking} onClose={() => setTaking(null)} />}
      {managing && <ManageQuestions quiz={managing} onClose={() => setManaging(null)} onChanged={quizzes.reload} />}
    </div>
  );
};

export { Quizzes };
