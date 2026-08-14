"""Pytest fixtures and test database setup."""

import os
import tempfile

import pytest
from fastapi.testclient import TestClient

TEST_DATABASE_PATH = os.path.join(tempfile.gettempdir(), "test_todos.db")
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DATABASE_PATH}"

from app.database import Base, SessionLocal, engine, get_db 
from app.main import app 


def override_get_db():
    """Use the test database session for every request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture()
def client():
    """Create a fresh, isolated database for each test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(bind=engine)