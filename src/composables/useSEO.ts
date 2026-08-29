import { watch } from 'vue';

/**
 * Composable to manage Page SEO (Title and Meta)
 */
export const useSEO = (title?: string, description?: string) => {
  const baseTitle = 'Agro Guate';

  const updateSEO = (t?: string, d?: string) => {
    if (t) {
      document.title = t.includes(baseTitle) ? t : `${t} | ${baseTitle}`;
    } else {
      document.title = `${baseTitle} | El Marketplace Agrícola Líder`;
    }

    if (d) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', d);
      }
    }

    // Canonical Tag Management
    const baseUrl = 'https://agroguate.shop';
    const currentPath = window.location.pathname;
    let canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    
    canonical.setAttribute('href', `${baseUrl}${currentPath === '/' ? '' : currentPath}`);
  };

  // Immediate update
  updateSEO(title, description);

  return { updateSEO };
};
