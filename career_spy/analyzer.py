"""
The Career Spy - Analyzer
STEP 3: Match & Gap Analysis - Compare candidate with company intel
"""

import json
import re
from typing import Optional

from .models import (
    CandidateProfile, 
    CompanyIntel, 
    CultureMatch,
    SalaryData,
    InterviewQuestion
)
from .prompts import REALITY_CHECK_PROMPT


def parse_json_from_response(response: str) -> dict:
    """Extract JSON from Mistral response"""
    json_match = re.search(r'```(?:json)?\s*\n?(.*?)\n?```', response, re.DOTALL)
    if json_match:
        json_str = json_match.group(1).strip()
    else:
        json_str = response.strip()
    
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse JSON: {e}")


def calculate_structure_match(candidate: CandidateProfile, company: CompanyIntel) -> int:
    """Calculate how well structure preferences match"""
    
    mapping = {
        ("flat", "flat"): 100,
        ("flat", "matrix"): 50,
        ("flat", "hierarchical"): 30,
        ("matrix", "flat"): 60,
        ("matrix", "matrix"): 100,
        ("matrix", "hierarchical"): 70,
        ("hierarchical", "flat"): 40,
        ("hierarchical", "matrix"): 60,
        ("hierarchical", "hierarchical"): 100,
    }
    
    key = (candidate.structure_preference, company.structure_type)
    return mapping.get(key, 50)


def calculate_pace_match(candidate: CandidateProfile, company: CompanyIntel) -> int:
    """Calculate how well work pace matches"""
    
    mapping = {
        ("fast", "fast"): 100,
        ("fast", "moderate"): 70,
        ("fast", "slow"): 30,
        ("moderate", "fast"): 60,
        ("moderate", "moderate"): 100,
        ("moderate", "slow"): 70,
        ("slow", "fast"): 20,
        ("slow", "moderate"): 60,
        ("slow", "slow"): 100,
    }
    
    key = (candidate.work_pace, company.work_pace)
    return mapping.get(key, 50)


def generate_warnings(candidate: CandidateProfile, company: CompanyIntel) -> list[str]:
    """Generate specific warnings based on mismatches"""
    warnings = []
    
    # Structure warnings
    if candidate.structure_preference == "flat" and company.structure_type == "hierarchical":
        warnings.append(
            "⚠️ STRUCTUUR CLASH: Je komt uit een platte organisatie maar dit is een "
            "hiërarchische structuur. Verwacht langere besluitlijnen en minder autonomie."
        )
    
    if candidate.structure_preference == "flat" and company.structure_type == "matrix":
        warnings.append(
            "⚠️ MATRIX ALERT: Matrix-organisaties hebben meerdere rapportagelijnen. "
            "Als je gewend bent aan snelle, directe besluitvorming kan dit frustrerend zijn."
        )
    
    # Pace warnings
    if candidate.work_pace == "fast" and company.work_pace == "slow":
        warnings.append(
            "🐢 TEMPO MISMATCH: Je bent gewend aan een hoog tempo, maar dit lijkt een "
            "langzamere organisatie te zijn. Processen en goedkeuringen kosten meer tijd."
        )
    
    # Autonomy warnings
    if candidate.autonomy_need >= 7 and company.structure_type == "hierarchical":
        warnings.append(
            "🔐 AUTONOMIE RISICO: Je hebt hoge behoefte aan vrijheid (score: "
            f"{candidate.autonomy_need}/10), maar hiërarchische organisaties geven "
            "vaak minder ruimte voor eigen initiatief."
        )
    
    # Builder vs Maintainer
    if candidate.builder_vs_maintainer == "builder":
        if "beheer" in str(company.culture_indicators).lower():
            warnings.append(
                "🏗️ TYPE MISMATCH: Je bent een 'bouwer' die graag nieuwe dingen creëert, "
                "maar deze rol lijkt meer beheer-gericht te zijn."
            )
    
    # Chaos tolerance
    if candidate.chaos_tolerance <= 4 and company.structure_type == "flat":
        warnings.append(
            "🌪️ CHAOS WARNING: Platte organisaties hebben vaak minder structuur en meer "
            f"ambiguïteit. Jouw chaos-tolerantie ({candidate.chaos_tolerance}/10) is laag."
        )
    
    return warnings


def generate_deal_breakers(candidate: CandidateProfile, company: CompanyIntel) -> list[str]:
    """Identify potential deal breakers"""
    deal_breakers = []
    
    # High severity red flags
    critical_flags = [f for f in company.red_flags if f.severity == "high"]
    if len(critical_flags) >= 2:
        deal_breakers.append(
            f"Meerdere ernstige rode vlaggen gevonden ({len(critical_flags)}x)"
        )
    
    # Extreme mismatches
    if candidate.work_pace == "fast" and company.work_pace == "slow":
        if candidate.chaos_tolerance >= 8:
            deal_breakers.append(
                "Extreme tempo-mismatch voor iemand met hoge dynamiek-behoefte"
            )
    
    return deal_breakers


