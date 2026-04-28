import { watch } from 'vue';

/**
 * Composable to manage Page SEO (Title and Meta)
 */
export const useSEO = (title?: string, description?: string) => {
  const baseTitle = 'Agro Guate';

  const updateSEO = (t?: string, d?: string) => {
    if (t) {
      document.title = `${t} | ${baseTitle}`;
    } else {
      document.title = `${baseTitle} | El Marketplace Agrícola Líder`;
    }

    if (d) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', d);
      }
    }
  };

  // Immediate update
  updateSEO(title, description);

  return { updateSEO };
};
