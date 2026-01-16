"""
The Career Spy - Report Generator
STEP 4: Generate the Mission Report artifact
"""

from datetime import datetime
from typing import Optional

from .models import (
    MissionReport, 
    CandidateProfile, 
    CompanyIntel, 
    CultureMatch,
    RedFlag,
    InterviewQuestion,
    SalaryData
)


def get_verdict_emoji(verdict: str) -> str:
    """Get emoji for overall verdict"""
    return {
        "green": "🟢",
        "yellow": "🟡", 
        "red": "🔴"
    }.get(verdict, "⚪")


def get_score_emoji(score: int) -> str:
    """Get emoji based on score"""
    if score >= 80:
        return "🎯"
    elif score >= 60:
        return "✅"
    elif score >= 40:
        return "⚠️"
    else:
        return "🚨"


def get_match_bar(score: int) -> str:
    """Create a visual match bar"""
    filled = int(score / 10)
    empty = 10 - filled
    return f"{'█' * filled}{'░' * empty} {score}%"


def get_severity_emoji(severity: str) -> str:
    """Get emoji for severity level"""
    return {
        "low": "🟡",
        "medium": "🟠",
        "high": "🔴"
    }.get(severity, "⚪")


def format_salary(amount: int, period: str = "month") -> str:
    """Format salary for display"""
    if period == "year":
        return f"€{amount:,}/jaar"
    return f"€{amount:,}/maand"


def generate_financial_section(report: MissionReport) -> str:
    """Generate the Financial Intelligence section"""
    salary = report.salary_prediction
    
    section = """## 💰 Financial Intelligence

"""
    
    if salary.min_salary > 0:
        section += f"""**Geschat Salaris:** {format_salary(salary.min_salary)} - {format_salary(salary.max_salary)}
**Betrouwbaarheid:** {salary.confidence}%

"""
    else:
        section += """**Salaris:** Onbekend - geen data gevonden

> 💡 **Tip:** Vraag naar de salarisbandbreedte in het eerste gesprek. 
> "Welke range hanteren jullie voor deze functie?"

"""
    
    # CAO info
    if salary.cao_scale:
        section += f"""**CAO Status:** ✅ Ja - {salary.cao_scale}
> CAO biedt bescherming: minimumloon, vakantiedagen, pensioen zijn geregeld.

"""
    else:
        section += """**CAO Status:** ❌ Geen CAO gevonden
> ⚠️ Let op: zonder CAO is alles onderhandelbaar. Wees scherp op secundaire voorwaarden!

"""
    
    # Market position
    if salary.market_position == "below_market":
        section += """**Marktpositie:** 📉 Onder marktgemiddelde
> Dit salaris lijkt onder het gemiddelde voor vergelijkbare functies.

"""
    elif salary.market_position == "above_market":
        section += """**Marktpositie:** 📈 Boven marktgemiddelde
> Goed nieuws: dit lijkt een competitief salaris te zijn.

"""
    
    return section


def generate_culture_section(report: MissionReport) -> str:
    """Generate the Culture Shock Warning section"""
    match = report.culture_match
    candidate = report.candidate_profile
    company = report.company_intel
    
    score_emoji = get_score_emoji(match.fit_score)
    
    section = f"""## ⚠️ Culture Shock Warning

**Fit Score:** {score_emoji} {match.fit_score}%

{get_match_bar(match.fit_score)}

### Jouw Profiel vs. Dit Bedrijf

| Aspect | 👤 Jij | 🏢 Bedrijf | Match |
|--------|--------|-----------|-------|
| Structuur | {candidate.structure_preference.capitalize()} | {company.structure_type.capitalize()} | {get_match_bar(match.structure_match)} |
| Tempo | {candidate.work_pace.capitalize()} | {company.work_pace.capitalize()} | {get_match_bar(match.pace_match)} |
| Type | {candidate.builder_vs_maintainer.capitalize()} | - | - |

"""
    
    # Cultural DNA
    section += f"""### 🧬 Jouw Culturele DNA
- **Cultuurtype:** {candidate.culture_type.upper()}
- **Chaos Tolerantie:** {"🔥" * min(candidate.chaos_tolerance, 10)} ({candidate.chaos_tolerance}/10)
- **Autonomie Behoefte:** {"⭐" * min(candidate.autonomy_need, 10)} ({candidate.autonomy_need}/10)

"""
    
    # Warnings
    if match.warnings:
        section += """### ⚡ Kritieke Waarschuwingen

"""
        for warning in match.warnings:
            section += f"{warning}\n\n"
    
    # Deal breakers
    if match.deal_breakers:
        section += """### 🛑 Potentiële Deal Breakers

"""
        for db in match.deal_breakers:
            section += f"- **{db}**\n"
        section += "\n"
    
    return section


