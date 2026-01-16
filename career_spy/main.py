"""
The Career Spy - Main Orchestrator
End-to-end workflow execution
"""

import asyncio
from datetime import datetime
from pathlib import Path
from typing import Optional

from .models import (
    CandidateProfile,
    CompanyIntel,
    CultureMatch,
    MissionReport,
    SalaryData,
    RedFlag,
    InterviewQuestion
)
from .cv_parser import extract_text_from_file, analyze_cv_sync
from .spy_agent import SpyAgent, create_browser_task_for_vacancy
from .analyzer import perform_match_analysis, generate_interview_questions
from .reporter import generate_mission_report, save_report


class CareerSpy:
    """
    The Career Spy - Main orchestrator class.
    
    Coordinates the 4-step workflow:
    1. Asset Analysis (CV)
    2. Deep Reconnaissance (Browser)
    3. Match Analysis (Mistral)
    4. Mission Report (Artifact)
    """
    
    def __init__(self, mistral_client=None):
        """
        Initialize Career Spy.
        
        Args:
            mistral_client: Mistral AI client instance
        """
        self.mistral = mistral_client
        self.spy_agent = SpyAgent()
        
        # State
        self.candidate_profile: Optional[CandidateProfile] = None
        self.company_intel: Optional[CompanyIntel] = None
        self.mission_report: Optional[MissionReport] = None
    
    # =========================================================================
    # STEP 1: Asset Analysis
    # =========================================================================
    
    def analyze_cv(self, cv_path: str) -> CandidateProfile:
        """
        Step 1: Parse CV and create organizational profile.
        
        Args:
            cv_path: Path to CV file (PDF or text)
            
        Returns:
            CandidateProfile with cultural DNA analysis
        """
        print("📄 STEP 1: Asset Analysis - Analyzing CV...")
        
        # Extract text
        cv_text = extract_text_from_file(cv_path)
        print(f"   ✓ Extracted {len(cv_text)} characters from CV")
        
        # Analyze with Mistral if available
        if self.mistral:
            self.candidate_profile = analyze_cv_sync(cv_text, self.mistral)
            print(f"   ✓ Profile built: {self.candidate_profile.culture_type} type")
        else:
            # Fallback: create basic profile
            self.candidate_profile = CandidateProfile(
                raw_analysis=cv_text,
                culture_type="corporate",  # Default assumption
            )
            print("   ⚠️ No Mistral client - using default profile")
        
        return self.candidate_profile
    
    def set_candidate_profile(self, profile: CandidateProfile):
        """Manually set candidate profile (for testing)"""
        self.candidate_profile = profile
    
    # =========================================================================
    # STEP 2: Deep Reconnaissance
    # =========================================================================
    
    async def deep_reconnaissance(
        self,
        vacancy_url: str,
        company_name: str,
        job_title: str
    ) -> CompanyIntel:
        """
        Step 2: Gather intelligence about the target company.
        
        This would normally use the browser agent for:
        - Salary forensics
        - Structure scan  
        - Red flag search
        
        Args:
            vacancy_url: URL of the vacancy
            company_name: Name of the company
            job_title: Job title
            
        Returns:
            CompanyIntel with gathered intelligence
        """
        print("🕵️ STEP 2: Deep Reconnaissance...")
        
        self.company_intel = await self.spy_agent.full_reconnaissance(
            vacancy_url=vacancy_url,
            company_name=company_name,
            job_title=job_title
        )
        
        print(f"   ✓ Structure type: {self.company_intel.structure_type}")
        print(f"   ✓ Red flags found: {len(self.company_intel.red_flags)}")
        
        return self.company_intel
    
    def set_company_intel(self, intel: CompanyIntel):
        """Manually set company intel (for testing or manual input)"""
        self.company_intel = intel
    
    # =========================================================================
    # STEP 3: Match Analysis
    # =========================================================================
    
    def analyze_match(self) -> CultureMatch:
        """
        Step 3: Compare candidate profile with company intel.
        
        Returns:
            CultureMatch analysis with fit score and warnings
        """
        print("🔍 STEP 3: Match Analysis...")
        
        if not self.candidate_profile:
            raise ValueError("No candidate profile. Run analyze_cv first.")
        if not self.company_intel:
            raise ValueError("No company intel. Run deep_reconnaissance first.")
        
        match = perform_match_analysis(
            candidate=self.candidate_profile,
            company=self.company_intel
        )
        
        print(f"   ✓ Fit score: {match.fit_score}%")
        print(f"   ✓ Risk level: {match.risk_level}")
        print(f"   ✓ Warnings: {len(match.warnings)}")
        
        return match
    
    # =========================================================================
    # STEP 4: Generate Mission Report
    # =========================================================================
    
    def generate_report(
        self,
        vacancy_url: str,
        job_title: str,
        output_dir: str = "."
    ) -> str:
        """
        Step 4: Generate the Mission Report artifact.
        
        Args:
            vacancy_url: URL of the vacancy
            job_title: Job title
            output_dir: Directory to save report
            
        Returns:
            Path to the generated report
        """
        print("📋 STEP 4: Generating Mission Report...")
        
        if not self.candidate_profile:
            raise ValueError("No candidate profile")
        if not self.company_intel:
            raise ValueError("No company intel")
        
        # Perform match analysis
        match = perform_match_analysis(
            candidate=self.candidate_profile,
            company=self.company_intel
        )
        
        # Generate interview questions
        questions = generate_interview_questions(
            candidate=self.candidate_profile,
            company=self.company_intel,
            match=match
        )
        
        # Create report
        self.mission_report = MissionReport(
            company_name=self.company_intel.name,
            job_title=job_title,
            vacancy_url=vacancy_url,
            candidate_profile=self.candidate_profile,
            company_intel=self.company_intel,
            culture_match=match,
            salary_prediction=self.company_intel.salary_data,
            red_flags=self.company_intel.red_flags,
            interview_questions=questions,
            generated_at=datetime.now()
        )
        
        # Generate markdown
        report_markdown = generate_mission_report(self.mission_report)
        
        # Save to file
        output_path = save_report(self.mission_report, output_dir)
        
        print(f"   ✓ Report saved to: {output_path}")
        print(f"   📊 Overall verdict: {self.mission_report.overall_verdict.upper()}")
        
        return output_path
    
    # =========================================================================
    # FULL MISSION
    # =========================================================================
    
    async def run_full_mission(
        self,
        cv_path: str,
        vacancy_url: str,
        company_name: str,
        job_title: str,
        output_dir: str = "."
    ) -> str:
        """
        Execute the full Career Spy mission.
        
        Args:
            cv_path: Path to candidate's CV
            vacancy_url: URL of the vacancy
            company_name: Name of the target company
            job_title: Job title
            output_dir: Directory to save report
            
        Returns:
            Path to the generated Mission Report
        """
        print("=" * 60)
        print("🕵️ THE CAREER SPY - MISSION STARTED")
        print("=" * 60)
        print(f"Target: {company_name}")
        print(f"Role: {job_title}")
        print("=" * 60 + "\n")
        
        # Step 1: Analyze CV
        self.analyze_cv(cv_path)
        print()
        
        # Step 2: Deep Reconnaissance
        await self.deep_reconnaissance(
            vacancy_url=vacancy_url,
            company_name=company_name,
            job_title=job_title
        )
        print()
        
        # Step 3 & 4: Analyze and Generate Report
        report_path = self.generate_report(
            vacancy_url=vacancy_url,
            job_title=job_title,
            output_dir=output_dir
        )
        
        print("\n" + "=" * 60)
        print("🎯 MISSION COMPLETE")
        print("=" * 60)
        
        return report_path


# =============================================================================
# Convenience function for quick runs
# =============================================================================

def run_career_spy(
    cv_path: str,
    vacancy_url: str,
    company_name: str,
    job_title: str,
    output_dir: str = ".",
    mistral_client=None
) -> str:
    """
    Run The Career Spy mission.
    
    Args:
        cv_path: Path to CV file
        vacancy_url: URL of vacancy
        company_name: Company name
        job_title: Job title
        output_dir: Where to save report
        mistral_client: Optional Mistral AI client
        
    Returns:
        Path to generated report
    """
    spy = CareerSpy(mistral_client=mistral_client)
    return asyncio.run(spy.run_full_mission(
        cv_path=cv_path,
        vacancy_url=vacancy_url,
        company_name=company_name,
        job_title=job_title,
        output_dir=output_dir
    ))
