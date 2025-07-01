# Changelog

## [1.0.1] - 2023-11-15

### Added
- Rich text editor integration using Slate.js
- LaTeX/math support using KaTeX
- Handwriting randomization features (baseline jitter, letter variation, spacing)
- Custom font uploader for personal handwriting
- Paper texture and ink effects for enhanced realism
- Improved sanitization for secure content handling
- Demo page to showcase new features

### Enhanced
- Paper component with EnhancedPaper offering rich text editing
- Drawing capabilities for signatures and diagrams
- Export functionality with all effects preserved
- Font management with user-uploaded handwriting

### Technical Improvements
- Code organization with utility functions for handwriting randomization
- Proper sanitization of user input to prevent XSS
- Type safety with TypeScript throughout

## [1.0.0] - 2023-10-30

### Initial Release
- Basic text-to-handwriting conversion
- Simple paper styles and effects
- Font selection from predefined options
- Basic image export

# Changelog: Legacy to Modern Version Alignment

## Core Functionality Alignment

### Paper Component
- Matched paper styling from legacy version
- Added proper formatting for pasted content (preserving line breaks)
- Implemented paper margins and lines functionality
- Added support for custom font parameters

### Drawing Canvas
- Fixed touch and mouse event handling 
- Implemented proper drawing functionality for both desktop and mobile
- Added "Add to Paper" functionality to insert drawings into the document
- Added image download capability and background image support

### Image Generation
- Implemented multi-page support for longer documents
- Added page effects (shadows, scanner)
- Fixed pagination algorithm to properly handle content splitting
- Added output image management (move, delete, reorder)

### PDF Generation
- Added proper PDF export with correct page sizes
- Implemented multi-page PDF generation
- Matched legacy page layout and margins

## UI/UX Improvements
- Converted event listeners to React event handlers
- Implemented controlled form components
- Added proper state management
- Enhanced mobile responsiveness

## Type System Implementation
- Added TypeScript interfaces for all major data structures
- Added prop typing for all components
- Created reusable type definitions

## Custom Fonts and Papers
- Re-implemented font file uploading
- Added paper background image support

## Bug Fixes
- Fixed clipboard paste handling 
- Corrected drawing canvas initialization
- Fixed image generation resolution settings
- Enhanced error handling during image generation

## Documentation
- Created comprehensive README
- Added CHANGELOG to track changes
- Documented future enhancement possibilities

## Code Quality
- Improved component structure
- Enhanced reusability with React hooks
- Separated concerns between UI and logic 

## Enhancements and Bug Fixes

- Fixed Text Input Issue: We identified that the overlay element used for shadow/scanner effects was blocking text input. We fixed it by adding pointer-events: none to the overlay so that the user can interact with the text field underneath.
- Restored Shadow and Scanner Effects: We properly implemented the shadow and scanner effects by using both the CSS classes and dynamic styling based on the legacy implementation.
- Improved Multi-Page Generation: We enhanced the page generation process to maintain consistent margins and styles across all pages, preserving formatting during multi-page documents.
- Enhanced UI with Thumbnails: We added a thumbnail system for better visualization and management of multi-page documents, making it easier to navigate between pages.
- Added External Text Areas: We implemented optional side and top text areas that don't interfere with the main content, allowing users to keep notes separate from the handwritten text.