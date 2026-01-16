"""
The Career Spy - Configuration
"""

import os
from dataclasses import dataclass


@dataclass
class Config:
    """Application configuration"""
    
    # Mistral AI
    mistral_api_key: str = os.getenv("MISTRAL_API_KEY", "")
    mistral_model: str = "mistral-large-latest"
    
    # Timeouts
    browser_timeout: int = 30  # seconds
    api_timeout: int = 60     # seconds
    
    # Search settings
    max_red_flag_results: int = 10
    max_salary_sources: int = 5
    
    # Output
    report_output_dir: str = "./reports"


# Global config instance
config = Config()
