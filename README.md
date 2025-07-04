# Text to Handwriting Next

This is a modern React/TypeScript rewrite of the original Text to Handwriting project by Saurabh Daware.

## Recent Updates

- **Fixed text input issues**: Resolved overlay issues that were preventing text input in the editor
- **Restored shadow and scanner effects**: Properly implemented page effects from the legacy version
- **Improved multi-page generation**: Pages now maintain consistent margins and styles across all pages
- **Enhanced UI with thumbnails**: Added page thumbnails for easier multi-page document management
- **Added external text areas**: Optional side and top notes areas that don't interfere with main content

## Features

- Convert text to handwritten-style images
- Multiple handwriting font options
- Custom handwriting font upload
- Page effects (shadows, scanner)
- Multiple page generation
- Export as images or PDF
- Drawing capabilities
- Dark mode support

## Project Structure

- `/src/app`: Next.js app pages and layout components
- `/src/components`: React components for UI elements
- `/src/utils`: Utility functions for image generation, drawing, and PDF export
- `/src/types`: TypeScript type definitions

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```

## Known Issues and Future Work

- **Preview Text Display Failure:** The main preview area fails to render the input text correctly, showing hardcoded formulas instead.
- **Mathematical Syntax (LaTeX) Not Rendering:** The application does not render mathematical formulas written in LaTeX syntax.
- **Inconsistent State Management:** State management for customization options is handled by individual `useState` hooks, which can be difficult to manage.
- **Missing Error Handling:** There is no error handling for font uploads or content generation.
- **Lack of Comments and Documentation:** The code lacks comments, and there is no documentation for components and utility functions.
- **Incomplete UI Features:** The customization form is missing several key features, such as color pickers for font and background, and a font size selector.
- **Non-Responsive Layout:** The application layout is not responsive and does not adapt well to different screen sizes.
- **Lack of Testing:** There are no scripts for linting or testing.

### Future Work

- **Paper customization**: Implement more paper styles and backgrounds
- **Margin customization**: Allow adjusting margin sizes and colors
- **Font management**: Improve custom font handling and provide more built-in options
- **Better mobile support**: Enhance responsive design for smaller screens
- **Performance optimization**: Optimize image generation for large documents
- **Accessibility improvements**: Enhance keyboard navigation and screen reader support

## Technologies Used

- React 18
- Next.js 13+
- TypeScript
- html2canvas for image generation
- jsPDF for PDF generation

## License

## How it Works (Updated)

This application is a sophisticated Next.js-based tool that transforms user-inputted text into a realistic handwriting format. It leverages a rich ecosystem of React components, advanced utility functions, and third-party libraries to deliver a highly customizable experience.

### Core Architecture

```mermaid
graph TD
    subgraph User Interface (Client Components)
        A[page.tsx] -- Manages State --> B(CustomizationForm);
        A --> C(RichTextEditor);
        A --> D(DrawingCanvas);
        A --> E(EnhancedPaper);
        A --> F(FontUploader);
    end

    subgraph Core Logic (TypeScript Utilities)
        G[generate.ts] -- Uses --> H{html2canvas};
        G -- Uses --> I[jsPDF];
        J[slate-serializer.ts] -- Handles --> C;
        K[paper-effects.ts] -- Enhances --> E;
        L[handwriting-randomization.ts] -- Enhances --> E;
        M[sanitize.ts] -- Secures --> C;
    end

    subgraph Configuration
        N[next.config.ts];
        O[tsconfig.json];
        P[tailwind.config.js];
    end

    C -- User Text --> A;
    B -- Customization Options --> A;
    D -- Drawings --> A;
    F -- Custom Fonts --> A;
    A -- Renders --> E;
    E -- DOM Element to Capture --> G;
```

### Detailed Workflow

1.  **Initialization & State Management:**
    *   The application is centered around the main page component (`src/app/page.tsx`), which is responsible for managing a significant portion of the application's state using numerous `useState` hooks. This approach, while functional, can lead to a large and complex component that may be challenging to maintain and debug.
    *   The `RootLayout` (`src/app/layout.tsx`) sets up global fonts and attempts to load `html2canvas` via a `<Script>` tag. However, `html2canvas` is also dynamically loaded elsewhere, leading to redundant loading.

2.  **User Interaction & Components:**
    *   **`RichTextEditor`:** The user interacts with a Slate.js-based rich text editor (`src/components/RichTextEditor.tsx`) that supports formatting and KaTeX for mathematical formulas. Separate instances are used for the main content, side notes, and top notes, which currently limits their full integration with paper effects.
    *   **`CustomizationForm`:** This component (`src/components/CustomizationForm.tsx`) provides a wide range of options to customize the output, from font and color to paper size and effects. All changes update the state in the main `page.tsx` component, contributing to its complexity.
    *   **`DrawingCanvas`:** A separate canvas component (`src/components/DrawingCanvas.tsx`) allows users to draw or add images, which can then be added to the main paper.
    *   **`FontUploader`:** Users can upload their own font files using the `FontUploader` component (`src/components/FontUploader.tsx`), which uses `localStorage` to persist the fonts across sessions.

3.  **Rendering & Effects:**
    *   **`EnhancedPaper`:** This is the central component (`src/components/EnhancedPaper.tsx`) that brings everything together. It takes the user's text, drawings, and all the customization options to render a preview of the final output. While it applies various effects, these are currently not fully integrated with the side and top note areas.
    *   **`paper-effects.ts` & `handwriting-randomization.ts`:** These utility files contain functions that apply realistic effects to the `EnhancedPaper` component, such as paper textures, ink bleed, and variations in the handwriting to make it look more natural. Further work is needed to ensure these effects are consistently applied across all text areas, including side and top notes.

4.  **Image & PDF Generation:**
    *   **`generate.ts`:** This is the powerhouse of the application. When the user clicks "Generate Image," this utility takes the `EnhancedPaper` DOM element and uses the `html2canvas` library to capture it as an image.
    *   It handles multi-page documents by programmatically scrolling through the content and capturing each page separately.
    *   It also generates thumbnails for multi-page documents and provides the functionality to download all the generated images as a single PDF using `jsPDF`.

5.  **Serialization & Sanitization:**
    *   **`slate-serializer.ts`:** This utility is responsible for converting the Slate.js editor's content to and from HTML.
    *   **`sanitize.ts`:** To prevent XSS attacks, all user-provided content is passed through a sanitizer before being rendered. Consistent application of sanitization across all user inputs is crucial.

## License

MIT License - See LICENSE file for details


## Credits

- Original project by Saurabh Daware
- Contributors to the original text-to-handwriting project