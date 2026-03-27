from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class DrivingLicenceCategory(BaseModel):
  model_config = ConfigDict(extra="forbid")

  category: str = Field(description="Категория")
  date: str | None = Field(default=None, description="Дата към категорията")


class BulgarianDocumentExtraction(BaseModel):
  model_config = ConfigDict(extra="forbid")

  document_type: Literal[
    "bulgarian_identity_card",
    "bulgarian_driving_licence",
    "unknown",
  ] = Field(
    default="unknown",
    description="Detected Bulgarian document type.",
  )
  first_name: str | None = Field(default=None, description="\u0418\u043c\u0435")
  middle_name: str | None = Field(default=None, description="\u041f\u0440\u0435\u0437\u0438\u043c\u0435")
  last_name: str | None = Field(default=None, description="\u0424\u0430\u043c\u0438\u043b\u0438\u044f")
  egn: str | None = Field(default=None, description="\u0415\u0413\u041d")
  document_number: str | None = Field(default=None, description="\u041d\u043e\u043c\u0435\u0440 \u043d\u0430 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430")
  place_of_birth: str | None = Field(default=None, description="\u041c\u044f\u0441\u0442\u043e \u043d\u0430 \u0440\u0430\u0436\u0434\u0430\u043d\u0435")
  permanent_address: str | None = Field(default=None, description="\u041f\u043e\u0441\u0442\u043e\u044f\u043d\u0435\u043d \u0430\u0434\u0440\u0435\u0441")
  driving_categories: list[DrivingLicenceCategory] = Field(
    default_factory=list,
    description="Категории и дати от шофьорската книжка.",
  )
  review_required: bool = Field(
    default=True,
    description="Always true for sensitive documents until a human confirms the result.",
  )
  confidence: float | None = Field(
    default=None,
    description="Estimated confidence from 0 to 1 based on OCR matches.",
  )
  warnings: list[str] = Field(
    default_factory=list,
    description="Reasons for ambiguity or manual review.",
  )

  def to_bulgarian_dict(self) -> dict[str, object]:
    return {
      "\u0442\u0438\u043f_\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442": self._document_type_label(),
      "\u0438\u043c\u0435": self.first_name,
      "\u043f\u0440\u0435\u0437\u0438\u043c\u0435": self.middle_name,
      "\u0444\u0430\u043c\u0438\u043b\u0438\u044f": self.last_name,
      "\u0435\u0433\u043d": self.egn,
      "\u043d\u043e\u043c\u0435\u0440_\u043d\u0430_\u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442\u0430": self.document_number,
      "\u043c\u044f\u0441\u0442\u043e_\u043d\u0430_\u0440\u0430\u0436\u0434\u0430\u043d\u0435": self.place_of_birth,
      "\u043f\u043e\u0441\u0442\u043e\u044f\u043d\u0435\u043d_\u0430\u0434\u0440\u0435\u0441": self.permanent_address,
      "\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u0438": [
        {
          "\u043a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f": item.category,
          "\u0434\u0430\u0442\u0430": item.date,
        }
        for item in self.driving_categories
      ],
      "\u043d\u0443\u0436\u0435\u043d_\u0440\u044a\u0447\u0435\u043d_\u043f\u0440\u0435\u0433\u043b\u0435\u0434": self.review_required,
      "\u0443\u0432\u0435\u0440\u0435\u043d\u043e\u0441\u0442": self.confidence,
      "\u043f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u044f": self.warnings,
    }

  def _document_type_label(self) -> str:
    if self.document_type == "bulgarian_identity_card":
      return "\u0431\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0430 \u043b\u0438\u0447\u043d\u0430 \u043a\u0430\u0440\u0442\u0430"
    if self.document_type == "bulgarian_driving_licence":
      return "\u0431\u044a\u043b\u0433\u0430\u0440\u0441\u043a\u0430 \u0448\u043e\u0444\u044c\u043e\u0440\u0441\u043a\u0430 \u043a\u043d\u0438\u0436\u043a\u0430"
    return "\u043d\u0435\u0440\u0430\u0437\u043f\u043e\u0437\u043d\u0430\u0442 \u0434\u043e\u043a\u0443\u043c\u0435\u043d\u0442"
