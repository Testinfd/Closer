import { Descendant } from 'slate';

// Default Slate value when html is empty or during SSR
export const DEFAULT_SLATE_VALUE: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

// More modern approach to HTML conversion using the DOM
export const deserialize = (el: globalThis.Node): any => {
  if (el.nodeType === 3) {
    return { text: el.textContent };
  } else if (el.nodeType !== 1) {
    return null;
  }

  const children = Array.from(el.childNodes)
    .map((node) => deserialize(node))
    .flat();

  if (children.length === 0) {
    children.push({ text: '' });
  }

  const element = el as HTMLElement;
  
  switch (element.nodeName.toLowerCase()) {
    case 'body':
      return children;
    case 'br':
      return '\n';
    case 'p':
      return { type: 'paragraph', children };
    case 'strong':
    case 'b':
      return children.map((child) => ({ ...child, bold: true }));
    case 'em':
    case 'i':
      return children.map((child) => ({ ...child, italic: true }));
    case 'u':
      return children.map((child) => ({ ...child, underline: true }));
    case 'div':
      if (element.className === 'math-formula') {
        return {
          type: 'math',
          formula: element.dataset.formula,
          children: [{ text: '' }]
        };
      }
      return { type: 'paragraph', children };
    default:
      return children;
  }
};

// Convert HTML to Slate's initial value format
export const htmlToSlateValue = (html: string): Descendant[] => {
  if (!html) {
    return DEFAULT_SLATE_VALUE;
  }

  // Return default value during server-side rendering
  if (typeof window === 'undefined') {
    return DEFAULT_SLATE_VALUE;
  }

  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const slateContent = deserialize(doc.body);
    return slateContent.length > 0 ? slateContent : DEFAULT_SLATE_VALUE;
  } catch (error) {
    console.error('Error parsing HTML to Slate value:', error);
    return DEFAULT_SLATE_VALUE;
  }
};

// Modern approach to serialize Slate nodes to HTML
export const serialize = (node: Descendant): string => {
  // Handle text nodes
  if ('text' in node) {
    let text = node.text;
    if ('bold' in node && node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if ('italic' in node && node.italic) {
      text = `<em>${text}</em>`;
    }
    if ('underline' in node && node.underline) {
      text = `<u>${text}</u>`;
    }
    return text;
  }

  // Handle elements with children
  if ('children' in node) {
    const children = (node.children as Descendant[])
      .map((n: Descendant) => serialize(n))
      .join('');
    
    if ((node as any).type === 'paragraph') {
      return `<p>${children}</p>`;
    }
    
    if ((node as any).type === 'math' && 'formula' in node) {
      // Ensure the formula is properly escaped for HTML attributes if needed, though KaTeX handles most cases.
      const formula = (node as any).formula;
      // When serializing, we just output the formula. KaTeX will render it on the client.
      // The div with class "math-formula" will be targeted by KaTeX rendering logic.
      // The span with "katex-formula" will hold the raw formula text for KaTeX.
      return `<div class="math-formula" data-formula="${formula}"><span class="katex-formula">${formula}</span></div>`;
    }
    
    return children;
  }
  
  return '';
};

// Convert Slate's value to HTML
export const slateValueToHtml = (value: Descendant[]): string => {
  return value.map(node => serialize(node)).join('');
}; 