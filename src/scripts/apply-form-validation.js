export function createApplyFormValidator(form) {
  const steps = Array.from(form.querySelectorAll('.apply-step'));
  const fields = Array.from(
    form.querySelectorAll('input, select, textarea')
  );

  const textLikeTypes = new Set(['text', 'email', 'tel', 'url', 'search', 'password']);

  const sanitizeFieldValue = (field) => {
    if (field instanceof HTMLInputElement && textLikeTypes.has(field.type)) {
      const trimmed = field.value.trim();
      if (trimmed !== field.value) {
        field.value = trimmed;
      }
    } else if (field instanceof HTMLTextAreaElement) {
      const trimmed = field.value.trim();
      if (trimmed !== field.value) {
        field.value = trimmed;
      }
    }
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
      'role': 'Please select your role'
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
    if (!shouldValidateField(field)) {
      clearFieldError(field);
      return true;
    }

    const isValid = field.checkValidity();
    if (isValid) {
      clearFieldError(field);
      return true;
    }

    showFieldError(field, field.validationMessage || 'Please complete this field.');
    return false;
  };

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      if (field.checkValidity()) {
        clearFieldError(field);
      }
    });

    if (
      field instanceof HTMLSelectElement ||
      (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio'))
    ) {
      field.addEventListener('change', () => {
        validateField(field);
      });
    }

    field.addEventListener('blur', () => {
      validateField(field);
    });


  });

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
    const step = steps[stepIndex];
    if (!step) return true;

    const stepFields = Array.from(
      step.querySelectorAll('input, select, textarea, input[type="hidden"]')
    );

    let firstInvalidField = null;
    let isStepValid = true;
    stepFields.forEach((field) => {
      const validField = validateField(field);
      if (!validField) {
        isStepValid = false;
        if (!firstInvalidField) {
          firstInvalidField = field;
        }
      }
    });

    if (!isStepValid && focus && firstInvalidField instanceof HTMLElement) {
      firstInvalidField.focus();
    }

    return isStepValid;
  };

  return {
    validateStep,
  };
}
