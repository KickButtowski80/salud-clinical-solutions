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

    // Navigate to home page with clean URL
    window.history.pushState({}, '', '/');
    
    // Scroll to top
    document.getElementById("main-content").scrollIntoView({
      behavior: 'smooth',
      block: 'start'  // 'start', 'center', 'end', 'nearest'
    });
    
    // Update navigation active state
    const desktopLinks = document.querySelectorAll('.nav-link');
    desktopLinks.forEach(link => {
      if (link.getAttribute('href') === '/') {
        link.classList.add('nav-link--active');
      } else {
        link.classList.remove('nav-link--active');
      }
    });
    
    const mobileLinks = document.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(link => {
      if (link.getAttribute('href') === '/') {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
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
