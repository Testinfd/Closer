import { Descendant, Element as SlateElement, Text as SlateText } from 'slate';

// Default Slate value when html is empty or during SSR
export const DEFAULT_SLATE_VALUE: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

// More modern approach to HTML conversion using the DOM
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deserialize = (el: globalThis.Node): any => {
  if (el.nodeType === 3) { // Text node
    return { text: el.textContent || '' }; // Ensure text content is not null
  } else if (el.nodeType !== 1) { // Not an Element node
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
    const deserializedBody = deserialize(doc.body);
    // Ensure the result is an array of Descendant, even if deserialize returns a single item or null/string.
    let slateContent: Descendant[];
    if (Array.isArray(deserializedBody)) {
      slateContent = deserializedBody.filter(n => n !== null && typeof n !== 'string') as Descendant[];
    } else if (deserializedBody && typeof deserializedBody !== 'string') {
      slateContent = [deserializedBody as Descendant];
    } else {
      slateContent = [];
    }
    return slateContent.length > 0 ? slateContent : DEFAULT_SLATE_VALUE;
  } catch (error) {
    console.error('Error parsing HTML to Slate value:', error);
    return DEFAULT_SLATE_VALUE;
  }
};

// Modern approach to serialize Slate nodes to HTML
export const serialize = (node: Descendant): string => {
  if (SlateText.isText(node)) {
    let text = node.text;
    // Custom text properties like 'bold' are defined in CustomTypes
    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.underline) {
      text = `<u>${text}</u>`;
    }
    return text;
  }

  if (SlateElement.isElement(node)) {
    const childrenHtml = node.children.map(n => serialize(n)).join('');

    // node is CustomElement here due to module augmentation
    switch (node.type) {
      case 'paragraph':
        return `<p>${childrenHtml}</p>`;
      case 'math':
        // The 'formula' property is guaranteed by CustomElement if type is 'math'
        // However, make sure 'formula' is non-optional in the CustomElement definition for 'math' type
        // or provide a fallback. The CustomElement definition in RichTextEditor has formula?: string.
        const formula = node.formula || '';
        return `<div class="math-formula" data-formula="${formula}"><span class="katex-formula">${formula}</span></div>`;
      default:
        return childrenHtml;
    }
  }
  
  return ''; // Should ideally not be reached if node is always a valid Descendant
};

// Convert Slate's value to HTML
export const slateValueToHtml = (value: Descendant[]): string => {
  return value.map(node => serialize(node)).join('');
}; 