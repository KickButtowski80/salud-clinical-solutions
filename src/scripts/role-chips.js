export function initRoleChips() {
  const components = document.querySelectorAll('[data-component="RoleChips"]');
  if (!components.length) return;

  components.forEach((root) => {
    const targetInputSelector = root.getAttribute('data-target-input');
    const targetMicrocopySelector = root.getAttribute('data-target-microcopy');
    const selectedClass = root.getAttribute('data-selected-class') || 'is-selected';

    const input = targetInputSelector ? document.querySelector(targetInputSelector) : null;
    const microcopy = targetMicrocopySelector ? document.querySelector(targetMicrocopySelector) : null;

    const roleSelect = root.querySelector('select[data-role-select]');

    const chipsContainer = root.querySelector('[data-role-chips]');
    const buttons = chipsContainer
      ? Array.from(chipsContainer.querySelectorAll('button[data-role]'))
      : [];

    const availableRoles = new Set([
      ...buttons.map((btn) => btn.getAttribute('data-role') || ''),
      ...(roleSelect instanceof HTMLSelectElement
        ? Array.from(roleSelect.options).map((opt) => opt.value || '')
        : []),
    ].filter(Boolean));

    const defaultMicrocopyText = microcopy ? microcopy.textContent || '' : '';

    const setSelectedRole = (role) => {
      buttons.forEach((btn) => {
        const isSelected = btn.getAttribute('data-role') === role;
        btn.classList.toggle(selectedClass, isSelected);
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      });

      if (input) input.value = role;

      if (roleSelect instanceof HTMLSelectElement) {
        if (role && roleSelect.value !== role) roleSelect.value = role;
      }

      if (microcopy) {
        microcopy.textContent = role
          ? `Great — we’ll prioritize matches for ${role} that fit your license and location.`
          : defaultMicrocopyText;
      }
    };

    const defaultRoleProp = root.getAttribute('data-default-role') || '';
    const firstRole =
      (buttons[0] && (buttons[0].getAttribute('data-role') || '')) ||
      (roleSelect instanceof HTMLSelectElement ? roleSelect.value || '' : '') ||
      '';

    let initialRole = input && input.value ? input.value : '';
    if (!initialRole) initialRole = defaultRoleProp || firstRole;
    if (initialRole && !availableRoles.has(initialRole)) initialRole = firstRole;

    if (initialRole) setSelectedRole(initialRole);

    if (roleSelect instanceof HTMLSelectElement) {
      roleSelect.addEventListener('change', () => {
        const role = roleSelect.value || '';
        if (!role) return;
        setSelectedRole(role);
      });
    }

    if (chipsContainer) {
      chipsContainer.addEventListener('click', (e) => {
        const btn = e.target instanceof Element ? e.target.closest('button[data-role]') : null;
        if (!btn) return;

        const role = btn.getAttribute('data-role') || '';
        if (!role) return;

        // single + locked: clicking the selected chip keeps it selected.
        setSelectedRole(role);
      });
    }
  });
}
