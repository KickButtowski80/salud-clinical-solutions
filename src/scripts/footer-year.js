// ==================== FOOTER YEAR SYSTEM ====================
// Automatically updates copyright year to current year

export function initFooterYear() {
  const yearElement = document.getElementById('current-year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear().toString();
  }
}
