
import { jsPDF } from 'jspdf';

// Function to add footer to PDF pages
export const addFooterToPDF = (doc: jsPDF): void => {
  const pageCount = doc.internal.pages.length - 1;
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const footerPos = doc.internal.pageSize.height - 10;
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`© ${new Date().getFullYear()} Schweiz. Peitschenclub`, doc.internal.pageSize.width / 2, footerPos, { align: 'center' });
  }
};
