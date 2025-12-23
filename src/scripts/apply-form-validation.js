export function createApplyFormValidator(form) {
  const steps = Array.from(form.querySelectorAll('.apply-step'));
  const fields = Array.from(
    form.querySelectorAll('input:not([type="hidden"]), select, textarea')
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
    return form.querySelector(`#${errorId}`);
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
      errorEl.textContent = message;
    }
    field.setAttribute('aria-invalid', 'true');
  };

  const shouldValidateField = (field) => {
    if (field.disabled) return false;
    if (field.hasAttribute('required')) return true;
    const value = typeof field.value === 'string' ? field.value.trim() : field.value;
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
      step.querySelectorAll('input:not([type="hidden"]), select, textarea')
    );

    let firstInvalidField = null;
    const isStepValid = stepFields.reduce((acc, field) => {
      const validField = validateField(field);
      if (!validField && !firstInvalidField) {
        firstInvalidField = field;
      }
      return acc && validField;
    }, true);

    if (!isStepValid && focus && firstInvalidField instanceof HTMLElement) {
      firstInvalidField.focus();
    }

    return isStepValid;
  };

  const validateAll = () => {
    let firstInvalidStep = null;

    steps.forEach((_, index) => {
      const stepValid = validateStep(index, { focus: false });
      if (!stepValid && firstInvalidStep === null) {
        firstInvalidStep = index;
      }
    });

    return {
      valid: firstInvalidStep === null,
      firstInvalidStep,
    };
  };

  return {
    validateStep,
    validateAll,
  };
}