async def analyze_match_with_mistral(
    candidate: CandidateProfile,
    company: CompanyIntel,
    vacancy_url: str,
    job_title: str,
    mistral_client
) -> dict:
    """Use Mistral to perform deep match analysis"""
    
    prompt = REALITY_CHECK_PROMPT.format(
        candidate_profile=json.dumps({
            "name": candidate.name,
            "culture_type": candidate.culture_type,
            "work_pace": candidate.work_pace,
            "structure_preference": candidate.structure_preference,
            "builder_vs_maintainer": candidate.builder_vs_maintainer,
            "chaos_tolerance": candidate.chaos_tolerance,
            "autonomy_need": candidate.autonomy_need,
        }, indent=2),
        company_intel=json.dumps({
            "name": company.name,
            "sector": company.sector,
            "structure_type": company.structure_type,
            "work_pace": company.work_pace,
            "culture_indicators": company.culture_indicators,
            "red_flags_count": len(company.red_flags),
        }, indent=2),
        company_name=company.name,
        job_title=job_title,
        vacancy_url=vacancy_url,
        candidate_structure=candidate.structure_preference,
        company_structure=company.structure_type,
        candidate_pace=candidate.work_pace,
        company_pace=company.work_pace,
    )
    
    response = await mistral_client.chat.complete_async(
        model="mistral-large-latest",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
    )
    
    content = response.choices[0].message.content
    return parse_json_from_response(content)


def perform_match_analysis(
    candidate: CandidateProfile,
    company: CompanyIntel,
) -> CultureMatch:
    """
    Perform culture match analysis without AI.
    Uses rule-based matching as fallback.
    """
    
    structure_match = calculate_structure_match(candidate, company)
    pace_match = calculate_pace_match(candidate, company)
    
    # Simple weighted average
    fit_score = int((structure_match * 0.4) + (pace_match * 0.4) + 50 * 0.2)
    
    # Adjust for red flags
    high_severity_flags = len([f for f in company.red_flags if f.severity == "high"])
    medium_severity_flags = len([f for f in company.red_flags if f.severity == "medium"])
    
    fit_score = max(0, fit_score - (high_severity_flags * 15) - (medium_severity_flags * 5))
    
    # Generate warnings
    warnings = generate_warnings(candidate, company)
    deal_breakers = generate_deal_breakers(candidate, company)
    
    # Determine risk level
    if fit_score >= 70 and len(deal_breakers) == 0:
        risk_level = "low"
    elif fit_score >= 40 and len(deal_breakers) <= 1:
        risk_level = "medium"
    else:
        risk_level = "high"
    
    return CultureMatch(
        fit_score=fit_score,
        warnings=warnings,
        structure_match=structure_match,
        pace_match=pace_match,
        autonomy_match=50,  # Would need more company data
        risk_level=risk_level,
        deal_breakers=deal_breakers,
    )


def generate_interview_questions(
    candidate: CandidateProfile,
    company: CompanyIntel,
    match: CultureMatch
) -> list[InterviewQuestion]:
    """Generate strategic interview questions based on analysis"""
    
    questions = []
    
    # Question about decision making (if structure mismatch)
    if match.structure_match < 70:
        questions.append(InterviewQuestion(
            question="Kun je me door het proces leiden van hoe een belangrijke beslissing "
                    "recent is genomen? Wie was erbij betrokken en hoe lang duurde het?",
            reasoning="Dit onthult de echte besluitvormingsstructuur en snelheid.",
            what_to_listen_for="Let op: als het weken duurde en veel lagen betrokken waren, "
                              "bevestigt dit een trage, hiërarchische cultuur."
        ))
    
    # Question about autonomy
    if candidate.autonomy_need >= 6:
        questions.append(InterviewQuestion(
            question="Hoeveel ruimte zou ik hebben om zelf beslissingen te nemen over mijn werk? "
                    "Kun je een concreet voorbeeld geven?",
            reasoning="Test of de rol voldoende autonomie biedt.",
            what_to_listen_for="Vage antwoorden of 'dat hangt af van...' suggereert beperkte vrijheid."
        ))
    
    # Question about culture/turnover
    questions.append(InterviewQuestion(
        question="Wat is het verloop in dit team geweest het afgelopen jaar? "
                "Waarom zijn mensen vertrokken?",
        reasoning="Hoog verloop is een rode vlag voor cultuurproblemen.",
        what_to_listen_for="Ontwijkende antwoorden of 'carrière-moves' zonder details is suspect."
    ))
    
    # Question about pace
    if match.pace_match < 70:
        questions.append(InterviewQuestion(
            question="Hoe zou je het tempo en de dynamiek van dit team omschrijven? "
                    "Hoe snel veranderen prioriteiten?",
            reasoning="Valideer of het tempo aansluit bij jouw verwachtingen.",
            what_to_listen_for="Vergelijk hun beschrijving met jouw ideale werkritme."
        ))
    
    # Red flag specific question
    if company.red_flags:
        questions.append(InterviewQuestion(
            question="Ik las over [recente verandering/reorganisatie]. "
                    "Hoe heeft dat het team beïnvloed?",
            reasoning="Toets transparantie en eerlijkheid over moeilijke periodes.",
            what_to_listen_for="Defensieve reacties of bagatelliseren is een waarschuwing."
        ))
    
    return questions[:3]  # Return max 3 questions
