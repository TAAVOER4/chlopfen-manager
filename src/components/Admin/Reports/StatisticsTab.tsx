
import React from 'react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const StatisticsTab: React.FC = () => {
  const generatePdf = () => {
    const doc = new jsPDF();
    
    // Set document information
    doc.setProperties({
      title: 'Wettkampf Statistiken',
      subject: 'Statistiken über Teilnehmer und Gruppen',
      author: 'Wettchlöpfen Manager',
      keywords: 'wettchlöpfen, statistik, teilnehmer, gruppen'
    });
    
    // Add title
    doc.setFontSize(24);
    doc.setTextColor(40);
    doc.text('Wettkampf Statistiken', 105, 20, { align: 'center' });
    
    // Add some descriptive text
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text('Diese Statistik gibt einen Überblick über die Teilnehmer und Gruppen des Wettkampfs.', 105, 30, { align: 'center' });
    
    // Define the data for the tables
    const participantData = [
      ['Hans Muster', 'Bern'],
      ['Maria Müller', 'Zürich'],
      ['Peter Schneider', 'Basel']
    ];
    
    const groupData = [
      ['Gruppe A', 'Bern, Zürich'],
      ['Gruppe B', 'Basel, Genf'],
      ['Gruppe C', 'Luzern, St. Gallen']
    ];
    
    // Define the table headers
    const participantHeaders = ['Name', 'Ort'];
    const groupHeaders = ['Gruppe', 'Mitglieder (Orte)'];
    
    // Add the participant table
    autoTable(doc, {
      head: [participantHeaders],
      body: participantData,
      startY: 40,
      styles: {
        textColor: 20,
        fontSize: 10,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
      },
      margin: { horizontal: 10 },
      didParseCell: function(data) {
        if (data.section === 'head') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });
    
    // Add the group table
    autoTable(doc, {
      head: [groupHeaders],
      body: groupData,
      startY: (doc as any).lastAutoTable.finalY + 10,
      styles: {
        textColor: 20,
        fontSize: 10,
      },
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
      },
      margin: { horizontal: 10 },
      didParseCell: function(data) {
        if (data.section === 'head') {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    // Add footer with page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(`Seite ${i} von ${pageCount}`, 105, doc.internal.pageSize.height - 10, {
        align: 'center'
      });
    }
    
    // Save or display the PDF
    doc.save('wettkampf_statistiken.pdf');
  };
  
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Statistiken generieren</h2>
      <p className="mb-4">Generieren Sie eine PDF-Datei mit Statistiken über den Wettkampf.</p>
      <Button onClick={generatePdf}>PDF generieren</Button>
    </div>
  );
};

export default StatisticsTab;
