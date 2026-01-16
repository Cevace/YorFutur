"""
The Career Spy - Spy Agent
STEP 2: Deep Reconnaissance - Browser-based intelligence gathering
"""

import json
import re
from typing import Optional
from dataclasses import dataclass

from .models import CompanyIntel, RedFlag, SalaryData
from .prompts import VACANCY_ANALYSIS_PROMPT


@dataclass
class SpySearchResult:
    """Result from a spy search operation"""
    query: str
    results: list[dict]
    raw_text: str = ""


class SpyAgent:
    """
    The Spy Agent uses browser automation to gather intelligence.
    
    In the Antigravity environment, this uses the browser_subagent.
    For standalone use, this can be adapted to use Playwright/Selenium.
    """
    
    def __init__(self, browser_interface=None):
        """
        Args:
            browser_interface: Browser automation interface 
                              (Antigravity browser_subagent or Playwright)
        """
        self.browser = browser_interface
        self.gathered_intel = {}
    
    # =========================================================================
    # VACANCY ANALYSIS
    # =========================================================================
    
    async def analyze_vacancy_page(self, vacancy_url: str) -> dict:
        """
        Scrape and analyze vacancy page content.
        
        Returns dict with:
        - vacancy_text: Full text of the vacancy
        - company_name: Extracted company name
        - job_title: Extracted job title
        """
        # This would use the browser to navigate and extract
        # For now, return placeholder that will be filled by browser_subagent
        return {
            "vacancy_url": vacancy_url,
            "vacancy_text": "",
            "company_name": "",
            "job_title": "",
            "about_text": ""
        }
    
    # =========================================================================
    # SALARY FORENSICS
    # =========================================================================
    
    def get_salary_search_queries(self, company_name: str, job_title: str) -> list[str]:
        """Generate search queries for salary research"""
        return [
            f"{company_name} salaris {job_title}",
            f"glassdoor {company_name} salaris",
            f"{job_title} salaris nederland",
            f"CAO {self._guess_sector(company_name)} salarisschaal",
            f"indeed {job_title} salaris",
        ]
    
    def _guess_sector(self, company_name: str) -> str:
        """Guess sector from company name for CAO search"""
        name_lower = company_name.lower()
        if any(word in name_lower for word in ['zorg', 'care', 'health', 'hospital']):
            return "Zorg"
        elif any(word in name_lower for word in ['bank', 'finance', 'verzeker']):
            return "Financieel"
        elif any(word in name_lower for word in ['tech', 'software', 'digital']):
            return "ICT"
        elif any(word in name_lower for word in ['bouw', 'construct']):
            return "Bouw"
        return "algemeen"
    
    async def search_salary_data(self, company_name: str, job_title: str) -> SalaryData:
        """
        Search for salary information from multiple sources.
        
        Strategy:
        1. Glassdoor NL for company-specific salaries
        2. Indeed salary data
        3. CAO information if applicable
        4. Levels.fyi for tech roles
        """
        salary_data = SalaryData()
        
        queries = self.get_salary_search_queries(company_name, job_title)
        
        # Placeholder - actual implementation would use browser to search
        # and parse results from Glassdoor, Indeed, CAO PDFs
        
        return salary_data
    
    # =========================================================================
    # CORPORATE STRUCTURE SCAN
    # =========================================================================
    
    def get_structure_search_queries(self, company_name: str) -> list[str]:
        """Generate queries for corporate structure research"""
        return [
            f"{company_name} organogram",
            f"{company_name} organisatiestructuur",
            f"site:linkedin.com {company_name}",
            f"{company_name} over ons team",
            f"{company_name} agile squads teams",
        ]
    
    def detect_structure_keywords(self, text: str) -> dict:
        """Analyze text for structure indicators"""
        text_lower = text.lower()
        
        indicators = {
            "flat": ["plat", "geen managers", "zelfsturend", "holacracy"],
            "startup": ["startup", "scale-up", "snelgroeiend", "dynamisch"],
            "agile": ["agile", "scrum", "squads", "tribes", "spotify model"],
            "matrix": ["matrix", "business units", "divisies", "corporate"],
            "hierarchical": ["hiërarchie", "afdelingen", "managers", "directie"],
        }
        
        found = {}
        for category, keywords in indicators.items():
            matches = [kw for kw in keywords if kw in text_lower]
            if matches:
                found[category] = matches
        
        return found
    
    # =========================================================================
    # RED FLAG SEARCH
    # =========================================================================
    
    def get_red_flag_search_queries(self, company_name: str) -> list[str]:
        """Generate queries for finding red flags"""
        return [
            f'"{company_name}" reorganisatie',
            f'"{company_name}" ontslagen',
            f'"{company_name}" ontslag',
            f'"{company_name}" toxic werksfeer',
            f'"{company_name}" reviews glassdoor',
            f'"{company_name}" rechtszaak',
            f'"{company_name}" faillissement',
            f'"{company_name}" problemen medewerkers',
        ]
    
    def categorize_red_flag(self, headline: str, snippet: str) -> Optional[RedFlag]:
        """Analyze search result and categorize as red flag if applicable"""
        text = (headline + " " + snippet).lower()
        
        # Layoffs
        if any(word in text for word in ['ontslag', 'ontslagen', 'afvloei', 'banenverlies']):
            return RedFlag(
                category="layoffs",
                headline=headline,
                source="",
                severity="medium"
            )
        
        # Toxic culture
        if any(word in text for word in ['toxic', 'pestgedrag', 'discriminatie', 'burnout']):
            return RedFlag(
                category="toxic_culture",
                headline=headline,
                source="",
                severity="high"
            )
        
        # Lawsuits
        if any(word in text for word in ['rechtszaak', 'rechter', 'boete', 'fraude']):
            return RedFlag(
                category="lawsuit",
                headline=headline,
                source="",
                severity="high"
            )
        
        # Financial issues
        if any(word in text for word in ['faillissement', 'schulden', 'verlies', 'surseance']):
            return RedFlag(
                category="financial",
                headline=headline,
                source="",
                severity="high"
            )
        
        # Reorganization
        if any(word in text for word in ['reorganisatie', 'herstructurering', 'fusie', 'overname']):
            return RedFlag(
                category="reorganization",
                headline=headline,
                source="",
                severity="medium"
            )
        
        return None
    
    async def search_red_flags(self, company_name: str) -> list[RedFlag]:
        """Search for red flags about the company"""
        red_flags = []
        queries = self.get_red_flag_search_queries(company_name)
        
        # Placeholder - actual implementation would use browser to search
        # and analyze results
        
        return red_flags
    
    # =========================================================================
    # MAIN RECONNAISSANCE FLOW
    # =========================================================================
    
    async def full_reconnaissance(
        self, 
        vacancy_url: str,
        company_name: str,
        job_title: str
    ) -> CompanyIntel:
        """
        Execute full reconnaissance mission.
        
        Returns CompanyIntel with all gathered information.
        """
        intel = CompanyIntel(name=company_name)
        
        # 1. Analyze vacancy page
        vacancy_data = await self.analyze_vacancy_page(vacancy_url)
        
        # 2. Salary forensics
        intel.salary_data = await self.search_salary_data(company_name, job_title)
        
        # 3. Structure scan (from vacancy text + additional searches)
        structure_hints = self.detect_structure_keywords(
            vacancy_data.get("vacancy_text", "") + 
            vacancy_data.get("about_text", "")
        )
        
        # Determine structure type from hints
        if "flat" in structure_hints or "startup" in structure_hints:
            intel.structure_type = "flat"
            intel.work_pace = "fast"
        elif "agile" in structure_hints:
            intel.structure_type = "matrix"  # Agile in corporate = matrix
            intel.work_pace = "moderate"
        elif "matrix" in structure_hints:
            intel.structure_type = "matrix"
            intel.work_pace = "slow"
        elif "hierarchical" in structure_hints:
            intel.structure_type = "hierarchical"
            intel.work_pace = "slow"
        
        intel.culture_indicators = list(structure_hints.keys())
        
        # 4. Red flag search
        intel.red_flags = await self.search_red_flags(company_name)
        
        return intel


