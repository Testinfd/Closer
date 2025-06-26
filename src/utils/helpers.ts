export const downloadFile = (
  blob: Blob,
  fileName: string,
  fileExtension: string
): void => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.${fileExtension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const addFontFromFile = (
  file: File,
  fontName: string,
  handwritingFontEl: HTMLSelectElement
): void => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const fontFace = new FontFace(fontName, `url(${e.target?.result})`);
    document.fonts.add(fontFace);

    const option = document.createElement('option');
    option.value = fontName;
    option.textContent = fontName;
    handwritingFontEl.appendChild(option);
    handwritingFontEl.value = fontName;
  };
  reader.readAsDataURL(file);
};

export const addPaperFromFile = (
  file: File,
  paperEl: HTMLElement
): void => {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    if (paperEl) {
      paperEl.style.backgroundImage = `url(${e.target?.result})`;
    }
  };
  reader.readAsDataURL(file);
};

export const formatText = (e: ClipboardEvent): void => {
  e.preventDefault();
  const text = e.clipboardData?.getData('text/plain');
  if (text) {
    document.execCommand('insertText', false, text);
  }
};