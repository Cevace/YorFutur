"""
The Career Spy
Protect job seekers from cultural mismatches and hidden risks.
"""

from .models import (
    CandidateProfile,
    CompanyIntel,
    CultureMatch,
    MissionReport,
    RedFlag,
    SalaryData,
    InterviewQuestion
)
from .main import CareerSpy, run_career_spy
from .cv_parser import parse_cv, extract_text_from_file
from .spy_agent import SpyAgent
from .analyzer import perform_match_analysis, generate_interview_questions
from .reporter import generate_mission_report, save_report

__all__ = [
    # Main
    "CareerSpy",
    "run_career_spy",
    
    # Models
    "CandidateProfile",
    "CompanyIntel",
    "CultureMatch",
    "MissionReport",
    "RedFlag",
    "SalaryData",
    "InterviewQuestion",
    
    # Functions
    "parse_cv",
    "extract_text_from_file",
    "SpyAgent",
    "perform_match_analysis",
    "generate_interview_questions",
    "generate_mission_report",
    "save_report",
]

__version__ = "1.0.0"
