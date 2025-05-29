from app.services.pdf_generator import PDFReportGenerator


def test_pdf_report_generator_instantiation():
    pdf_gen = PDFReportGenerator()
    assert pdf_gen is not None
