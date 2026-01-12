export function createApplyFormValidator(form) {
  const steps = Array.from(form.querySelectorAll('fieldset[data-step]'));
  let isNextClick = false; // Flag to track Next button clicks
  let currentStepIndex = 0; // Track current step for delegation

  const textLikeTypes = new Set(['text', 'email', 'tel', 'url', 'search', 'password']);

  const sanitizeFieldValue = (field) => {
    const isTrimmableInput = field instanceof HTMLInputElement && textLikeTypes.has(field.type);
    const isTrimmableTextarea = field instanceof HTMLTextAreaElement;
    if (!isTrimmableInput && !isTrimmableTextarea) return;

    const trimmed = field.value.trim();
    if (trimmed !== field.value) {
      field.value = trimmed;
    }
  };

  const getMaxLength = (field) => {
    if (!field.hasAttribute('maxlength')) return null;
    const parsed = parseInt(field.getAttribute('maxlength'), 10);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const getErrorElement = (field) => {
    const errorId = field.getAttribute('aria-describedby');
    if (!errorId) return null;
    try {
      return form.querySelector(`#${CSS.escape(errorId)}`);
    } catch {
      return document.getElementById(errorId);
    }
  };

  const clearFieldError = (field) => {
    const errorEl = getErrorElement(field);
    if (errorEl) {
      errorEl.textContent = '';
    }
    field.removeAttribute('aria-invalid');
  };

  const showFieldError = (field, message) => {
    const errorEl = getErrorElement(field);
    if (errorEl) {
      // Use custom messages based on field name/id
      const customMessage = getCustomErrorMessage(field);
      errorEl.textContent = customMessage || message;
    }
    field.setAttribute('aria-invalid', 'true');
  };

  const getCustomErrorMessage = (field) => {
    const fieldName = field.name || field.id || '';

    // Custom messages for specific fields
    const messages = {
      'name': 'Please enter your full name',
      'email': 'Please enter a valid email address',
      'phone': 'Please enter your phone number',
      'licenseType': 'Please select your profession',
      'licenseState': 'Please choose your licensed state',
    };

    return messages[fieldName] || null;
  };

  const shouldValidateField = (field) => {
    // Don't validate disabled fields
    if (field.disabled) return false;

    // Always validate required fields
    if (field.hasAttribute('required')) return true;

    // For hidden fields, only validate if they have a value (like role selection)
    if (field.type === 'hidden') {
      return Boolean(field.value);
    }

    const value = typeof field.value === 'string' ? field.value.trim() : field.value;

    if (field instanceof HTMLSelectElement) {
      const firstOptionValue = field.options.length ? field.options[0].value : '';
      return value !== '' && value !== firstOptionValue;
    }

    if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
      return field.checked;
    }

    return Boolean(value);
  };

  const validateField = (field) => {
    sanitizeFieldValue(field);
    const maxLen = getMaxLength(field);

    // For optional fields with maxlength:
    // - Empty is fine
    // - At/over the limit: show a message (warning/error)
    const isOptional = !field.hasAttribute('required');
    if (isOptional && maxLen !== null) {
      const len = field.value.length;
      if (len > maxLen) {
        showFieldError(field, `Please enter no more than ${maxLen} characters.`);
        return false;
      }

      if (len >= maxLen && len !== 0) {
        const errorEl = getErrorElement(field);
        if (errorEl) {
          errorEl.textContent = `You’ve reached the ${maxLen}-character limit.`;
        }
        field.removeAttribute('aria-invalid');
        return true;
      }

      clearFieldError(field);
      return true;
    }

    if (!shouldValidateField(field)) {
      clearFieldError(field);
      return true;
    }

    const isValid = field.checkValidity();
    if (isValid) {
      clearFieldError(field);
      return true;
    }

    const message = field.validationMessage || 'Please complete this field.';
    showFieldError(field, message);
    return false;
  };

  // Event delegation: single listener handles all field events
  // This is like putting one helper on the whole form instead of many helpers on each field
  form.addEventListener('input', (event) => {
    const field = event.target;  // Which field did the user type in?
    const step = field.closest('fieldset[data-step]');  // Which step is this field in?
    const activeStep = steps[currentStepIndex];  // Which step is currently visible?
    
    // Only validate if field is in current step (don't validate hidden fields)
    if (!step || !activeStep || step !== activeStep) return;
    
    // For optional fields with maxlength, show live limit feedback
    const isOptional = !field.hasAttribute('required');
    console.log('field validation', field.name);
    if (isOptional && getMaxLength(field) !== null) {
      validateField(field);
    } else {
      // For other fields, clear error if now valid
      if (field.checkValidity()) {
        console.log('Field is valid:', field.name);
        clearFieldError(field);
      }
    }
  });

  form.addEventListener('change', (event) => {
    const field = event.target;  // Which field did the user change?
    const step = field.closest('fieldset[data-step]');  // Which step is this field in?
    const activeStep = steps[currentStepIndex];  // Which step is currently visible?
    
    // Only validate if field is in current step and is select/checkbox/radio
    if (!step || !activeStep || step !== activeStep) return;
    if (
      field instanceof HTMLSelectElement ||
      (field instanceof HTMLInputElement &&
        (field.type === 'checkbox' || field.type === 'radio'))
    ) {
      validateField(field);
    }
  });

  form.addEventListener('blur', (event) => {
    const field = event.target;  // Which field did the user leave?
    const step = field.closest('fieldset[data-step]');  // Which step is this field in?
    const activeStep = steps[currentStepIndex];  // Which step is currently visible?
    
    // Only validate if field is in current step
    if (!step || !activeStep || step !== activeStep) return;
    if (!isNextClick) {
      validateField(field);
    }
  }, true); // Use capture to ensure we get the blur event

  /**
   * Update the current step index for event delegation.
   * Call this when switching between steps.
   */
  const setCurrentStep = (stepIndex) => {
    currentStepIndex = stepIndex;
  };

  /**
   * Validate every field inside a given step.
   *
   * 1. Locate the <fieldset> for the requested step index.
   * 2. Collect all interactive fields inside that step (inputs, selects, textareas).
   * 3. Run validateField on each input, remembering the first one that fails.
   * 4. If any field fails and focus=true, move focus to the offending element so
   *    keyboard and screen reader users land exactly where they need to fix data.
   * 5. Return a boolean so callers (Next button, Enter key handler, submit) can
   *    decide whether to continue or halt.
   */
  const validateStep = (stepIndex, { focus = true } = {}) => {
    isNextClick = true; // Set flag when Next is clicked
    const step = steps[stepIndex];
    if (!step) return true;

    const stepFields = Array.from(step.querySelectorAll('input, select, textarea'));

    let firstInvalidField = null;
    let isStepValid = true;
    for (const field of stepFields) {
      const isFieldValid = validateField(field);
      if (!isFieldValid) {
        isStepValid = false;
        if (!firstInvalidField) firstInvalidField = field;
      }
    }

    if (!isStepValid && focus && firstInvalidField instanceof HTMLElement) {
      firstInvalidField.focus();
    }
    
    // Reset flag after a short delay to allow any pending blur events.
    // Using requestAnimationFrame (~16.67ms at 60Hz) to align with the next display frame.
    // Alternative: setTimeout(..., 100) for a more conservative buffer if rAF proves too tight.
    // requestAnimationFrame(() => {
    //   isNextClick = false;
    // });

    // Alternative approach (commented out):
    setTimeout(() => {
      isNextClick = false;
    }, 100);

    return isStepValid;
  };

  return {
    validateStep,
    setCurrentStep,
  };
}
