"""
The Career Spy - CV Parser
STEP 1: Asset Analysis - Parse CV and build candidate profile
"""

import json
import re
from pathlib import Path
from typing import Optional

from .models import CandidateProfile
from .prompts import CV_ANALYSIS_PROMPT


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from a PDF file using PyPDF2"""
    try:
        import PyPDF2
        
        text_parts = []
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text_parts.append(page.extract_text() or "")
        
        return "\n".join(text_parts)
    except ImportError:
        raise ImportError("PyPDF2 is required for PDF parsing. Install with: pip install PyPDF2")
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {e}")


def extract_text_from_file(file_path: str) -> str:
    """Extract text from CV file (PDF or text)"""
    path = Path(file_path)
    
    if not path.exists():
        raise FileNotFoundError(f"CV file not found: {file_path}")
    
    extension = path.suffix.lower()
    
    if extension == '.pdf':
        return extract_text_from_pdf(file_path)
    elif extension in ['.txt', '.md']:
        return path.read_text(encoding='utf-8')
    else:
        # Try reading as text
        try:
            return path.read_text(encoding='utf-8')
        except UnicodeDecodeError:
            raise ValueError(f"Unsupported file format: {extension}")


def parse_json_from_response(response: str) -> dict:
    """Extract JSON from Mistral response, handling markdown code blocks"""
    # Try to find JSON in code block
    json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', response, re.DOTALL)
    if json_match:
        json_str = json_match.group(1).strip()
    else:
        # Assume entire response is JSON
        json_str = response.strip()
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON from response: {e}\nResponse: {response[:500]}")


async def analyze_cv_with_mistral(cv_text: str, mistral_client) -> CandidateProfile:
    """Use Mistral to analyze CV and create candidate profile"""
    
    prompt = CV_ANALYSIS_PROMPT.format(cv_text=cv_text)
    
    # Call Mistral API
    response = await mistral_client.chat.complete_async(
        model="mistral-large-latest",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,  # Lower temperature for more consistent analysis
    )
    
    # Extract content
    content = response.choices[0].message.content
    
    # Parse JSON response
    data = parse_json_from_response(content)
    
    # Create CandidateProfile
    profile = CandidateProfile(
        name=data.get("name", "Unknown"),
        skills=data.get("skills", []),
        experience_years=data.get("experience_years", 0),
        culture_type=data.get("culture_type", "corporate"),
        work_pace=data.get("work_pace", "moderate"),
        structure_preference=data.get("structure_preference", "hierarchical"),
        builder_vs_maintainer=data.get("builder_vs_maintainer", "optimizer"),
        chaos_tolerance=data.get("chaos_tolerance", 5),
        autonomy_need=data.get("autonomy_need", 5),
        raw_analysis=data.get("reasoning", "")
    )
    
    return profile


def analyze_cv_sync(cv_text: str, mistral_client) -> CandidateProfile:
    """Synchronous version of CV analysis"""
    import asyncio
    return asyncio.run(analyze_cv_with_mistral(cv_text, mistral_client))


# =============================================================================
# Main function for standalone testing
# =============================================================================

def parse_cv(file_path: str, mistral_client=None) -> CandidateProfile:
    """
    Main entry point for CV parsing.
    
    Args:
        file_path: Path to CV file (PDF or text)
        mistral_client: Mistral AI client instance
        
    Returns:
        CandidateProfile with organizational analysis
    """
    # Extract text
    cv_text = extract_text_from_file(file_path)
    
    if not cv_text.strip():
        raise ValueError("CV appears to be empty")
    
    print(f"📄 Extracted {len(cv_text)} characters from CV")
    
    if mistral_client is None:
        # Return basic profile without AI analysis
        return CandidateProfile(raw_analysis=cv_text)
    
    # Analyze with Mistral
    return analyze_cv_sync(cv_text, mistral_client)
