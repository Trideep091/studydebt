import io
import base64
from typing import Optional, Tuple
from PIL import Image
from pypdf import PdfReader
import logging

logger = logging.getLogger("studydebt.ocr")

class DocumentOCRService:
    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, int]:
        """Extract plain text and page count from PDF binary stream."""
        reader = PdfReader(io.BytesIO(file_bytes))
        pages_text = []
        for idx, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                pages_text.append(text.strip())
        full_text = "\n\n--- Page Break ---\n\n".join(pages_text)
        return full_text, len(reader.pages)

    @staticmethod
    def inspect_and_prepare_image(image_bytes: bytes) -> dict:
        """Inspect image resolution, format, and prepare base64 string."""
        img = Image.open(io.BytesIO(image_bytes))
        width, height = img.size
        img_format = img.format or "PNG"

        # Encode base64
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        mime = f"image/{img_format.lower()}"

        return {
            "width": width,
            "height": height,
            "format": img_format,
            "base64": f"data:{mime};base64,{b64}",
            "size_bytes": len(image_bytes),
        }

document_ocr_service = DocumentOCRService()
