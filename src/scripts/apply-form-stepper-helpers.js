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

export function createSubmitHandler(form, submitBtn, setActiveIndex) {
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

    const statusEl = form.querySelector('[data-apply-form-status]');
    const setStatus = (status, message) => {
      if (status) {
        form.dataset.submitStatus = status;
      } else {
        delete form.dataset.submitStatus;
      }

      if (statusEl instanceof HTMLElement) {
        statusEl.textContent = message || '';
      }
    };

    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);

      // Update button state
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      setStatus('pending', 'Submitting your application…');
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
        const errorMessage =
          (result && (result.error || result.message)) ||
          responseText ||
          `Request failed with status ${response.status}`;
        console.error('❌ Email failed:', { status: response.status, errorMessage });

        setStatus('error', errorMessage);

        submitBtn.textContent = 'Submission Failed ❌';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
          setStatus(null, '');
        }, 2000);
        return;
      }

      if (result && result.success) {
        console.log('✅ Email sent:', result.messageId);
        setStatus('success', 'Application sent! We’ll follow up soon.');
        
        // Show success state briefly before reset
        submitBtn.textContent = 'Application Sent! ✅';
        setTimeout(() => {
          form.reset();
          if (typeof setActiveIndex === 'function') {
            setActiveIndex(0, { focus: false });
          }
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
          setStatus(null, '');
        }, 2000);
      } else {
        const errorMessage = (result && result.error) || 'Unknown error';
        console.error('❌ Email failed:', errorMessage);
        setStatus('error', errorMessage);
        
        // Show error state briefly before reset
        submitBtn.textContent = 'Submission Failed ❌';
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Application';
          setStatus(null, '');
        }, 2000);
      }
      return;
    } catch (error) {
      console.error('❌ Network error:', error);
      setStatus('error', 'Network error. Please try again.');
      
      // Show network error state briefly before reset
      submitBtn.textContent = 'Network Error 🌐';
      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Application';
        setStatus(null, '');
      }, 2000);
    }
  };
}
