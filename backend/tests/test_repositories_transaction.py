from app.repositories.transaction import TransactionRepository


def test_transaction_repository_instantiation():
    repo = TransactionRepository()
    assert repo is not None
