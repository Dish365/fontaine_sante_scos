import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ExportOptions {
  title?: string;
  filename?: string;
  includeCharts?: boolean;
}

export class ExportService {
  static async exportToPDF(data: any, options: ExportOptions = {}) {
    const {
      title = 'Environmental Analysis Report',
      filename = 'environmental-analysis.pdf',
      includeCharts = true
    } = options;

    const doc = new jsPDF();
    let yPos = 20;

    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, yPos);
    yPos += 20;

    // Add summary section
    doc.setFontSize(16);
    doc.text('Summary', 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    if (data.overall_statistics) {
      const stats = data.overall_statistics;
      const summaryData = [
        ['Total Suppliers Analyzed', stats.total_suppliers_analyzed],
        ['Average Score', stats.average_score.toFixed(1)],
        ['Total Carbon Footprint', `${stats.total_carbon_footprint.toFixed(1)} t`],
        ['Total Energy Consumption', `${stats.total_energy_consumption.toFixed(1)} kWh`]
      ];

      (doc as any).autoTable({
        startY: yPos,
        head: [['Metric', 'Value']],
        body: summaryData,
        margin: { left: 20 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;
    }

    // Add supplier analysis section
    doc.setFontSize(16);
    doc.text('Supplier Analysis', 20, yPos);
    yPos += 10;

    if (data.supplier_analyses) {
      const supplierData = data.supplier_analyses.map((supplier: any) => [
        supplier.supplier_name,
        supplier.environmental_score.toFixed(1),
        supplier.sustainability_level,
        `${supplier.carbon_footprint.toFixed(1)} t`,
        `${supplier.metrics.energy_consumption} kWh`,
        `${supplier.metrics.water_usage} m³`,
        `${supplier.metrics.waste_generated} kg`
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [['Supplier', 'Score', 'Level', 'CO2e', 'Energy', 'Water', 'Waste']],
        body: supplierData,
        margin: { left: 20 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 20;
    }

    // Add recommendations section
    if (data.recommendations) {
      doc.setFontSize(16);
      doc.text('Recommendations', 20, yPos);
      yPos += 10;

      const recommendations = data.recommendations.improvement_opportunities || [];
      recommendations.forEach((rec: string) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFontSize(12);
        doc.text('• ' + rec, 20, yPos);
        yPos += 10;
      });
    }

    // Save the PDF
    doc.save(filename);
  }

  static async exportToExcel(data: any, options: ExportOptions = {}) {
    const {
      filename = 'environmental-analysis.xlsx'
    } = options;

    const workbook = XLSX.utils.book_new();

    // Create summary sheet
    if (data.overall_statistics) {
      const summaryData = [
        ['Environmental Analysis Summary'],
        [],
        ['Metric', 'Value'],
        ['Total Suppliers Analyzed', data.overall_statistics.total_suppliers_analyzed],
        ['Average Score', data.overall_statistics.average_score.toFixed(1)],
        ['Total Carbon Footprint', `${data.overall_statistics.total_carbon_footprint.toFixed(1)} t`],
        ['Total Energy Consumption', `${data.overall_statistics.total_energy_consumption.toFixed(1)} kWh`]
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    // Create supplier analysis sheet
    if (data.supplier_analyses) {
      const supplierData = [
        ['Supplier Analysis'],
        [],
        ['Supplier', 'Score', 'Level', 'CO2e (t)', 'Energy (kWh)', 'Water (m³)', 'Waste (kg)', 'Transport Mode']
      ];

      data.supplier_analyses.forEach((supplier: any) => {
        supplierData.push([
          supplier.supplier_name,
          supplier.environmental_score.toFixed(1),
          supplier.sustainability_level,
          supplier.carbon_footprint.toFixed(1),
          supplier.metrics.energy_consumption,
          supplier.metrics.water_usage,
          supplier.metrics.waste_generated,
          supplier.transport_mode
        ]);
      });

      const supplierSheet = XLSX.utils.aoa_to_sheet(supplierData);
      XLSX.utils.book_append_sheet(workbook, supplierSheet, 'Supplier Analysis');
    }

    // Create recommendations sheet
    if (data.recommendations) {
      const recommendationsData = [
        ['Recommendations'],
        [],
        ['Category', 'Recommendation']
      ];

      data.recommendations.improvement_opportunities.forEach((rec: string) => {
        recommendationsData.push(['Improvement', rec]);
      });

      const recommendationsSheet = XLSX.utils.aoa_to_sheet(recommendationsData);
      XLSX.utils.book_append_sheet(workbook, recommendationsSheet, 'Recommendations');
    }

    // Save the Excel file
    XLSX.writeFile(workbook, filename);
  }
} 