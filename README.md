# Text to Handwriting (Modern Version)

A modernized version of the [Text to Handwriting](https://github.com/saurabhdaware/text-to-handwriting) tool, rebuilt with TypeScript, React, and Next.js.

## What's Different from the Original?

This version preserves all features from the legacy tool while upgrading the codebase with:

- **TypeScript Support**: Full type-safety for reliable code maintenance
- **React Components**: Modular, reusable components following React best practices
- **Next.js Framework**: Server-side rendering capabilities and modern build tools
- **Mobile Optimization**: Enhanced drawing experience on touch devices
- **Improved Architecture**: Better separation of concerns and file organization

## Features

- Convert text to realistic handwriting
- Customize ink color, paper style, and font
- Upload your own handwriting font
- Draw diagrams and add them to the page
- Generate multiple pages for longer text
- Download output as images or combined PDF
- Adjust text spacing, margins, and other parameters

## Technical Improvements

1. **Type-Safe Codebase**: 
   - Interfaces for data structures and props
   - Improved error handling and validation

2. **Component-Based Architecture**:
   - `Paper`: Renders the handwritten content with customizable styling
   - `CustomizationForm`: Controls for adjusting the appearance
   - `DrawingCanvas`: Interactive drawing capability
   - `LoadingSpinner`: Visual feedback during image generation

3. **Enhanced Functionality**:
   - Multi-page document support
   - Image manipulation (move, delete)
   - High-resolution output options

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## Usage

1. Enter or paste text into the input area
2. Customize appearance using the right panel controls
3. Click "Generate Image" to create handwritten version
4. Download individual images or as a combined PDF

## Future Enhancements

- [ ] More paper styles and templates (ruled, graph, etc.)
- [ ] Line height control for more precise text spacing
- [ ] Text formatting options (bold, italic, underline)
- [ ] Custom drawing tools (shapes, highlighter)
- [ ] User-defined page sizes
- [ ] Cloud storage for saving and sharing creations
- [ ] Offline usage capabilities
- [ ] Document history and versioning

## Known Issues

- The "Add to Paper" functionality for drawings needs further refinement
- Some fonts may not render exactly as expected due to browser differences
- Very large documents may cause performance issues during PDF generation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Original project by [Saurabh Daware](https://github.com/saurabhdaware)
- [html2canvas](https://html2canvas.hertzen.com/) for HTML to image conversion
- [jsPDF](https://parall.ax/products/jspdf) for PDF generation
