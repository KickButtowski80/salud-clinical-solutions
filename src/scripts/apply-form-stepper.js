import { createApplyFormValidator } from './apply-form-validation.js';
import {
  focusFirstInteractiveStep,
  createProgressUpdater,
  createStatusUpdater,
  createButtonUpdater,
  createSubmitHandler
} from './apply-form-stepper-helpers.js';

export function initApplyFormStepper() {
  const forms = Array.from(document.querySelectorAll('form[data-component="ApplyFormCard"]'));

  forms.forEach((form) => {
    const steps = Array.from(form.querySelectorAll('.apply-step'));
    if (!steps.length) return;

    const prevBtn = form.querySelector('[data-stepper-prev]');
    const nextBtn = form.querySelector('[data-stepper-next]');
    const progress = form.querySelector('[data-stepper-progress]');
    const status = form.querySelector('[data-stepper-status]');
    const submitBtn = form.querySelector('button.apply-submit');

    if (!(prevBtn instanceof HTMLButtonElement) || !(nextBtn instanceof HTMLButtonElement)) return;

    let activeIndex = 0;


    const validator = createApplyFormValidator(form);
    
    // Create helper functions
    const updateProgress = createProgressUpdater(progress);
    const updateStatus = createStatusUpdater(status);
    const updateButtons = createButtonUpdater(prevBtn, nextBtn, submitBtn, steps.length);

    const setActiveIndex = (nextIndex, { focus = true } = {}) => {
      activeIndex = Math.max(0, Math.min(nextIndex, steps.length - 1));

      // Update validator's current step for event delegation
      validator.setCurrentStep(activeIndex);

      steps.forEach((step, idx) => {
        const isActive = idx === activeIndex;
        step.toggleAttribute('hidden', !isActive);
      });

      // Update UI components
      updateButtons(activeIndex);
      updateProgress(activeIndex, steps.length);
      updateStatus(activeIndex, steps.length);

      if (focus) {
        focusFirstInteractiveStep(steps[activeIndex]);
      }
    };

    const handleSubmit = createSubmitHandler(form, submitBtn, setActiveIndex);

    form.classList.add('is-stepper');

    prevBtn.addEventListener('click', () => setActiveIndex(activeIndex - 1));

    nextBtn.addEventListener('pointerdown', () => {
      validator.beginNavigation();
    });

    nextBtn.addEventListener('pointerup', () => {
      validator.endNavigation();
    });

    nextBtn.addEventListener('click', () => {
      validator.beginNavigation();
      const stepValid = validator.validateStep(activeIndex, { focus: false });
      if (!stepValid) {
        setTimeout(() => validator.endNavigation(), 0);
        return;
      }
      setActiveIndex(activeIndex + 1);

      // End the navigation suppression after focus/blur settles.
      setTimeout(() => validator.endNavigation(), 0);
    });

    form.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      if (e.shiftKey) return;

      const target = e.target;
      if (!(target instanceof HTMLElement)) return;

      const step = target.closest('fieldset[data-step]');
      const stepIndex = step ? Array.from(steps).indexOf(step) : -1;

      if (stepIndex === activeIndex) {
        e.preventDefault();
        validator.beginNavigation();
        const stepValid = validator.validateStep(activeIndex, { focus: false });
        if (!stepValid) {
          setTimeout(() => validator.endNavigation(), 0);
          return;
        }
        setActiveIndex(activeIndex + 1);

        // End the navigation suppression after focus/blur settles.
        setTimeout(() => validator.endNavigation(), 0);
      }
    });

    if (submitBtn instanceof HTMLButtonElement) {
      submitBtn.addEventListener('pointerdown', () => {
        validator.beginNavigation();
      });

      submitBtn.addEventListener('pointerup', () => {
        validator.endNavigation();
      });
    }

    form.addEventListener('submit', (event) => {
      validator.beginNavigation();
      Promise.resolve(handleSubmit(event, validator, steps))
      .finally(() => {
        setTimeout(() => validator.endNavigation(), 0);
      });
    });

    // Do not auto-focus on initial load; it can scroll the page to the contact section.
    setActiveIndex(0, { focus: false });
  });
}
