from typing import Optional, List, Literal
from pydantic import BaseModel


class Question(BaseModel):
    stem: str
    choices: list[str]
    selectedChoice: Optional[int] = None
    revealedIncorrectChoice: Optional[int] = None
    eliminatedChoices: Optional[List[bool]] = None


class Section(BaseModel):
    passage: str
    questions: List[Question]


class Test(BaseModel):
    id: str
    name: str
    sections: List[Section]
    type: Literal["RC", "LR"]


class AppState(BaseModel):
    tests: dict[str, Test]
    activeTestId: str | None
    viewMode: Literal["home", "edit", "display"]