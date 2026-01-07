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
    prevBtn.disabled = activeIndex === 0;
    
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

export function createSubmitHandler(form, submitBtn) {
  return async (event, validator, steps) => {
    // Submit button only appears on the last step, so we validate the final step
    const lastStepIndex = steps.length - 1;
    const stepValid = validator.validateStep(lastStepIndex);
    if (!stepValid) {
      event.preventDefault();
      return;
    }

    event.preventDefault();

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Update button state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      const response = await fetch('http://localhost:3000/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        console.log('✅ Email sent:', result.messageId);
        // TODO: Show success popover (ticket created)
        
        // Show success state briefly before reset
        submitBtn.textContent = 'Application Sent! ✅';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
        }, 2000);
      } else {
        console.error('❌ Email failed:', result.error);
        // TODO: Show error popover (ticket created)
        
        // Show error state briefly before reset
        submitBtn.textContent = 'Submission Failed ❌';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
        }, 2000);
      }
      return;
    } catch (error) {
      console.error('❌ Network error:', error);
      // TODO: Show error popover (ticket created)
      
      // Show network error state briefly before reset
      submitBtn.textContent = 'Network Error 🌐';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
      }, 2000);
    }
  };
}
