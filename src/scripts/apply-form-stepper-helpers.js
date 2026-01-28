/**
 * Helper functions for form stepper functionality
 */

export function focusFirstInteractiveStep(step) {
  if (!step) return;
  const candidate = step.querySelector('input, select, textarea, button');
  if (candidate instanceof HTMLElement) {
    candidate.focus();
  }
}

export function createProgressUpdater(progressEl) {
  return (activeIndex, totalSteps) => {
    if (!(progressEl instanceof HTMLElement)) return;
    
    const pct = ((activeIndex + 1) / totalSteps) * 100;
    progressEl.style.setProperty('--progress', `${pct}%`);
  };
}

export function createStatusUpdater(statusEl) {
  return (activeIndex, totalSteps) => {
    if (!(statusEl instanceof HTMLElement)) return;
    
    statusEl.textContent = `Step ${activeIndex + 1} of ${totalSteps}`;
  };
}

export function createButtonUpdater(prevBtn, nextBtn, submitBtn, totalSteps) {
 
  return (activeIndex) => {
    // Update prev button
    prevBtn.hidden = activeIndex === 0;
    
    // Update next button
    nextBtn.hidden = activeIndex === totalSteps - 1;
    
    // Update submit button
    if (submitBtn) {
      if (activeIndex === totalSteps - 1) {
        submitBtn.removeAttribute('hidden');
        submitBtn.removeAttribute('aria-hidden');
      } else {
        submitBtn.setAttribute('hidden', '');
        submitBtn.setAttribute('aria-hidden', 'true');
      }
    }
  };
}

import { dialog } from '../components/Dialog.js';

export function createSubmitHandler(form, submitBtn, setActiveIndex) {
  let failedAttempts = 0;
  const MAX_ATTEMPTS = 3;
  
  return async (event, validator, steps) => {
    event.preventDefault();

    // Validate all steps before submit (prevents skipping required fields)
    for (let stepIndex = 0; stepIndex < steps.length; stepIndex += 1) {
      const stepValid = validator.validateStep(stepIndex, { focus: false });
      if (!stepValid) {
        if (typeof setActiveIndex === 'function') {
          setActiveIndex(stepIndex, { focus: false });
        }
        return;
      }
    }

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Update button state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      const response = await fetch(`/api/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const responseText = await response.text();
      let result = null;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        result = null;
      }

      if (!response.ok) {
        failedAttempts++;
        const baseError = result?.error || responseText || `Status ${response.status}`;
        const errorMessage = 
          failedAttempts >= MAX_ATTEMPTS
            ? `⚠️ Attempt ${failedAttempts}/${MAX_ATTEMPTS}\n\n${baseError}\n\nPlease contact info@saludclinical.com for help`
            : `⚠️ Attempt ${failedAttempts}/${MAX_ATTEMPTS}\n\n${baseError}`;

        dialog.error('Submission Failed', errorMessage);
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
        }, 2000);
        return;
      }

      if (result && result.success) {
        dialog.success('Application Sent', 'Application sent! We’ll follow up soon.');
        
        // Show success state briefly before reset
        submitBtn.textContent = 'Application Sent! ✅';
        setTimeout(() => {
          form.reset();
          if (typeof setActiveIndex === 'function') {
            setActiveIndex(0, { focus: false });
          }
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
        }, 2000);
      } else {
        failedAttempts++;
        const baseError = (result && result.error) || 'Unknown error';
        const errorMessage = 
          failedAttempts >= MAX_ATTEMPTS
            ? `⚠️ Attempt ${failedAttempts}/${MAX_ATTEMPTS}\n\n${baseError}\n\nPlease contact support@example.com for help`
            : `⚠️ Attempt ${failedAttempts}/${MAX_ATTEMPTS}\n\n${baseError}`;

        dialog.error('Submission Failed', errorMessage);
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
        }, 2000);
      }
      return;
    } catch (error) {
      console.error('❌ Network error:', error);
      failedAttempts++;
      const errorMessage = 
        failedAttempts >= MAX_ATTEMPTS
          ? `⚠️ Attempt ${failedAttempts}/${MAX_ATTEMPTS}\n\nNetwork error. Please check your connection.\n\nPlease contact support@example.com for help`
          : `⚠️ Attempt ${failedAttempts}/${MAX_ATTEMPTS}\n\nNetwork error. Please try again.`;
      
      dialog.error('Network Error', errorMessage);
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }, 2000);
    }
  };
}
