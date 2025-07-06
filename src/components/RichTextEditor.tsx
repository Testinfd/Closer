'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { createEditor, BaseEditor, Descendant, Node, NodeEntry, Transforms, Element, Text, Editor } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { withHistory } from 'slate-history';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

type CustomElement = {
  type: 'paragraph' | 'math';
  children: CustomText[];
  formula?: string;
  inline?: boolean;
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  handwriting?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

interface RichTextEditorProps {
  value: Descendant[];
  onChange: (value: Descendant[]) => void;
  inkColor: string;
  fontFamily: string;
  fontSize: string;
  letterSpacing: string;
  wordSpacing: string;
  className?: string;
}

// Default value to use if value is undefined or invalid
const DEFAULT_VALUE: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  inkColor,
  fontFamily,
  fontSize,
  letterSpacing,
  wordSpacing,
  className = ''
}) => {
  const editor = useMemo(() => {
    // Create editor with normalization to prevent errors
    const slateEditor = withHistory(withReact(createEditor()));
    
    const { normalizeNode, isInline } = slateEditor;

    slateEditor.isInline = (element) => {
      return element.type === 'math' && element.inline ? true : isInline(element);
    };
    
    // Add custom normalization to ensure valid document structure
    slateEditor.normalizeNode = (entry) => {
      const [node, path] = entry;

      if (Text.isText(node)) {
        const text = node.text;

        const blockMatch = /\$\$([\s\S]+?)\$\$/.exec(text);
        if (blockMatch) {
          const [fullMatch, formula] = blockMatch;
          const { index } = blockMatch;

          const point = { path, offset: index };
          const range = { anchor: point, focus: { ...point, offset: index + fullMatch.length } };

          Transforms.select(slateEditor, range);
          Transforms.delete(slateEditor);

          Transforms.insertNodes(
            slateEditor,
            { type: 'math', formula, inline: false, children: [{ text: '' }] },
            { at: range.anchor, select: true }
          );
          
          return;
        }

        const inlineMatch = /\$([^$]+?)\$/.exec(text);
        if (inlineMatch) {
          const [fullMatch, formula] = inlineMatch;
          const { index } = inlineMatch;

          const point = { path, offset: index };
          const range = { anchor: point, focus: { ...point, offset: index + fullMatch.length } };
          
          Transforms.select(slateEditor, range);
          Transforms.delete(slateEditor);

          Transforms.insertNodes(
            slateEditor,
            { type: 'math', formula, inline: true, children: [{ text: '' }] },
            { at: range.anchor, select: true }
          );
          
          return;
        }
      }

      if (path.length === 0) {
        // Ensure the editor always has at least one valid paragraph
        if (slateEditor.children.length === 0) {
          Transforms.insertNodes(
            slateEditor,
            { type: 'paragraph', children: [{ text: '' }] } as CustomElement,
            { at: [0] }
          );
          return;
        }
      }
      
      // Continue with regular normalization
      normalizeNode(entry);
    };
    
    return slateEditor;
  }, []);
  
  // Manually handle updates to reflect external changes
  useEffect(() => {
    // Only reset the editor if it's empty, to avoid resetting during edits.
    if (editor.children.length === 1 && (editor.children[0] as any).children[0].text === '') {
      editor.children = value;
      editor.onChange();
    }
  }, [value, editor]);

  const [mounted, setMounted] = useState(false);
  
  // Make sure value is always valid
  const safeValue = useMemo(() => {
    if (!value || !Array.isArray(value) || value.length === 0) {
      console.warn("Received invalid Slate value, using default value:", value);
      return DEFAULT_VALUE;
    }
    
    // Ensure every node has a valid structure
    const validatedValue = value.map(node => {
      // Check if node is a text node
      if ('text' in node) {
        return node;
      }
      
      // Check if node is an element without type
      if (!('type' in node)) {
        return { type: 'paragraph', children: [{ text: '' }] } as CustomElement;
      }
      
      // Check if node has children
      if (!('children' in node) || !Array.isArray(node.children) || node.children.length === 0) {
        return { 
          ...node, 
          children: [{ text: '' }] 
        } as CustomElement;
      }
      
      return node;
    });
    
    return validatedValue as Descendant[];
  }, [value]);
  
  // Set mounted state after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Error handling for DOM operations
  const handleDOMError = useCallback((error: any) => {
    console.warn('Slate DOM error suppressed:', error?.message || 'Unknown error');
    // Suppress errors to prevent component crashes
    return true;
  }, []);

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'math':
        return <MathElement {...props} />;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    return <Leaf {...props} />;
  }, []);

  const insertMath = () => {
    const formula = prompt('Enter LaTeX formula:');
    if (formula) {
      editor.insertNode({
        type: 'math',
        formula,
        children: [{ text: '' }],
      } as CustomElement);
    }
  };

  // Apply specific styles for side and top note editors
  const isMarginEditor = className.includes('side-note-editor') || className.includes('top-note-editor');
  const isSideNoteEditor = className.includes('side-note-editor');
  const isTopNoteEditor = className.includes('top-note-editor');

  return (
    <div className={`rich-text-editor ${className}`} style={{ 
      border: 'none', 
      outline: 'none',
      margin: '0',
      padding: '0',
      position: 'relative',
      width: '100%',
      height: isSideNoteEditor ? '100%' : 'auto',
      textAlign: isTopNoteEditor ? 'center' : 'left'
    }}>
      <style jsx global>{`
        @media print {
          .editor-toolbar {
            display: none !important;
          }
          .rich-text-editor {
            border: none !important;
            outline: none !important;
          }
        }
        .side-note-editor .editor-toolbar,
        .top-note-editor .editor-toolbar {
          display: none !important;
        }
        .side-note-editor {
          writing-mode: horizontal-tb;
          text-orientation: mixed;
          min-height: 100%;
        }
        .top-note-editor {
          text-align: center;
        }
        .top-note-editor [data-slate-editor=true] {
          text-align: center;
        }
      `}</style>
      <div className="editor-toolbar" style={{ marginBottom: '10px' }}>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            editor.insertText('\n');
          }}
        >
          New Line
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            const [match] = editor.nodes({
              match: (n) => 'bold' in n && n.bold === true,
            });
            const isBold = !!match;
            editor.addMark('bold', !isBold);
          }}
        >
          Bold
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            const [match] = editor.nodes({
              match: (n) => 'italic' in n && n.italic === true,
            });
            const isItalic = !!match;
            editor.addMark('italic', !isItalic);
          }}
        >
          Italic
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            const [match] = editor.nodes({
              match: (n) => 'underline' in n && n.underline === true,
            });
            const isUnderline = !!match;
            editor.addMark('underline', !isUnderline);
          }}
        >
          Underline
        </button>
        <button
          onMouseDown={(event) => {
            event.preventDefault();
            insertMath();
          }}
        >
          Insert Math
        </button>
      </div>
      {/* Use key to force remount when value changes dramatically */}
      <Slate 
        editor={editor} 
        initialValue={value}
        onChange={onChange}
      >
        {mounted && (
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            onError={handleDOMError}
            style={{
              color: inkColor,
              fontFamily,
              fontSize,
              letterSpacing,
              wordSpacing,
              minHeight: isMarginEditor ? 'auto' : '200px',
              padding: '0',
              border: 'none',
              borderRadius: '0',
              lineHeight: '1.5',
              textAlign: isTopNoteEditor ? 'center' : 'left',
              width: '100%',
              height: isSideNoteEditor ? '100%' : 'auto',
              boxSizing: 'border-box',
              backgroundColor: 'transparent',
              outline: 'none',
              verticalAlign: 'top',
              margin: '0',
              overflow: 'visible',
              writingMode: 'horizontal-tb',
              textOrientation: isSideNoteEditor ? 'mixed' : 'inherit',
            }}
            onDOMBeforeInput={(event) => {
              try {
                // Default behavior
              } catch (error) {
                console.warn('Prevented DOM error:', error);
                event.preventDefault();
              }
            }}
          />
        )}
      </Slate>
    </div>
  );
};

const DefaultElement = (props: any) => {
  return <div {...props.attributes} style={{ margin: '0', padding: '0' }}>{props.children}</div>;
};

const MathElement = (props: any) => {
  const { attributes, children, element } = props;
  const formula = element.formula;
  const isInline = element.inline;
  
  return (
    <span 
      {...attributes} 
      contentEditable={false} 
      style={{ display: isInline ? 'inline-block' : 'block', margin: '5px 0' }}
    >
      {isInline ? (
        <InlineMath math={formula} />
      ) : (
        <BlockMath math={formula} />
      )}
      {children}
    </span>
  );
};

const Leaf = (props: any) => {
  let { attributes, children, leaf } = props;
  
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

export default RichTextEditor; 