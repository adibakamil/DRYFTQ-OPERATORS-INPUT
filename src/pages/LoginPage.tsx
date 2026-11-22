import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { Field } from '../components/Field';
import { Modal } from '../components/Modal';
import { SiteFooter } from '../components/SiteFooter';
import { SiteHeader } from '../components/SiteHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DEMO_ACCOUNTS, validateCredentials, type ValidationErrors } from '../services/auth';
import { readJson, removeKey, STORAGE_KEYS, writeJson } from '../services/storage';

export function LoginPage() {
  const { user, signIn } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [employeeId, setEmployeeId] = useState(
    () => readJson<string>(STORAGE_KEYS.rememberedId, ''),
  );
  const [password, setPassword] = useState('');
  const [rememberId, setRememberId] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetId, setResetId] = useState('');
  const [resetSent, setResetSent] = useState(false);

  if (user?.roleConfirmed) {
    return <Navigate to={user.role === 'quality-inspector' ? '/app/quality' : '/app/operator'} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateCredentials({ employeeId, password });
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Check your credentials', 'Please correct the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const session = await signIn({ employeeId, password });
      if (rememberId) writeJson(STORAGE_KEYS.rememberedId, session.employeeId);
      else removeKey(STORAGE_KEYS.rememberedId);
      toast.success(`Welcome, ${session.name.split(' ')[0]}`, 'Select your role to continue.');
      navigate('/role', { replace: true });
    } catch {
      toast.error('Sign in failed', 'Unable to start your session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (index: number) => {
    setEmployeeId(DEMO_ACCOUNTS[index].employeeId);
    setPassword(DEMO_ACCOUNTS[index].password);
    setErrors({});
    toast.info('Demo credentials filled', 'Press Login to continue.');
  };

  return (
    <div className="website-page">
      <SiteHeader minimal />
      <main className="website-main">
      <div className="login-page">
      <section className="login-visual" aria-hidden="true">
        <div className="login-visual__content">
          <motion.div
            className="visual-tag"
            initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="live-dot" /> Plant North Sector • Operational
          </motion.div>
          <div className="visual-copy">
            <motion.h2
              initial={{ opacity: 0, y: reduceMotion ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              Operational awareness, recorded in real time.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              A single reporting channel for machine observations, safety risks and production
              quality — built for the plant floor.
            </motion.p>
            <div className="visual-metrics">
              {[
                { value: '24/7', label: 'Plant coverage' },
                { value: '3', label: 'Active plants' },
                { value: '99.2%', label: 'Link uptime' },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: reduceMotion ? 0 : 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.45 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <motion.form
          className="login-form"
          onSubmit={handleSubmit}
          noValidate
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="row" style={{ justifyContent: 'center' }}>
            <BrandLogo size="large" />
          </div>

          <div className="login-form__intro">
            <h2>Sign in to continue</h2>
            <p>Use your employee credentials to access DRYFTQ Collect.</p>
          </div>

          <Field label="Employee ID" htmlFor="employee-id" error={errors.employeeId}>
            <div className="input-affix">
              <UserRound size={18} />
              <input
                className="input"
                id="employee-id"
                name="employeeId"
                type="text"
                autoComplete="username"
                placeholder="e.g. OP-1001"
                value={employeeId}
                onChange={(event) => {
                  setEmployeeId(event.target.value);
                  setErrors((current) => ({ ...current, employeeId: undefined }));
                }}
              />
            </div>
          </Field>

          <Field label="Password" htmlFor="password" error={errors.password}>
            <div className="input-affix">
              <LockKeyhole size={18} />
              <input
                className="input"
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrors((current) => ({ ...current, password: undefined }));
                }}
              />
              <button
                className="input-affix__action"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          <div className="login-form__meta">
            <label>
              <input
                type="checkbox"
                checked={rememberId}
                onChange={(event) => setRememberId(event.target.checked)}
              />{' '}
              Remember my employee ID
            </label>
            <button className="link-btn" type="button" onClick={() => setForgotOpen(true)}>
              Forgot Password?
            </button>
          </div>

          <Button type="submit" size="lg" block loading={submitting} iconAfter={<ArrowRight size={18} />}>
            {submitting ? 'Authenticating…' : 'Login'}
          </Button>

          <div className="demo-hint">
            <div className="demo-hint__title">Demo accounts — click to autofill</div>
            {DEMO_ACCOUNTS.map((account, index) => (
              <div className="demo-account-row" key={account.employeeId}>
                <code>
                  {account.employeeId} / {account.password}
                </code>
                <button className="link-btn" type="button" onClick={() => fillDemo(index)}>
                  Use
                </button>
              </div>
            ))}
          </div>
        </motion.form>

        <div className="version-tag">
          <ShieldCheck size={13} /> v2.4.1-COLLECT · LOCAL DEMO
        </div>
      </section>

      <Modal
        open={forgotOpen}
        onClose={() => {
          setForgotOpen(false);
          setResetSent(false);
        }}
        title="Reset your password"
        description={
          resetSent
            ? undefined
            : 'Enter your employee ID. In a connected deployment, a secure reset link would be sent to your registered address.'
        }
        actions={
          resetSent ? (
            <Button onClick={() => { setForgotOpen(false); setResetSent(false); }}>Done</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setForgotOpen(false)}>
                Cancel
              </Button>
              <Button
                icon={<KeyRound size={16} />}
                onClick={() => {
                  if (!/^[A-Za-z0-9-]{4,20}$/.test(resetId.trim())) {
                    toast.error('Invalid employee ID', 'Use 4–20 letters, numbers or hyphens.');
                    return;
                  }
                  setResetSent(true);
                  toast.info('Reset request recorded', 'Demo mode: no email is actually sent.');
                }}
              >
                Send instructions
              </Button>
            </>
          )
        }
      >
        {resetSent ? (
          <div className="storage-note" style={{ color: 'var(--success)', borderColor: 'rgba(37,216,121,.35)' }}>
            <ShieldCheck size={16} />
            <span>
              Reset request accepted for <strong>{resetId.toUpperCase()}</strong>. This demo build does not
              send email — contact your plant administrator in a live deployment.
            </span>
          </div>
        ) : (
          <Field label="Employee ID" htmlFor="reset-id">
            <input
              className="input"
              id="reset-id"
              placeholder="e.g. OP-1001"
              value={resetId}
              onChange={(event) => setResetId(event.target.value)}
            />
          </Field>
        )}
      </Modal>
      </div>
      </main>
      <SiteFooter />
    </div>
  );
}