# =============================================================================
# Browser Subagent Integration for Antigravity
# =============================================================================

def create_browser_task_for_vacancy(vacancy_url: str) -> str:
    """Create task description for Antigravity browser subagent"""
    return f"""
Navigate to {vacancy_url} and extract the following information:

1. The full vacancy/job description text
2. The company name
3. The job title
4. Any "About Us" or company culture information on the page

Also look for:
- Salary information if mentioned
- Team size or structure hints
- Benefits mentioned

Return a structured summary with all extracted information.
"""


def create_browser_task_for_salary_search(company_name: str, job_title: str) -> str:
    """Create task for salary research"""
    return f"""
Search for salary information for the role "{job_title}" at "{company_name}":

1. Go to glassdoor.nl and search for "{company_name}" salaries
2. Search Google for "{job_title} salaris nederland 2024"
3. Look for any CAO (collective labor agreement) that might apply

For each source found, note:
- Salary range (min-max)
- Source URL
- How recent the data is

Return a summary of salary findings.
"""


def create_browser_task_for_red_flags(company_name: str) -> str:
    """Create task for red flag search"""
    return f"""
Search for potential red flags about "{company_name}":

Search queries to execute:
1. "{company_name} reorganisatie"
2. "{company_name} ontslagen nieuws"
3. "{company_name} reviews werknemers"
4. "{company_name} rechtszaak"

For each search:
- Note any concerning headlines
- Record the source and date
- Assess severity (low/medium/high)

Focus on news from the last 2 years.
Return a list of any red flags found with details.
"""
