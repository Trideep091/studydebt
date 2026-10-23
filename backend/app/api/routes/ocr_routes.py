from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.ocr_service import document_ocr_service

router = APIRouter(prefix="/api/ocr", tags=["Document & Vision"])

@router.post("/upload-pdf")
async def extract_pdf_endpoint(file: UploadFile = File(...)):
    """Extract readable text from lecture slide PDF."""
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    contents = await file.read()
    if len(contents) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="PDF exceeds 25MB maximum limit.")

    try:
        text, pages = document_ocr_service.extract_text_from_pdf(contents)
        return {
            "fileName": file.filename,
            "pageCount": pages,
            "text": text,
            "characterCount": len(text),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract PDF text: {str(e)}")

@router.post("/upload-image")
async def process_image_endpoint(file: UploadFile = File(...)):
    """Inspect and prepare screenshot image for OCR or study overview."""
    allowed_exts = (".png", ".jpg", ".jpeg", ".webp")
    if not any(file.filename.lower().endswith(ext) for ext in allowed_exts):
        raise HTTPException(status_code=400, detail="Unsupported image format. Please upload PNG, JPG, or WebP.")

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image exceeds 15MB limit.")

    try:
        meta = document_ocr_service.inspect_and_prepare_image(contents)
        meta["fileName"] = file.filename
        return meta
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process image: {str(e)}")
