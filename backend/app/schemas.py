"""Pydantic schemas for request and response validation."""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

Priority = Literal["Low", "Medium", "High"]


class TodoBase(BaseModel):
    """Fields shared by create and update requests."""

    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: str | None = Field(None, max_length=2000, description="Optional task details")
    priority: Priority = Field("Medium", description="Task priority: Low, Medium or High")
    due_date: date | None = Field(None, description="Task due date (YYYY-MM-DD)")

    @field_validator("title")
    @classmethod
    def title_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("Title is required.")
        return value


class TodoCreate(TodoBase):
    """Request body for creating a todo."""


class TodoUpdate(TodoBase):
    """Request body for updating a todo."""


class TodoOut(TodoBase):
    """Todo response returned to the client."""

    id: int
    completed: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TodoStats(BaseModel):
    """Aggregated statistics about the todo list."""

    total_tasks: int
    pending_tasks: int
    completed_tasks: int
    high_priority_tasks: int