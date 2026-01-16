"""
The Career Spy - Data Models
Protect job seekers from cultural mismatches and hidden risks
"""

from dataclasses import dataclass, field
from typing import Literal, Optional
from datetime import datetime


@dataclass
class CandidateProfile:
    """Profile built from CV analysis"""
    name: str = ""
    skills: list[str] = field(default_factory=list)
    experience_years: int = 0
    
    # Cultural DNA
    culture_type: Literal["startup", "scale-up", "corporate", "agency", "nonprofit"] = "corporate"
    work_pace: Literal["fast", "moderate", "slow"] = "moderate"
    structure_preference: Literal["flat", "matrix", "hierarchical"] = "hierarchical"
    
    # Work style
    builder_vs_maintainer: Literal["builder", "optimizer", "maintainer"] = "optimizer"
    chaos_tolerance: int = 5  # 1-10 scale
    autonomy_need: int = 5    # 1-10 scale
    
    # Raw analysis
    raw_analysis: str = ""


@dataclass
class RedFlag:
    """A red flag found during reconnaissance"""
    category: Literal["layoffs", "toxic_culture", "lawsuit", "financial", "reorganization"]
    source: str
    headline: str
    severity: Literal["low", "medium", "high"]
    date: Optional[str] = None
    url: str = ""


@dataclass
class SalaryData:
    """Salary intelligence"""
    min_salary: int = 0
    max_salary: int = 0
    currency: str = "EUR"
    period: Literal["month", "year"] = "month"
    
    # Sources
    glassdoor_range: Optional[tuple[int, int]] = None
    cao_scale: Optional[str] = None
    indeed_range: Optional[tuple[int, int]] = None
    
    # Analysis
    market_position: Literal["below_market", "at_market", "above_market"] = "at_market"
    confidence: int = 50  # 0-100


@dataclass
class CompanyIntel:
    """Intelligence gathered about the target company"""
    name: str = ""
    sector: str = ""
    employee_count: Optional[int] = None
    
    # Structure
    structure_type: Literal["flat", "matrix", "hierarchical", "unknown"] = "unknown"
    culture_indicators: list[str] = field(default_factory=list)
    work_pace: Literal["fast", "moderate", "slow", "unknown"] = "unknown"
    
    # Salary intel
    salary_data: SalaryData = field(default_factory=SalaryData)
    
    # Red flags
    red_flags: list[RedFlag] = field(default_factory=list)
    
    # Reviews summary
    reviews_summary: str = ""
    glassdoor_rating: Optional[float] = None


@dataclass
class CultureMatch:
    """Result of culture comparison"""
    fit_score: int = 50  # 0-100
    warnings: list[str] = field(default_factory=list)
    
    # Detailed comparisons
    structure_match: int = 50
    pace_match: int = 50
    autonomy_match: int = 50
    
    # Risk assessment
    risk_level: Literal["low", "medium", "high"] = "medium"
    deal_breakers: list[str] = field(default_factory=list)


@dataclass
class InterviewQuestion:
    """A strategic interview question"""
    question: str
    reasoning: str
    what_to_listen_for: str


@dataclass
class MissionReport:
    """The final intelligence report"""
    company_name: str
    job_title: str
    vacancy_url: str
    
    # Candidate
    candidate_profile: CandidateProfile
    
    # Company intel
    company_intel: CompanyIntel
    
    # Analysis
    culture_match: CultureMatch
    salary_prediction: SalaryData
    
    # Red flags
    red_flags: list[RedFlag] = field(default_factory=list)
    
    # Interview ammo
    interview_questions: list[InterviewQuestion] = field(default_factory=list)
    
    # Meta
    generated_at: datetime = field(default_factory=datetime.now)
    
    @property
    def overall_verdict(self) -> Literal["green", "yellow", "red"]:
        """Overall recommendation"""
        if self.culture_match.fit_score >= 70 and len(self.red_flags) == 0:
            return "green"
        elif self.culture_match.fit_score >= 40 or len([f for f in self.red_flags if f.severity == "high"]) == 0:
            return "yellow"
        return "red"
