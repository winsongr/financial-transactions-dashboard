from app.services.csv_processor import CsvProcessorService


def test_csv_processor_service_instantiation():
    processor = CsvProcessorService()
    assert processor is not None
