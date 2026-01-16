/**
 * Reusable modal dialog component using native <dialog> API.
 * Supports success, error, and info types with theme-aware styling.
 */

export class Dialog {
  constructor() {
    this.activeDialog = null;
  }

  /**
   * Show a modal dialog.
   * @param {string} title - Dialog title
   * @param {string} message - Dialog message
   * @param {'success'|'error'|'info'} type - Dialog type for styling
   * @param {string} [okText='OK'] - Text for the OK button
   */
  show(title, message, type = 'info', okText = 'OK') {
    // Close any existing dialog first
    if (this.activeDialog) {
      this.activeDialog.close();
    }

    const dialog = document.createElement('dialog');
    dialog.className = `dialog dialog--${type}`;
    dialog.setAttribute('aria-labelledby', 'dialog-title');
    dialog.setAttribute('aria-describedby', 'dialog-message');

    // Create icon based on type
    const getIcon = (type) => {
      switch (type) {
        case 'success':
          return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="dialog__icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
          </svg>`;
        case 'error':
          return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true" class="dialog__icon">
            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M256 80c-8.66 0-16.58 7.36-16 16l8 216a8 8 0 0 0 8 8h0a8 8 0 0 0 8-8l8-216c.58-8.64-7.34-16-16-16"></path>
            <circle cx="256" cy="416" r="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></circle>
          </svg>`;
        default:
          return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true" class="dialog__icon">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>`;
      }
    };

    // Build dialog structure
    const form = document.createElement('form');
    form.method = 'dialog';
    form.className = 'dialog__form';

    const header = document.createElement('header');
    header.className = 'dialog__header';

    const iconContainer = document.createElement('div');
    iconContainer.className = 'dialog__icon-container';
    iconContainer.innerHTML = getIcon(type);

    const titleEl = document.createElement('h2');
    titleEl.id = 'dialog-title';
    titleEl.className = 'dialog__title';
    titleEl.textContent = title;

    header.appendChild(iconContainer);
    header.appendChild(titleEl);

    const main = document.createElement('main');
    main.className = 'dialog__main';

    const messageEl = document.createElement('p');
    messageEl.id = 'dialog-message';
    messageEl.className = 'dialog__message';
    messageEl.textContent = message;

    main.appendChild(messageEl);

    const footer = document.createElement('footer');
    footer.className = 'dialog__footer';

    const menu = document.createElement('menu');
    menu.className = 'dialog__menu';

    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'btn btn--primary dialog__btn';
    button.textContent = okText;

    menu.appendChild(button);
    footer.appendChild(menu);

    form.appendChild(header);
    form.appendChild(main);
    form.appendChild(footer);
    dialog.appendChild(form);

    // Handle cleanup when dialog closes (from any method)
    dialog.addEventListener('close', () => {
      if (dialog.parentNode) {
        dialog.parentNode.removeChild(dialog);
      }
      if (this.activeDialog === dialog) {
        this.activeDialog = null;
      }
    });

    // Append to body and show
    document.body.appendChild(dialog);
    this.activeDialog = dialog;
    dialog.showModal();

    return dialog;
  }

  /**
   * Close the active dialog if one exists
   */
  close() {
    if (this.activeDialog) {
      this.activeDialog.close(); // This triggers the 'close' event which handles cleanup
    }
  }

  /**
   * Show a success dialog
   */
  success(title, message, okText = 'OK') {
    return this.show(title, message, 'success', okText);
  }

  /**
   * Show an error dialog
   */
  error(title, message, okText = 'OK') {
    return this.show(title, message, 'error', okText);
  }

  /**
   * Show an info dialog
   */
  info(title, message, okText = 'OK') {
    return this.show(title, message, 'info', okText);
  }
}

// Export a singleton instance
export const dialog = new Dialog();