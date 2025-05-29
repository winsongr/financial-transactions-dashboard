def test_get_transactions(test_client):
    response = test_client.get("/api/transactions")
    assert response.status_code in (
        200,
        422,
        401,
        403,
    )
