import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileCheck2,
  HardHat,
  Paperclip,
  RotateCcw,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { FileUploader } from '../components/FileUploader';
import { Stepper } from '../components/Stepper';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useSubmissions } from '../context/SubmissionsContext';
import {
  DEFECT_TYPES,
  labelFor,
  MACHINES,
  OBSERVATION_CATEGORIES,
  PLANTS,
  QUALITY_CATEGORIES,
  SEVERITY_OPTIONS,
  SHIFTS,
} from '../data/reference';
import {
  clearDraft,
  emptyDraft,
  loadDraft,
  saveDraft,
} from '../services/submissions';
import type { FormValues, SubmissionKind, WizardDraft } from '../types';

const STEPS = ['Machine', 'Details', 'Evidence', 'Review', 'Submit'];

export function WizardPage() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { create } = useSubmissions();
  const kind: SubmissionKind = user?.role === 'quality-inspector' ? 'inspection' : 'observation';

  const initial = useMemo<WizardDraft>(() => {
    const saved = loadDraft(kind);
    if (saved?.values && saved?.evidence) return saved;
    return emptyDraft(kind);
  }, [kind]);

  const wantsEvidence = Boolean(
    (location.state as { focusEvidence?: boolean } | null)?.focusEvidence,
  );
  const [step, setStep] = useState(
    wantsEvidence ? 3 : Math.min(Math.max(initial.step, 1), 5),
  );
  const [values, setValues] = useState<FormValues>(initial.values);
  const [evidence, setEvidence] = useState(initial.evidence);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const isInspection = kind === 'inspection';
  const categories = isInspection ? QUALITY_CATEGORIES : OBSERVATION_CATEGORIES;
  const entityLabel = isInspection ? 'inspection' : 'observation';

  useEffect(() => {
    saveDraft(kind, { step, values, evidence, updatedAt: new Date().toISOString() });
  }, [kind, step, values, evidence]);

  useEffect(() => {
    const hasContent =
      Boolean(initial.values.description) ||
      Boolean(initial.values.machine) ||
      initial.evidence.length > 0 ||
      initial.step > 1;
    if (hasContent) {
      toast.info('Draft restored', 'Continue where you left off.');
    }
    // Toast is intentionally called once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  if (!user.roleConfirmed) return <Navigate to="/role" replace />;

  const setValue = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateStep = (target: number): boolean => {
    const found: Partial<Record<keyof FormValues, string>> = {};

    if (target === 1) {
      if (!values.plant) found.plant = 'Select a plant.';
      if (!values.machine) found.machine = 'Select a machine or line.';
      if (!values.shift) found.shift = 'Select a shift.';
    }

    if (target === 2) {
      if (!values.category) found.category = 'Select a category.';
      if (values.description.trim().length < 15)
        found.description = 'Provide at least 15 characters of detail.';
      if (isInspection) {
        if (!values.lotNumber.trim()) found.lotNumber = 'Enter the lot or batch number.';
        const inspected = Number(values.inspectedQuantity);
        const defective = Number(values.defectQuantity);
        if (!values.inspectedQuantity || !Number.isFinite(inspected) || inspected <= 0)
          found.inspectedQuantity = 'Enter a sample size greater than zero.';
        if (values.defectQuantity === '' || !Number.isFinite(defective) || defective < 0)
          found.defectQuantity = 'Enter the number of defective units.';
        else if (defective > inspected)
          found.defectQuantity = 'Defects cannot exceed the sample size.';
      }
    }

    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Required information missing', 'Please review the highlighted fields.');
      return false;
    }
    return true;
  };

  const goTo = (target: number) => {
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    goTo(Math.min(step + 1, 5));
  };

  const handleBack = () => {
    if (step === 1) {
      navigate(user.role === 'quality-inspector' ? '/app/quality' : '/app/operator');
      return;
    }
    goTo(step - 1);
  };

  const discardDraft = () => {
    clearDraft(kind);
    setValues(emptyDraft(kind).values);
    setEvidence([]);
    setConfirmed(false);
    setErrors({});
    goTo(1);
    toast.info('Draft cleared', 'All form fields have been reset.');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateStep(5) || submitting) return;

    // Tapping Submit is itself an acknowledgement, so the button always works
    // on the first click. Keep the visible checkbox state consistent.
    if (!confirmed) setConfirmed(true);

    setSubmitting(true);
    try {
      const record = await create({ kind, user, values, evidence });
      clearDraft(kind);
      toast.success(
        `${entityLabel === 'observation' ? 'Observation' : 'Inspection'} submitted`,
        `Reference ${record.id} has been recorded.`,
      );
      navigate(`/app/success/${record.id}`, { replace: true, state: { record } });
    } catch (error) {
      toast.error(
        'Submission failed',
        error instanceof Error ? error.message : 'Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inspectionRows: [string, string][] = isInspection
    ? [
        ['Lot / Batch', values.lotNumber || '—'],
        ['Sample size', values.inspectedQuantity || '—'],
        ['Defective units', values.defectQuantity || '0'],
        ['Verdict', values.verdict.toUpperCase()],
      ]
    : [];

  const summaryRows: [string, string][] = [
    ['Plant', labelFor(PLANTS, values.plant)],
    ['Machine / Line', labelFor(MACHINES, values.machine)],
    ['Shift', labelFor(SHIFTS, values.shift)],
    ['Category', labelFor(categories, values.category)],
    ['Priority', values.severity.toUpperCase()],
    ...inspectionRows,
    ['Evidence files', String(evidence.length)],
  ];

  return (
    <div className="wizard-page fade-up">
      <header className="wizard-header">
        <div className="wizard-header__inner">
          <div className="row" style={{ gap: 12 }}>
            <button
              className="btn btn--secondary btn--icon"
              type="button"
              aria-label="Back to dashboard"
              onClick={() => navigate(user.role === 'quality-inspector' ? '/app/quality' : '/app/operator')}
            >
              <X size={18} />
            </button>
            <div>
              <span className="eyebrow">New submission · {kind}</span>
              <h1>
                {isInspection ? 'Create New Inspection' : 'Operator Observation Form'}
              </h1>
            </div>
          </div>
          <button className="btn btn--secondary btn--sm" type="button" onClick={discardDraft}>
            <RotateCcw size={14} /> Discard draft
          </button>
        </div>
        <Stepper steps={STEPS} current={step} />
      </header>

      <form className="wizard-main" onSubmit={handleSubmit}>
        <div className="context-strip">
          <div className="context-strip__item">
            <span>Plant</span>
            <strong>{values.plant ? labelFor(PLANTS, values.plant) : 'Not selected'}</strong>
          </div>
          <div className="context-strip__item">
            <span>Line</span>
            <strong>{values.machine ? labelFor(MACHINES, values.machine) : 'Not selected'}</strong>
          </div>
          <div className="context-strip__item">
            <span>Shift</span>
            <strong>{values.shift ? labelFor(SHIFTS, values.shift).split(' — ')[0] : 'Not selected'}</strong>
          </div>
          <div className="context-strip__item">
            <span>Reference</span>
            <strong className="mono">DRAFT · {user.employeeId}</strong>
          </div>
        </div>

        <div className="wizard-card">
          <div className="wizard-card__head">
            <div className="wizard-card__badge">{step}</div>
            <div>
              <h2>
                {step === 1 && 'Machine Context'}
                {step === 2 && (isInspection ? 'Inspection Details' : 'Observation Details')}
                {step === 3 && 'Attach Evidence'}
                {step === 4 && 'Review Submission'}
                {step === 5 && 'Submit Report'}
              </h2>
              <p>
                {step === 1 && 'Identify where and when this report applies.'}
                {step === 2 && 'Describe what happened and classify its priority.'}
                {step === 3 && 'Add photos, video clips or voice notes (optional).'}
                {step === 4 && 'Check every detail before final submission.'}
                {step === 5 && 'Confirm and record your report.'}
              </p>
            </div>
          </div>

          <div className="wizard-card__body">
            {step === 1 && (
              <div className="form-grid">
                <Field label="Plant" htmlFor="plant" required error={errors.plant}>
                  <select
                    className="select"
                    id="plant"
                    value={values.plant}
                    onChange={(event) => setValue('plant', event.target.value)}
                  >
                    <option value="">Select plant…</option>
                    {PLANTS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Machine / Line" htmlFor="machine" required error={errors.machine}>
                  <select
                    className="select"
                    id="machine"
                    value={values.machine}
                    onChange={(event) => setValue('machine', event.target.value)}
                  >
                    <option value="">Select machine or line…</option>
                    {MACHINES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Shift" htmlFor="shift" required error={errors.shift} className="form-grid--single">
                  <select
                    className="select"
                    id="shift"
                    value={values.shift}
                    onChange={(event) => setValue('shift', event.target.value)}
                  >
                    <option value="">Select shift…</option>
                    {SHIFTS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
            )}

            {step === 2 && (
              <div className="stack" style={{ gap: 20 }}>
                <div className="form-grid">
                  <Field
                    label={isInspection ? 'Inspection Category' : 'Observation Category'}
                    htmlFor="category"
                    required
                    error={errors.category}
                  >
                    <select
                      className="select"
                      id="category"
                      value={values.category}
                      onChange={(event) => setValue('category', event.target.value)}
                    >
                      <option value="">Select category…</option>
                      {categories.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}{option.hint ? ` — ${option.hint}` : ''}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Priority" htmlFor="severity" required>
                    <select
                      className="select"
                      id="severity"
                      value={values.severity}
                      onChange={(event) => setValue('severity', event.target.value as FormValues['severity'])}
                    >
                      {SEVERITY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </Field>

                  {isInspection && (
                    <>
                      <Field label="Lot / Batch Number" htmlFor="lotNumber" required error={errors.lotNumber}>
                        <input
                          className="input"
                          id="lotNumber"
                          placeholder="e.g. A-9204"
                          value={values.lotNumber}
                          onChange={(event) => setValue('lotNumber', event.target.value)}
                        />
                      </Field>
                      <Field label="Defect Type" htmlFor="notes">
                        <select
                          className="select"
                          id="notes"
                          value={values.notes}
                          onChange={(event) => setValue('notes', event.target.value)}
                        >
                          <option value="">Select defect type…</option>
                          {DEFECT_TYPES.map((option) => (
                            <option key={option.value} value={option.label}>{option.label}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Units Inspected" htmlFor="inspectedQuantity" required error={errors.inspectedQuantity}>
                        <input
                          className="input"
                          id="inspectedQuantity"
                          type="number"
                          min="1"
                          placeholder="e.g. 200"
                          value={values.inspectedQuantity}
                          onChange={(event) => setValue('inspectedQuantity', event.target.value)}
                        />
                      </Field>
                      <Field label="Defective Units" htmlFor="defectQuantity" required error={errors.defectQuantity}>
                        <input
                          className="input"
                          id="defectQuantity"
                          type="number"
                          min="0"
                          placeholder="e.g. 0"
                          value={values.defectQuantity}
                          onChange={(event) => setValue('defectQuantity', event.target.value)}
                        />
                      </Field>
                      <Field label="Verdict" htmlFor="verdict">
                        <select
                          className="select"
                          id="verdict"
                          value={values.verdict}
                          onChange={(event) => setValue('verdict', event.target.value as FormValues['verdict'])}
                        >
                          <option value="pass">Pass — release batch</option>
                          <option value="hold">Hold — further review</option>
                          <option value="reject">Reject — do not dispatch</option>
                        </select>
                      </Field>
                    </>
                  )}
                </div>

                <Field
                  label={isInspection ? 'Inspection Findings' : 'Description'}
                  htmlFor="description"
                  required
                  error={errors.description}
                  hint="Describe what you observed, when it started and any immediate action taken."
                >
                  <textarea
                    className="textarea"
                    id="description"
                    placeholder={
                      isInspection
                        ? 'Describe the inspection method, measurements and any non-conformances found…'
                        : 'Describe the machine behaviour, the risk or the observation in detail…'
                    }
                    value={values.description}
                    onChange={(event) => setValue('description', event.target.value)}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <FileUploader value={evidence} onChange={setEvidence} onNotify={toast.notify} />
            )}

            {step === 4 && (
              <div className="review-grid">
                <div className="review-list">
                  <div className="review-item">
                    <span className="review-item__icon"><HardHat size={23} /></span>
                    <div className="review-item__body">
                      <h3>Machine Context</h3>
                      <p>
                        {labelFor(MACHINES, values.machine)} · {labelFor(SHIFTS, values.shift).split(' — ')[0]}
                        <br />
                        <span className="subtle">{labelFor(PLANTS, values.plant)}</span>
                      </p>
                    </div>
                    <button className="review-item__edit" type="button" onClick={() => goTo(1)}>Edit</button>
                  </div>

                  <div className="review-item">
                    <span className="review-item__icon review-item__icon--purple">
                      <ClipboardList size={22} />
                    </span>
                    <div className="review-item__body">
                      <h3>{isInspection ? 'Inspection Details' : 'Observation'}</h3>
                      <p>{labelFor(categories, values.category)} · {values.severity.toUpperCase()}</p>
                      <p style={{ marginTop: 4 }}>{values.description}</p>
                    </div>
                    <button className="review-item__edit" type="button" onClick={() => goTo(2)}>Edit</button>
                  </div>

                  {isInspection && (
                    <div className="review-item">
                      <span className="review-item__icon review-item__icon--info">
                        <FileCheck2 size={22} />
                      </span>
                      <div className="review-item__body">
                        <h3>Inspection Data</h3>
                        <p>
                          Lot {values.lotNumber} · {values.inspectedQuantity} inspected ·{' '}
                          {values.defectQuantity} defects · {values.verdict.toUpperCase()}
                          {values.notes ? ` · ${values.notes}` : ''}
                        </p>
                      </div>
                      <button className="review-item__edit" type="button" onClick={() => goTo(2)}>Edit</button>
                    </div>
                  )}

                  <div className="review-item">
                    <span className="review-item__icon review-item__icon--green">
                      <Paperclip size={22} />
                    </span>
                    <div className="review-item__body">
                      <h3>Evidence</h3>
                      <p>
                        {evidence.length === 0
                          ? 'No files attached.'
                          : `${evidence.length} file${evidence.length > 1 ? 's' : ''} attached: ${evidence.map((item) => item.name).join(', ')}`}
                      </p>
                    </div>
                    <button className="review-item__edit" type="button" onClick={() => goTo(3)}>Edit</button>
                  </div>
                </div>

                <aside className="review-status">
                  <h2>Status</h2>
                  <div className="ready-badge">
                    <span className="live-dot" /> Ready to Submit
                  </div>
                  <div className="summary-list">
                    {summaryRows.map(([label, value]) => (
                      <div className="summary-list__row" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            )}

            {step === 5 && (
              <div className="stack" style={{ gap: 20 }}>
                <div className="storage-note" style={{ borderColor: 'rgba(37,216,121,.35)', color: 'var(--success)' }}>
                  <ShieldCheck size={17} />
                  <span>
                    All checks complete. Submitting will generate a unique reference and save the record
                    to this browser's local demo storage.
                  </span>
                </div>

                <div className="summary-list" style={{ marginTop: 0 }}>
                  {summaryRows.map(([label, value]) => (
                    <div className="summary-list__row" key={label}>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>

                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(event) => setConfirmed(event.target.checked)}
                  />
                  <span>
                    I confirm that the information above is accurate and I am authorised to submit
                    this {entityLabel} on behalf of {user.name}.
                  </span>
                </label>
              </div>
            )}
          </div>

          <div className="wizard-card__foot">
            <Button variant="secondary" icon={<ArrowLeft size={16} />} onClick={handleBack} type="button">
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <span className="wizard-card__foot-note">
              STEP {step} OF {STEPS.length} · DRAFT SAVED LOCALLY
            </span>
            {step < 5 ? (
              <Button iconAfter={<ArrowRight size={16} />} onClick={handleNext} type="button">
                Next
              </Button>
            ) : (
              <Button type="submit" loading={submitting} icon={submitting ? undefined : <Send size={16} />}>
                {submitting ? 'Submitting…' : `Submit ${isInspection ? 'Inspection' : 'Observation'}`}
              </Button>
            )}
          </div>
        </div>

        {step === 4 && (
          <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
            <button className="link-btn" type="button" onClick={() => goTo(5)}>
              <CheckCircle2 size={15} style={{ display: 'inline', verticalAlign: '-3px', marginRight: 5 }} />
              Continue to final submission
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
