/**
 * Client-Side Router for Clean URLs
 * Handles navigation without page reloads
 */

export function initRouter() {
  const router = {
    init() {
      // Handle initial page load
      this.handleRoute();
      
      // Handle navigation clicks
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="/"]');
        if (link) {
          e.preventDefault();
          const path = link.getAttribute('href');
          this.navigateTo(path);
        }
      });
      
      // Handle browser back/forward buttons
      window.addEventListener('popstate', () => {
        this.handleRoute();
      });
    },
    
    navigateTo(path) {
      // Update URL without page reload
      window.history.pushState({}, '', path);
      this.handleRoute();
    },
    
    handleRoute() {
      const path = window.location.pathname;
      const sectionId = this.getPathToSectionId(path);
      const section = document.getElementById(sectionId);
      
      if (section) {
        // Smooth scroll to section
        section.scrollIntoView({ behavior: 'smooth' });
        
        // Update navigation active state
        this.updateNavActive(sectionId);
      }
    },
    
    getPathToSectionId(path) {
      // Convert clean URLs to section IDs
      if (path === '/' || path === '/home') return 'home';
      if (path === '/locums') return 'locums';
      if (path === '/about') return 'about';
      if (path === '/contact') return 'contact';
      if (path === '/connect') return 'connect';
      return 'home'; // fallback
    },
    
    updateNavActive(sectionId) {
      // Update desktop navigation
      const desktopLinks = document.querySelectorAll('.nav-link');
      desktopLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkSectionId = this.getPathToSectionId(href);
        if (linkSectionId === sectionId) {
          link.classList.add('nav-link--active');
        } else {
          link.classList.remove('nav-link--active');
        }
      });
      
      // Update mobile navigation
      const mobileLinks = document.querySelectorAll('.mobile-nav__link');
      mobileLinks.forEach(link => {
        const href = link.getAttribute('href');
        const linkSectionId = this.getPathToSectionId(href);
        if (linkSectionId === sectionId) {
          link.setAttribute('aria-current', 'page');
        } else {
          link.removeAttribute('aria-current');
        }
      });
    }
  };
  
  router.init();
  return router;
}
