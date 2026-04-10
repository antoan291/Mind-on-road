from document_intelligence.config import ExtractionConfig
from document_intelligence.ocr_engine import _build_paddle_ocr_kwargs


def _build_config(*, use_gpu: bool = False) -> ExtractionConfig:
  return ExtractionConfig(
    ocr_language="ru",
    ocr_version="PP-OCRv5",
    use_gpu=use_gpu,
    min_text_confidence=0.35,
    max_pages=2,
    render_scale=2.0,
  )


def test_build_paddle_ocr_kwargs_for_legacy_constructor() -> None:
  class LegacyPaddleOCR:
    def __init__(
      self,
      *,
      use_angle_cls=None,
      use_gpu=None,
      lang=None,
      ocr_version=None,
    ) -> None:
      self.args = {
        "use_angle_cls": use_angle_cls,
        "use_gpu": use_gpu,
        "lang": lang,
        "ocr_version": ocr_version,
      }

  kwargs = _build_paddle_ocr_kwargs(LegacyPaddleOCR, _build_config(use_gpu=True))

  assert kwargs == {
    "use_angle_cls": True,
    "use_gpu": True,
    "lang": "ru",
    "ocr_version": "PP-OCRv5",
  }


def test_build_paddle_ocr_kwargs_for_modern_constructor() -> None:
  class ModernPaddleOCR:
    def __init__(
      self,
      *,
      use_textline_orientation=None,
      lang=None,
      ocr_version=None,
      **kwargs,
    ) -> None:
      self.args = {
        "use_textline_orientation": use_textline_orientation,
        "lang": lang,
        "ocr_version": ocr_version,
        **kwargs,
      }

  kwargs = _build_paddle_ocr_kwargs(ModernPaddleOCR, _build_config())

  assert kwargs == {
    "use_textline_orientation": True,
    "lang": "ru",
    "ocr_version": "PP-OCRv5",
  }
