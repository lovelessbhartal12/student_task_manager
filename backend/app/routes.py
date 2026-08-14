"""API routes for the Todo App."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from . import models, schemas
from .database import get_db

router = APIRouter(prefix="/api/todos", tags=["todos"])


def get_todo_or_404(todo_id: int, db: Session) -> models.Todo:
    """Return a todo by id or raise a 404 error."""
    todo = db.get(models.Todo, todo_id)
    if todo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found")
    return todo


@router.post(
    "",
    response_model=schemas.TodoOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create a todo",
    description="Create a new todo with a title, description, priority and optional due date.",
)
def create_todo(todo: schemas.TodoCreate, db: Session = Depends(get_db)):
    """Add a new todo to the database."""
    db_todo = models.Todo(**todo.model_dump())
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.get(
    "",
    response_model=list[schemas.TodoOut],
    summary="List all todos",
    description="Return every todo in the database.",
)
def list_todos(db: Session = Depends(get_db)):
    """Return all todos ordered by creation date."""
    return db.query(models.Todo).order_by(models.Todo.created_at).all()


@router.get(
    "/stats",
    response_model=schemas.TodoStats,
    summary="Get todo statistics",
    description="Return total, pending, completed and high priority task counts.",
)
def get_stats(db: Session = Depends(get_db)):
    """Compute aggregate statistics directly from the database."""
    return schemas.TodoStats(
        total_tasks=db.query(func.count(models.Todo.id)).scalar(),
        pending_tasks=db.query(func.count(models.Todo.id))
        .filter(models.Todo.completed.is_(False))
        .scalar(),
        completed_tasks=db.query(func.count(models.Todo.id))
        .filter(models.Todo.completed.is_(True))
        .scalar(),
        high_priority_tasks=db.query(func.count(models.Todo.id))
        .filter(models.Todo.priority == "High")
        .scalar(),
    )


@router.get(
    "/{todo_id}",
    response_model=schemas.TodoOut,
    summary="Get a single todo",
    description="Return one todo by its id. Returns 404 if it does not exist.",
)
def get_todo(todo_id: int, db: Session = Depends(get_db)):
    """Return a single todo by id."""
    return get_todo_or_404(todo_id, db)


@router.put(
    "/{todo_id}",
    response_model=schemas.TodoOut,
    summary="Update a todo",
    description="Replace the title, description, priority and due date of a todo.",
)
def update_todo(todo_id: int, todo: schemas.TodoUpdate, db: Session = Depends(get_db)):
    """Update an existing todo with new values."""
    db_todo = get_todo_or_404(todo_id, db)
    for field, value in todo.model_dump().items():
        setattr(db_todo, field, value)
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.patch(
    "/{todo_id}/complete",
    response_model=schemas.TodoOut,
    summary="Toggle todo completion",
    description="Mark a todo as completed, or back to pending if it is already completed.",
)
def toggle_todo(todo_id: int, db: Session = Depends(get_db)):
    """Toggle the completed flag of a todo."""
    db_todo = get_todo_or_404(todo_id, db)
    db_todo.completed = not db_todo.completed
    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.delete(
    "/{todo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a todo",
    description="Delete a todo by its id.",
)
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """Delete a todo from the database."""
    db_todo = get_todo_or_404(todo_id, db)
    db.delete(db_todo)
    db.commit()
    return None