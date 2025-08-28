from __future__ import annotations
from pydantic import BaseModel
from typing import Dict, List, Optional

class Question(BaseModel):
    stem: str = ""
    choices: List[str] = []
    selectedChoice: Optional[int] = None
    correctChoice: Optional[int] = None
    revealedIncorrectChoice: Optional[int] = None
    eliminatedChoices: Optional[List[bool]] = None

class Section(BaseModel):
    passage: str = ""
    questions: List[Question] = []

class Test(BaseModel):
    id: str
    name: str = ""
    sections: List[Section] = []
    type: str = "LR"

class AppState(BaseModel):
    tests: Dict[str, Test] = {}
    activeTestId: Optional[str] = None
    viewMode: str = "home"
