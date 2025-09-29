declare module 'html2pdf.js' {
  interface Html2PdfOptions {
    margin?: number | [number, number, number, number];
    filename?: string;
    image?: {
      type?: string;
      quality?: number;
    };
    enableLinks?: boolean;
    html2canvas?: {
      scale?: number;
      useCORS?: boolean;
      allowTaint?: boolean;
      backgroundColor?: string;
      width?: number;
      height?: number;
      scrollX?: number;
      scrollY?: number;
    };
    jsPDF?: {
      unit?: string;
      format?: string;
      orientation?: string;
      compress?: boolean;
    };
    pagebreak?: {
      mode?: string[];
      before?: string[];
      after?: string[];
      avoid?: string[];
    };
  }

  interface Html2Pdf {
    from(element: HTMLElement | string): Html2Pdf;
    set(options: Html2PdfOptions): Html2Pdf;
    save(): Promise<void>;
    outputPdf(): Promise<Blob>;
    outputImg(): Promise<string>;
  }

  const html2pdf: {
    (): Html2Pdf;
    new (): Html2Pdf;
  };

  export = html2pdf;
} 