def generate_spy_section(report: MissionReport) -> str:
    """Generate The Spy Report section"""
    red_flags = report.red_flags
    
    section = """## 🕵️‍♂️ The Spy Report

"""
    
    if not red_flags:
        section += """### ✅ Geen grote rode vlaggen gevonden

De zoektocht naar negatief nieuws, reorganisaties, en werknemersklachten 
leverde geen zorgwekkende resultaten op.

> **Let op:** Dit betekent niet dat er geen problemen zijn - alleen dat ze 
> niet publiekelijk zichtbaar zijn. Stel altijd kritische vragen.

"""
    else:
        section += f"""### 🚩 {len(red_flags)} Rode Vlag(gen) Gevonden

"""
        for flag in red_flags:
            emoji = get_severity_emoji(flag.severity)
            section += f"""#### {emoji} {flag.headline}
- **Categorie:** {flag.category.replace("_", " ").title()}
- **Ernst:** {flag.severity.upper()}
- **Bron:** {flag.source or "Zoekresultaat"}
"""
            if flag.date:
                section += f"- **Datum:** {flag.date}\n"
            if flag.url:
                section += f"- **Link:** {flag.url}\n"
            section += "\n"
    
    return section


def generate_interview_section(report: MissionReport) -> str:
    """Generate the Interview Ammo section"""
    questions = report.interview_questions
    
    section = """## 🎯 Interview Ammo

Stel deze vragen om de cultuur te testen:

"""
    
    for i, q in enumerate(questions, 1):
        section += f"""### Vraag {i}
> **"{q.question}"**

**Waarom stellen:** {q.reasoning}

**Let hierop:** {q.what_to_listen_for}

---

"""
    
    return section


def generate_mission_report(report: MissionReport) -> str:
    """
    Generate the complete Mission Report as Markdown.
    
    This is the final artifact delivered to the user.
    """
    
    verdict = report.overall_verdict
    verdict_emoji = get_verdict_emoji(verdict)
    
    verdict_text = {
        "green": "Waarschijnlijk een goede match",
        "yellow": "Voorzichtig optimistisch - let op de waarschuwingen",
        "red": "Hoge risico's - overweeg alternatieven"
    }.get(verdict, "Onbekend")
    
    # Header
    markdown = f"""# 🕵️ THE CAREER SPY
## Mission Report

**Target:** {report.company_name}
**Rol:** {report.job_title}
**URL:** {report.vacancy_url}

---

## 📊 Executive Summary

**Overall Verdict:** {verdict_emoji} {verdict_text}

| Metric | Score |
|--------|-------|
| Culture Fit | {report.culture_match.fit_score}% |
| Risk Level | {report.culture_match.risk_level.upper()} |
| Red Flags | {len(report.red_flags)} |

---

"""
    
    # Add sections
    markdown += generate_financial_section(report)
    markdown += "---\n\n"
    
    markdown += generate_culture_section(report)
    markdown += "---\n\n"
    
    markdown += generate_spy_section(report)
    markdown += "---\n\n"
    
    markdown += generate_interview_section(report)
    
    # Footer
    markdown += f"""---

*Generated by The Career Spy*
*{report.generated_at.strftime("%Y-%m-%d %H:%M")}*

> 🔒 Dit rapport is vertrouwelijk en alleen voor jou bedoeld.
> Gebruik je eigen oordeel om de uiteindelijke beslissing te nemen.
"""
    
    return markdown


def save_report(report: MissionReport, output_dir: str = ".") -> str:
    """Save report to file and return path"""
    from pathlib import Path
    
    # Generate filename
    safe_company = "".join(c for c in report.company_name if c.isalnum() or c in " -_")[:30]
    timestamp = report.generated_at.strftime("%Y%m%d_%H%M")
    filename = f"career_spy_report_{safe_company}_{timestamp}.md"
    
    # Generate markdown
    markdown = generate_mission_report(report)
    
    # Save
    output_path = Path(output_dir) / filename
    output_path.write_text(markdown, encoding="utf-8")
    
    return str(output_path)
