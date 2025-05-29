from app.models.transaction import Transaction


def test_transaction_model_instantiation():
    transaction = Transaction()
    assert transaction is not None
