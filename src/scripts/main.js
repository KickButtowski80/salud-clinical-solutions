document.addEventListener('DOMContentLoaded', () => {
  const sectionIds = ['home', 'services', 'rachtan', 'contact'];

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter((el) => el !== null);

  if (sections.length === 0) {
    return;
  }

  const desktopLinks = Array.from(
    document.querySelectorAll('.nav-menu .nav-link')
  );
  const mobileLinks = Array.from(
    document.querySelectorAll('.mobile-nav__link')
  );

  if (desktopLinks.length === 0 && mobileLinks.length === 0) {
    return;
  }

  const idFromHref = (href) => {
    if (!href) return null;
    try {
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return null;
      return href.slice(hashIndex + 1);
    } catch {
      return null;
    }
  };

  const desktopById = new Map();
  const mobileById = new Map();

  desktopLinks.forEach((link) => {
    const id = idFromHref(link.getAttribute('href'));
    if (id && sectionIds.includes(id)) {
      desktopById.set(id, link);
    }
  });

  mobileLinks.forEach((link) => {
    const id = idFromHref(link.getAttribute('href'));
    if (id && sectionIds.includes(id)) {
      mobileById.set(id, link);
    }
  });

  let currentSectionId = null;

  const updateNavForSection = (sectionId) => {
    if (!sectionId || sectionId === currentSectionId) return;
    currentSectionId = sectionId;

    // Desktop: nav-link--active
    desktopById.forEach((link, id) => {
      if (id === sectionId) {
        link.classList.add('nav-link--active');
      } else {
        link.classList.remove('nav-link--active');
      }
    });

    // Move the active badge/logo image under the currently active <li>
    const activeBadge = document.querySelector('.nav-link-icon');
    if (activeBadge) {
      const activeDesktopLink = desktopById.get(sectionId);
      if (activeDesktopLink && activeDesktopLink.parentElement) {
        const targetLi = activeDesktopLink.parentElement;
        if (activeBadge.parentElement !== targetLi) {
          targetLi.appendChild(activeBadge);
        }
      }
    }

    // Mobile: aria-current="page"
    mobileById.forEach((link, id) => {
      if (id === sectionId) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  // Click handling: update active state immediately on nav clicks
  const handleNavClick = (event) => {
    const link = event.currentTarget;
    const id = idFromHref(link.getAttribute('href'));
    if (!id || !sectionIds.includes(id)) return;

    // Let the browser handle the actual anchor scrolling,
    // but update nav state right away.
    updateNavForSection(id);
  };

  [...desktopById.values(), ...mobileById.values()].forEach((link) => {
    link.addEventListener('click', handleNavClick);
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible / closest to center
        let bestEntry = null;

        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          if (!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio) {
            bestEntry = entry;
          }
        });

        if (!bestEntry) return;

        const id = bestEntry.target.id;
        if (id && sectionIds.includes(id)) {
          updateNavForSection(id);
        }
      },
      {
        // Treat a section as "current" when it's around the middle of the viewport
        root: null,
        rootMargin: '-50% 0px -40% 0px',
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else {
    // Fallback: on load, pick the first section in view or default to #home
    const fallbackId = sectionIds.find((id) => document.getElementById(id)) || 'home';
    updateNavForSection(fallbackId);
  }

  // Initial state: if page loads scrolled, pick the section overlapping mid-viewport
  const initFromScroll = () => {
    const viewportMid = window.innerHeight / 2;
    let bestId = null;
    let smallestDistance = Infinity;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionMid = rect.top + rect.height / 2;
      const distance = Math.abs(sectionMid - viewportMid);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        bestId = section.id;
      }
    });

    if (bestId) {
      updateNavForSection(bestId);
    }
  };

  initFromScroll();
});

 