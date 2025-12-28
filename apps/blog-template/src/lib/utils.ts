/**
 * Utilitaires pour le blog template
 */

/**
 * Extrait un aperçu texte propre à partir de contenu HTML
 * @param html - Le contenu HTML à nettoyer
 * @param maxLength - Longueur maximale de l'aperçu (défaut: 800)
 * @returns Texte nettoyé et tronqué
 */
export function extractTextPreview(html: string, maxLength: number = 800): string {
  if (!html) return '';

  // 1. Supprimer les balises script et style avec leur contenu
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // 2. Supprimer toutes les balises HTML
  text = text.replace(/<[^>]+>/g, ' ');

  // 3. Décoder les entités HTML courantes
  text = text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&rdquo;/gi, '"')
    .replace(/&ldquo;/gi, '"')
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&hellip;/gi, '...')
    .replace(/&#(\d+);/gi, (_, num) => String.fromCharCode(parseInt(num)));

  // 4. Normaliser les espaces (multiples espaces, tabs, newlines -> single space)
  text = text.replace(/\s+/g, ' ').trim();

  // 5. Si le texte est plus court que maxLength, le retourner tel quel
  if (text.length <= maxLength) {
    return text;
  }

  // 6. Tronquer au dernier mot complet avant maxLength
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  // Si pas d'espace trouvé, tronquer directement
  if (lastSpaceIndex === -1) {
    return truncated + '...';
  }

  // Tronquer au dernier mot et ajouter "..."
  return truncated.substring(0, lastSpaceIndex) + '...';
}

/**
 * Génère un slug à partir d'une chaîne
 * @param text - Le texte à convertir en slug
 * @returns Slug URL-friendly
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/\s+/g, '-') // Espaces -> tirets
    .replace(/-+/g, '-') // Plusieurs tirets -> un seul
    .replace(/^-+|-+$/g, ''); // Supprimer tirets début/fin
}

/**
 * Formate une date en français
 * @param dateString - Date ISO string
 * @returns Date formatée (ex: "15 jan. 2025")
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Obtient le label d'une catégorie
 * @param category - Slug de la catégorie
 * @returns Label français
 */
export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    reviews: 'Review',
    guides: 'Guide',
    comparatifs: 'Comparatif',
    tops: 'TOP',
  };
  return labels[category] || category;
}

/**
 * Obtient la couleur d'une catégorie
 * @param category - Slug de la catégorie
 * @returns Classes Tailwind pour le badge
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    reviews: 'bg-blue-100 text-blue-700 border-blue-200',
    guides: 'bg-green-100 text-green-700 border-green-200',
    comparatifs: 'bg-purple-100 text-purple-700 border-purple-200',
    tops: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return colors[category] || 'bg-primary-100 text-primary-700 border-primary-200';
}
