// Define core types for the application

export interface PaperSize {
  width: number;
  height: number;
}

export interface PaperSizes {
  [key: string]: PaperSize;
}

export interface PaperStyles {
  inkColor: string;
  paperColor: string;
  fontSize: string;
  letterSpacing: string;
  wordSpacing: string;
  lineHeight: string;
  fontFamily: string;
}

export interface PageEffects {
  value: string;
  label: string;
}

export interface HandwritingFont {
  value: string;
  label: string;
  style?: React.CSSProperties;
}

export interface GenerateImageOptions {
  resolution: number;
  pageEffect: string;
}
