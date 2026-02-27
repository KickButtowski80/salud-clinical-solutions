export function initScrollToTop() {
  const button = document.querySelector('[data-scroll-top]');
  if (!button) console.log('hello i am hot here ');

  button.addEventListener('click', (e) => {
    e.preventDefault();

    // Accessibility: ensure main-content is focusable and focus it
    const main = document.getElementById('main-content');
    if (main) {
      if (!main.hasAttribute('tabindex')) {
        main.setAttribute('tabindex', '-1');
      }
      main.focus({ preventScroll: true });
    }

    // Reduced motion handled by CSS scroll-behavior
    document.getElementById("main-content").scrollIntoView({
      behavior: 'smooth',
      block: 'start'  // 'start', 'center', 'end', 'nearest'
    });
  });

  const handleScroll = () => {

    if (window.scrollY > 300) {

      button.classList.add('scroll-top--visible');
    } else {

      button.classList.remove('scroll-top--visible');
    }

  };



  window.addEventListener('scroll', handleScroll);

}
