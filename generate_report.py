from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 16)
        self.cell(0, 10, 'Relatório Anual de Tráfego 2025', 0, 1, 'C')
        self.set_font('Arial', '', 12)
        self.cell(0, 10, 'Cliente: Clínica Armando Cajubá', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.cell(0, 10, 'Página ' + str(self.page_no()) + '/{nb}', 0, 0, 'C')

def create_report():
    pdf = PDF()
    pdf.alias_nb_pages()
    pdf.add_page()
    pdf.set_font('Arial', '', 12)

    # 1. Resumo
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, '1. RESUMO EXECUTIVO (Meta Ads)', 0, 1)
    pdf.set_font('Arial', '', 12)
    pdf.cell(0, 8, 'Total Investido: R$ 9.699,18', 0, 1)
    pdf.cell(0, 8, 'Leads Gerados: ~862', 0, 1)
    pdf.cell(0, 8, 'Custo por Lead (CPL): R$ 11,25', 0, 1)
    pdf.cell(0, 8, 'Alcance Total: 129.972 pessoas', 0, 1)
    pdf.ln(5)

    # 2. Engajamento
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, '2. ENGAJAMENTO E MARCA (Meta Ads)', 0, 1)
    pdf.set_font('Arial', '', 12)
    metrics = [
        "Reações (Curtidas): 3.740",
        "Compartilhamentos: 248",
        "Cliques no Link: 4.448",
        "Novos Seguidores: 241",
        "CPC Médio: R$ 2,18"
    ]
    for metric in metrics:
        pdf.cell(0, 7, f"- {metric}", 0, 1)
    pdf.ln(5)

    # 3. Tabela
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, '3. DESEMPENHO POR EXAME', 0, 1)
    
    # Cabeçalho da Tabela
    pdf.set_font('Arial', 'B', 10)
    pdf.set_fill_color(200, 220, 255)
    col_widths = [60, 40, 30, 40, 20]
    headers = ['Exame / Campanha', 'Investimento', 'Leads', 'Custo/Lead', 'Status']
    
    for i in range(len(headers)):
        pdf.cell(col_widths[i], 10, headers[i], 1, 0, 'C', 1)
    pdf.ln()

    # Dados da Tabela
    data = [
        ['US Abdominal', 'R$ 1.954,49', '239', 'R$ 8,18', 'Otimo'],
        ['US Doppler', 'R$ 1.953,55', '184', 'R$ 10,62', 'Otimo'],
        ['US Gestacional', 'R$ 1.929,43', '167', 'R$ 11,55', 'Bom'],
        ['US Prep. Intestinal', 'R$ 1.612,79', '158', 'R$ 10,21', 'Otimo'],
        ['Tomografia (Cranio)', 'R$ 1.412,23', '78', 'R$ 18,11', 'Atencao'],
        ['Neuro (Especificos)', 'R$ 919,16', '30', 'R$ 30,64', 'Alto'],
    ]

    pdf.set_font('Arial', '', 10)
    for row in data:
        pdf.cell(col_widths[0], 10, row[0], 1)
        pdf.cell(col_widths[1], 10, row[1], 1, 0, 'C')
        pdf.cell(col_widths[2], 10, row[2], 1, 0, 'C')
        pdf.cell(col_widths[3], 10, row[3], 1, 0, 'C')
        pdf.cell(col_widths[4], 10, row[4], 1, 0, 'C')
        pdf.ln()
    
    pdf.ln(10)

    # 4. Google Ads Section (ADDED)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(0, 10, '4. GOOGLE ADS (2025)', 0, 1)
    pdf.set_font('Arial', '', 12)
    
    # Data from screenshot
    google_metrics = [
        "Período: 1 jan. a 31 dez. 2025",
        "Impressões: 95.700 (95,7 mil)",
        "Cliques: 7.830 (7,83 mil)",
        "CPC Médio: R$ 0,33",
        "Custo Total: R$ 2.550,00 (2,55 mil)"
    ]
    
    for metric in google_metrics:
        pdf.cell(0, 7, f"- {metric}", 0, 1)

    output_filename = 'Relatorio_Clinica_Armando_2025.pdf'
    pdf.output(output_filename)
    print(f"PDF generated successfully: {output_filename}")

if __name__ == "__main__":
    create_report()
