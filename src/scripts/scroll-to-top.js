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
    console.log('Scroll position:', window.scrollY);
    if (window.scrollY > 300) {
      console.log('Adding scroll-top--visible class');
      button.classList.add('scroll-top--visible');
    } else {
      console.log('Removing scroll-top--visible class');
      button.classList.remove('scroll-top--visible');
    }
    console.log('Button classes:', button.className);
  };

  
    console.log('DOMContentLoaded event triggered');
    window.addEventListener('scroll', handleScroll);
  
}
