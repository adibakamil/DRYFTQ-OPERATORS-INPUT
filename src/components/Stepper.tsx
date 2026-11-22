import { Check } from 'lucide-react';

interface StepperProps {
  steps: string[];
  current: number;
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <nav className="stepper" aria-label="Submission progress">
      {steps.map((label, index) => {
        const number = index + 1;
        const state = number < current ? 'done' : number === current ? 'active' : 'upcoming';
        return (
          <div
            className={`step step--${state}`}
            key={label}
            aria-current={state === 'active' ? 'step' : undefined}
          >
            <div className="step__circle">
              {state === 'done' ? <Check size={15} strokeWidth={3} /> : number}
            </div>
            <span className="step__label">{label}</span>
            {index < steps.length - 1 && <span className="step__line" aria-hidden="true" />}
          </div>
        );
      })}
    </nav>
  );
}
