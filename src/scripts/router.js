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
      
      // Handle hash fragment changes (for QR codes and legacy links)
      window.addEventListener('hashchange', () => {
        this.handleRoute();
      });
    },
    
    navigateTo(path) {
      // Update URL without page reload
      window.history.pushState({}, '', path);
      this.handleRoute();
    },
    
    handleRoute() {
      // Handle both clean URLs (/connect) and hash fragments (#connect)
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');
      
      // Priority: hash fragment > clean URL
      const target = hash || path;
      const sectionId = this.getPathToSectionId(target);
      const section = document.getElementById(sectionId);
      
      if (section) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          // Scroll to section with proper offset
          const headerHeight = 100; // Approximate header height
          const elementPosition = section.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerHeight;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          // Update navigation active state
          this.updateNavActive(sectionId);
          
          // If hash fragment was used, update URL to clean URL
          if (hash && path === '/') {
            window.history.replaceState({}, '', `/${sectionId}`);
          }
        });
      }
    },
    
    getPathToSectionId(path) {
      // Convert clean URLs or hash fragments to section IDs
      // Handle both "/connect" and "connect" (from hash fragments)
      const cleanPath = path.replace('/', '');
      
      if (cleanPath === '' || cleanPath === 'home') return 'home';
      if (cleanPath === 'locums') return 'locums';
      if (cleanPath === 'about') return 'about';
      if (cleanPath === 'contact') return 'contact';
      if (cleanPath === 'connect') return 'connect';
      
      // Backward compatibility for old section IDs in QR codes
      if (cleanPath === 'services') return 'locums';
      if (cleanPath === 'about-us') return 'about';
      if (cleanPath === 'apply') return 'connect';
      
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
