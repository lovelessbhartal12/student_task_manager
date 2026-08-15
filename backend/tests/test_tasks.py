"""Tests for todo CRUD operations, validation, errors and statistics."""

VALID_TODO = {
    "title": "Complete Python Assignment",
    "description": "Finish the lab report",
    "priority": "High",
    "due_date": "2026-08-20",
}


def test_create_todo(client):
    """POST /api/todos must create a todo and return 201."""
    response = client.post("/api/todos", json=VALID_TODO)

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Complete Python Assignment"
    assert data["description"] == "Finish the lab report"
    assert data["priority"] == "High"
    assert data["due_date"] == "2026-08-20"
    assert data["completed"] is False
    assert data["id"] == 1


def test_create_todo_uses_defaults(client):
    """Optional fields must fall back to sensible defaults."""
    response = client.post("/api/todos", json={"title": "Read a chapter"})

    assert response.status_code == 201
    data = response.json()
    assert data["description"] is None
    assert data["priority"] == "Medium"
    assert data["due_date"] is None
    assert data["completed"] is False


def test_get_all_todos(client):
    """GET /api/todos must return every created todo."""
    client.post("/api/todos", json={"title": "First task"})
    client.post("/api/todos", json={"title": "Second task"})

    response = client.get("/api/todos")

    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert [todo["title"] for todo in data] == ["First task", "Second task"]


def test_get_todo_by_id(client):
    """GET /api/todos/{id} must return the matching todo."""
    created = client.post("/api/todos", json=VALID_TODO).json()

    response = client.get(f"/api/todos/{created['id']}")

    assert response.status_code == 200
    assert response.json()["title"] == "Complete Python Assignment"


def test_update_todo(client):
    """PUT /api/todos/{id} must replace the todo fields."""
    created = client.post("/api/todos", json=VALID_TODO).json()

    response = client.put(
        f"/api/todos/{created['id']}",
        json={
            "title": "Submit Python Assignment",
            "description": "Submit the lab report",
            "priority": "Low",
            "due_date": "2026-08-25",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Submit Python Assignment"
    assert data["priority"] == "Low"
    assert data["due_date"] == "2026-08-25"
    assert data["completed"] is False


def test_complete_todo(client):
    """PATCH /api/todos/{id}/complete must mark a pending todo as completed."""
    created = client.post("/api/todos", json=VALID_TODO).json()

    response = client.patch(f"/api/todos/{created['id']}/complete")

    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_mark_completed_todo_pending(client):
    """Toggling an already completed todo must mark it pending again."""
    created = client.post("/api/todos", json=VALID_TODO).json()
    client.patch(f"/api/todos/{created['id']}/complete")

    response = client.patch(f"/api/todos/{created['id']}/complete")

    assert response.status_code == 200
    assert response.json()["completed"] is False


def test_delete_todo(client):
    """DELETE /api/todos/{id} must remove the todo and return 204."""
    created = client.post("/api/todos", json=VALID_TODO).json()

    response = client.delete(f"/api/todos/{created['id']}")

    assert response.status_code == 204
    assert client.get("/api/todos").json() == []


def test_get_missing_todo_returns_404(client):
    """Requesting an unknown todo id must return 404."""
    response = client.get("/api/todos/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Todo not found"}


def test_update_missing_todo_returns_404(client):
    """Updating an unknown todo id must return 404."""
    response = client.put("/api/todos/999", json=VALID_TODO)

    assert response.status_code == 404
    assert response.json() == {"detail": "Todo not found"}


def test_toggle_missing_todo_returns_404(client):
    """Toggling an unknown todo id must return 404."""
    response = client.patch("/api/todos/999/complete")

    assert response.status_code == 404
    assert response.json() == {"detail": "Todo not found"}


def test_delete_missing_todo_returns_404(client):
    """Deleting an unknown todo id must return 404."""
    response = client.delete("/api/todos/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Todo not found"}


def test_create_todo_missing_title_rejected(client):
    """A todo without a title must be rejected with 422."""
    response = client.post("/api/todos", json={"priority": "High"})

    assert response.status_code == 422


def test_create_todo_blank_title_rejected(client):
    """A todo with a whitespace-only title must be rejected with 422."""
    response = client.post("/api/todos", json={"title": "   "})

    assert response.status_code == 422


def test_create_todo_title_too_long_rejected(client):
    """A title longer than 200 characters must be rejected with 422."""
    response = client.post("/api/todos", json={"title": "x" * 201})

    assert response.status_code == 422


def test_create_todo_invalid_priority_rejected(client):
    """A priority outside Low, Medium, High must be rejected with 422."""
    response = client.post("/api/todos", json={"title": "Task", "priority": "Urgent"})

    assert response.status_code == 422


def test_create_todo_invalid_due_date_rejected(client):
    """A malformed due date must be rejected with 422."""
    response = client.post("/api/todos", json={"title": "Task", "due_date": "not-a-date"})

    assert response.status_code == 422


def test_create_todo_description_too_long_rejected(client):
    """A description longer than 2000 characters must be rejected with 422."""
    response = client.post(
        "/api/todos", json={"title": "Task", "description": "x" * 2001}
    )

    assert response.status_code == 422


def test_stats_are_calculated_from_database(client):
    """Statistics must reflect the current database contents."""
    client.post("/api/todos", json={"title": "Pending task", "priority": "High"})
    client.post("/api/todos", json={"title": "Another pending", "priority": "Low"})
    completed = client.post(
        "/api/todos", json={"title": "Done task", "priority": "High"}
    ).json()
    client.patch(f"/api/todos/{completed['id']}/complete")

    response = client.get("/api/todos/stats")

    assert response.status_code == 200
    assert response.json() == {
        "total_tasks": 3,
        "pending_tasks": 2,
        "completed_tasks": 1,
        "high_priority_tasks": 2,
    }


def test_stats_update_after_delete(client):
    """Deleting a todo must update the statistics."""
    created = client.post("/api/todos", json={"title": "Temporary task"}).json()

    client.delete(f"/api/todos/{created['id']}")

    response = client.get("/api/todos/stats")
    assert response.json()["total_tasks"] == 0


def test_update_todo_blank_title_rejected(client):
    """Updating a todo with a blank title must be rejected with 422."""
    created = client.post("/api/todos", json=VALID_TODO).json()

    response = client.put(
        f"/api/todos/{created['id']}",
        json={
            "title": "   ",
            "description": "Updated description",
            "priority": "Medium",
        },
    )

    assert response.status_code == 422


def test_update_todo_invalid_priority_rejected(client):
    """Updating a todo with an invalid priority must be rejected with 422."""
    created = client.post("/api/todos", json=VALID_TODO).json()

    response = client.put(
        f"/api/todos/{created['id']}",
        json={
            "title": "Updated task",
            "description": "Updated description",
            "priority": "Urgent",
        },
    )

    assert response.status_code == 422


def test_update_todo_title_too_long_rejected(client):
    """Updating a todo with a title longer than 200 characters must be rejected."""
    created = client.post("/api/todos", json=VALID_TODO).json()

    response = client.put(
        f"/api/todos/{created['id']}",
        json={
            "title": "x" * 201,
            "description": "Updated description",
            "priority": "Medium",
        },
    )

    assert response.status_code == 422