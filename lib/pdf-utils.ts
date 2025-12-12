// src/lib/pdf-utils.ts
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Funzione che disegna una singola sessione nel documento PDF corrente
export const addSessionToPDF = (doc: jsPDF, session: any) => {
  
  // Intestazione Sessione
  doc.setFontSize(16);
  doc.setTextColor(22, 163, 74); // Verde SagManager
  doc.text(`Sessione: ${session.name}`, 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`${new Date(session.created_at).toLocaleString('it-IT')}`, 14, 26);
  
  // Info Generali (Riga grigia sotto il titolo)
  doc.setFillColor(241, 245, 249); // Slate-100
  doc.rect(14, 30, 182, 18, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  doc.text(`Circuito: ${session.track_days?.circuit_name || '-'}`, 20, 38);
  doc.text(`Moto: ${session.track_days?.bike?.brand} ${session.track_days?.bike?.model}`, 20, 44);
  doc.text(`Peso Pilota: ${session.track_days?.rider_weight} kg`, 120, 38);
  
  // Tabella Dati
  autoTable(doc, {
    startY: 55,
    head: [['Sezione', 'Parametro', 'Valore', 'Unità']],
    body: [
      // GOMME
      ['Gomme', 'Modello', session.tires_model, ''],
      ['Gomme', 'Press. Anteriore', session.tire_pressure_f, 'bar'],
      ['Gomme', 'Press. Posteriore', session.tire_pressure_r, 'bar'],
      
      // FORCELLA
      ['Forcella', 'Molla (K)', session.fork_spring, 'N/mm'],
      ['Forcella', 'Precarico', session.fork_preload, 'giri'],
      ['Forcella', 'Compressione', session.fork_comp, 'click'],
      ['Forcella', 'Rebound', session.fork_reb, 'click'],
      ['Forcella', 'Livello Olio', session.fork_oil_level, 'mm'],
      ['Forcella', 'Sfilamento', session.fork_height, 'tacche'],
      ['Forcella', 'Sag Statico', session.fork_sag_static, 'mm'],
      ['Forcella', 'Sag Dinamico', session.fork_sag_dynamic, 'mm'],

      // MONO
      ['Mono', 'Molla (K)', session.shock_spring, 'N/mm'],
      ['Mono', 'Precarico', session.shock_preload, 'mm'],
      ['Mono', 'Compressione', session.shock_comp, 'click'],
      ['Mono', 'Rebound', session.shock_reb, 'click'],
      ['Mono', 'Interasse', session.shock_length, 'mm'],
      ['Mono', 'Sag Statico', session.shock_sag_static, 'mm'],
      ['Mono', 'Sag Dinamico', session.shock_sag_dynamic, 'mm'],

      // GEOMETRIA
      ['Geometria', 'Interasse', session.wheelbase, 'mm'],
      ['Geometria', 'Inclinazione', session.rake, 'deg'],
      ['Geometria', 'Avancorsa', session.trail, 'mm'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [100, 100, 100] }, // Colonna Sezione in grigio
      2: { fontStyle: 'bold' } // Colonna Valore in grassetto
    },
    styles: { fontSize: 9, cellPadding: 3 },
  });
}