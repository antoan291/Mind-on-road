class DocumentIntelligenceError(Exception):
  """Base exception for document intelligence workflows."""


class InvalidPdfError(DocumentIntelligenceError):
  """Raised when the input PDF cannot be read or is empty."""


class InvalidDocumentError(DocumentIntelligenceError):
  """Raised when the input document cannot be read or has an unsupported type."""


class OCRDependencyError(DocumentIntelligenceError):
  """Raised when required local OCR dependencies are missing."""


class OCRProcessingError(DocumentIntelligenceError):
  """Raised when the OCR engine cannot process the rendered pages."""
