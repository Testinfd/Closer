/**
 * Utility functions for sanitizing user input and output
 */

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Create a temporary DOM element
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Remove potentially dangerous elements
  const dangerousTags = ['script', 'iframe', 'object', 'embed', 'form', 'input', 'style', 'link'];
  dangerousTags.forEach(tag => {
    const elements = tempElement.querySelectorAll(tag);
    elements.forEach(el => el.remove());
  });
  
  // Remove all attributes starting with "on" (event handlers)
  const allElements = tempElement.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || attr.name === 'href' && attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
  });
  
  // Return the sanitized HTML
  return tempElement.innerHTML;
}

/**
 * Sanitizes text content (removes all HTML tags)
 * @param text Text that might contain HTML
 * @returns Plain text without any HTML
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Create a temporary element and set its content to the text
  const tempElement = document.createElement('div');
  tempElement.textContent = text;
  
  // Return the text content (browser handles the encoding)
  return tempElement.textContent || '';
}

/**
 * Sanitizes LaTeX/Math content
 * @param latex LaTeX content to sanitize
 * @returns Sanitized LaTeX string
 */
export function sanitizeLaTeX(latex: string): string {
  if (!latex) return '';
  
  // Remove potentially dangerous commands
  const dangerousCommands = [
    '\\write', '\\input', '\\include', '\\immediate', '\\openout',
    '\\catcode', '\\read', '\\closein', '\\closeout', '\\csname',
    '\\newwrite', '\\typeout', '\\special', '\\output'
  ];
  
  let sanitized = latex;
  
  dangerousCommands.forEach(command => {
    // Use regex to match commands with their arguments
    const regex = new RegExp(command + '\\s*{[^}]*}', 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  // Remove JavaScript protocol in \href commands
  const hrefRegex = /\\href\s*{javascript:[^}]*}/gi;
  sanitized = sanitized.replace(hrefRegex, '');
  
  return sanitized;
}

/**
 * Sanitizes user-provided CSS styles to prevent security issues
 * @param css CSS string to sanitize
 * @returns Sanitized CSS string
 */
export function sanitizeCSS(css: string): string {
  if (!css) return '';
  
  // Remove @import directives
  css = css.replace(/@import\s+[^;]*;/gi, '');
  
  // Remove JavaScript in URLs
  css = css.replace(/url\s*\(\s*["']?\s*javascript:/gi, 'url(about:blank');
  
  // Remove expression and behavior properties (used in IE)
  css = css.replace(/expression\s*\([^)]*\)/gi, 'none');
  css = css.replace(/behavior\s*:/gi, 'no-behavior:');
  
  return css;
}

/**
 * Validates and sanitizes an external URL
 * @param url URL to validate and sanitize
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  // Only allow http://, https:// and data: protocols for images
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  } else if (url.startsWith('data:image/')) {
    // Only allow certain image data URLs (png, jpeg, gif, etc.)
    if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,/i.test(url)) {
      return url;
    }
  }
  
  // For relative URLs, keep them as is
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url;
  }
  
  // If none of the above, reject the URL
  return '';
}

/**
 * Master sanitizer that processes content from rich text editors
 * @param content HTML content from a rich text editor
 * @param allowMath Whether to allow and sanitize math/LaTeX content
 * @returns Sanitized content safe for rendering
 */
export function sanitizeRichTextContent(content: string, allowMath: boolean = true): string {
  if (!content) return '';
  
  // First sanitize the HTML structure
  let sanitized = sanitizeHtml(content);
  
  // If math is allowed, find and sanitize LaTeX content
  if (allowMath) {
    // Find content in math delimiters
    const mathRegex = /\$\$(.*?)\$\$|\$(.*?)\$/g;
    sanitized = sanitized.replace(mathRegex, (match) => {
      // Extract the LaTeX content
      const latex = match.replace(/^\$\$|\$\$$|^\$|\$$/, '');
      // Return the sanitized version with delimiters
      const isInline = match.startsWith('$') && !match.startsWith('$$');
      return isInline ? `$${sanitizeLaTeX(latex)}$` : `$$${sanitizeLaTeX(latex)}$$`;
    });
  }
  
  return sanitized;
} 