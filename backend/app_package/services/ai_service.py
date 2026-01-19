import fitz  # PyMuPDF
import os
import logging

def extract_text_from_pdf(file_path: str, pages: list[int] = None) -> str:
    """
    Extracts plain text from a PDF file.

    Args:
        file_path (str): Path to the PDF file.
        pages (list[int], optional): List of page numbers to extract (0-indexed). Extracts all pages if None.

    Returns:
        str: Extracted text, empty string if file missing or extraction fails.
    """
    if not os.path.exists(file_path):
        logging.warning(f"PDF file not found: {file_path}")
        return ""

    text = ""
    try:
        doc = fitz.open(file_path)
        page_indices = pages if pages is not None else range(len(doc))
        for i in page_indices:
            if 0 <= i < len(doc):
                page_text = doc[i].get_text().strip()
                if page_text:
                    text += page_text + "\n"
        doc.close()
    except Exception as e:
        logging.error(f"Failed to extract text from PDF '{file_path}': {e}")
        text = ""

    return text.strip()
