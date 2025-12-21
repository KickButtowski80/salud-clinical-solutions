export function initApplyFormStepper() {
  const forms = Array.from(document.querySelectorAll('form[data-component="ApplyFormCard"]'));

  forms.forEach((form) => {
    const steps = Array.from(form.querySelectorAll('.apply-step'));
    if (!steps.length) return;

    const prevBtn = form.querySelector('[data-stepper-prev]');
    const nextBtn = form.querySelector('[data-stepper-next]');
    const progress = form.querySelector('[data-stepper-progress]');
    const status = form.querySelector('[data-stepper-status]');
    const submit = form.querySelector('button.apply-submit');

    if (!(prevBtn instanceof HTMLButtonElement) || !(nextBtn instanceof HTMLButtonElement)) return;

    let activeIndex = 0;

    const focusFirstField = () => {
      const activeStep = steps[activeIndex];
      if (!activeStep) return;

      const candidate = activeStep.querySelector('input, select, textarea, button');
      if (candidate instanceof HTMLElement) {
        candidate.focus();
      }
    };

    const setActiveIndex = (nextIndex) => {
      activeIndex = Math.max(0, Math.min(nextIndex, steps.length - 1));

      steps.forEach((step, idx) => {
        const isActive = idx === activeIndex;
        step.toggleAttribute('hidden', !isActive);
      });

      prevBtn.disabled = activeIndex === 0;
      nextBtn.hidden = activeIndex === steps.length - 1;

      if (submit) {
        const isFinalStep = activeIndex === steps.length - 1;
        if (isFinalStep) {
          submit.removeAttribute('hidden');
          submit.removeAttribute('aria-hidden');
        } else {
          submit.setAttribute('hidden', '');
          submit.setAttribute('aria-hidden', 'true');
        }
      }

      if (progress instanceof HTMLElement) {
        const pct = ((activeIndex + 1) / steps.length) * 100;
        progress.style.setProperty('--progress', `${pct}%`);
      }

      if (status instanceof HTMLElement) {
        status.textContent = `Step ${activeIndex + 1} of ${steps.length}`;
      }

      focusFirstField();
    };

    form.classList.add('is-stepper');

    prevBtn.addEventListener('click', () => setActiveIndex(activeIndex - 1));
    nextBtn.addEventListener('click', () => setActiveIndex(activeIndex + 1));

    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.shiftKey) return;

      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const tag = target.tagName;
      if (tag === 'TEXTAREA') return;

      if (activeIndex < steps.length - 1) {
        e.preventDefault();
        setActiveIndex(activeIndex + 1);
      }
    });

    setActiveIndex(0);
  });
}
