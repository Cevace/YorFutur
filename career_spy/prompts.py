"""
The Career Spy - Mistral AI Prompts
All prompts used for AI analysis
"""

# =============================================================================
# STEP 1: CV ANALYSIS PROMPT
# =============================================================================

CV_ANALYSIS_PROMPT = """Je bent een senior HR-psycholoog gespecialiseerd in organisatiecultuur en carrière-matching.

Analyseer het volgende CV en maak een diepgaand organisatorisch profiel van deze kandidaat.

## CV TEKST:
{cv_text}

## ANALYSE INSTRUCTIES:

### 1. CULTURELE BLOEDGROEP
Bepaal welk type organisatie het beste bij deze kandidaat past op basis van hun werkgeschiedenis:

- **startup**: Kleine teams, chaos, snelheid, veel eigenaarschap, weinig processen
- **scale-up**: Groeiend bedrijf, processen opbouwen, dynamisch maar met structuur
- **corporate**: Grote organisatie, matrix, politiek, stabiliteit, langzame besluitvorming  
- **agency**: Klantgericht werk, deadlines, variatie in projecten
- **nonprofit**: Missiegedreven, consensus, vaak langzame besluitvorming

Let op deze signalen:
- Bedrijfsnamen: Herken je startups vs grote corporates?
- Functietitels: "Eigenaar van..." vs "Onderdeel van team..."
- Verblijfsduur: Kort (1-2 jaar) = startup-minded, Lang (5+ jaar) = corporate-minded
- Sector: Tech/startup ecosystem vs traditionele sectoren

### 2. WERKTEMPO & STRUCTUUR
- **work_pace**: "fast" / "moderate" / "slow" - Hoe snel werkte deze persoon?
- **structure_preference**: "flat" / "matrix" / "hierarchical" - Welke structuur past?

### 3. PERSOONLIJKHEIDSTYPE
- **builder**: Maakt nieuwe dingen, start projecten op, pioniert
- **optimizer**: Verbetert bestaande processen, efficiency
- **maintainer**: Houdt systemen draaiende, stabiliteit, beheer

### 4. TOLERANTIES (schaal 1-10)
- **chaos_tolerance**: Kan omgaan met onduidelijkheid en verandering
- **autonomy_need**: Hoeveel vrijheid en zelfstandigheid nodig

## OUTPUT FORMAT (JSON):
```json
{
    "name": "Naam van kandidaat",
    "skills": ["skill1", "skill2", "skill3"],
    "experience_years": 5,
    "culture_type": "startup|scale-up|corporate|agency|nonprofit",
    "work_pace": "fast|moderate|slow",
    "structure_preference": "flat|matrix|hierarchical",
    "builder_vs_maintainer": "builder|optimizer|maintainer",
    "chaos_tolerance": 7,
    "autonomy_need": 8,
    "reasoning": "Korte uitleg waarom je deze classificatie hebt gemaakt"
}
```

Geef ALLEEN de JSON output, geen andere tekst."""


# =============================================================================
# STEP 3: REALITY CHECK / MATCH ANALYSIS PROMPT
# =============================================================================

REALITY_CHECK_PROMPT = """Je bent een career intelligence analyst die kandidaten beschermt tegen slechte job matches.

## KANDIDAAT PROFIEL:
{candidate_profile}

## BEDRIJFS INTELLIGENCE:
{company_intel}

## VACATURE INFO:
Bedrijf: {company_name}
Functie: {job_title}
URL: {vacancy_url}

## ANALYSE OPDRACHT:

### A. CULTURE CLASH ANALYSE
Vergelijk het kandidaatprofiel met de bedrijfsintelligentie:

1. **Structuur Match**:
   - Kandidaat voorkeur: {candidate_structure} 
   - Bedrijf structuur: {company_structure}
   - Geef score 0-100

2. **Tempo Match**:
   - Kandidaat tempo: {candidate_pace}
   - Bedrijf tempo: {company_pace}
   - Geef score 0-100

3. **Type Match** (builder/maintainer):
   - Is dit een bouwers-rol of een beheer-rol?
   - Past dit bij de kandidaat?

### B. SPECIFIEKE WAARSCHUWINGEN
Genereer waarschuwingen voor risicovolle mismatches:

Voorbeelden:
- "Je komt uit een platte startup-omgeving. Dit is een matrix-organisatie waar besluitvorming via meerdere lagen gaat. Verwacht 3-4x langere doorlooptijd voor beslissingen."
- "Je bent een builder, maar deze rol lijkt vooral beheer te zijn. Je creativiteit kan gefrustreerd raken."
- "Je hebt hoge autonomy_need (8/10), maar dit bedrijf heeft 'strict management' in reviews. Potentiële clash."

### C. SALARIS REALITEIT
Combineer de verzamelde salary data en geef een realistische inschatting.

### D. INTERVIEW VRAGEN
Genereer 3 scherpe vragen die de kandidaat moet stellen om de cultuur te testen:
- Focus op het blootleggen van rode vlaggen
- Vraag naar concrete voorbeelden, niet algemene statements
- Test de waarschuwingen die je hebt geïdentificeerd

## OUTPUT FORMAT (JSON):
```json
{
    "fit_score": 65,
    "risk_level": "low|medium|high",
    "structure_match": 70,
    "pace_match": 50,
    "type_match": 80,
    "warnings": [
        {
            "type": "culture_clash|pace_mismatch|autonomy_conflict|growth_concern",
            "severity": "low|medium|high",
            "message": "Gedetailleerde waarschuwing in het Nederlands"
        }
    ],
    "deal_breakers": ["Lijst van absolute no-gos als die er zijn"],
    "salary_prediction": {
        "min": 3500,
        "max": 4500,
        "confidence": 70,
        "reasoning": "Uitleg"
    },
    "interview_questions": [
        {
            "question": "De vraag in het Nederlands",
            "reasoning": "Waarom deze vraag belangrijk is",
            "what_to_listen_for": "Waar moet de kandidaat op letten in het antwoord"
        }
    ],
    "overall_assessment": "Korte samenvatting van de match in 2-3 zinnen"
}
```

Geef ALLEEN de JSON output, geen andere tekst."""


# =============================================================================
# COMPANY ANALYSIS PROMPT (for vacancy page)
# =============================================================================

VACANCY_ANALYSIS_PROMPT = """Analyseer de volgende vacaturetekst en bedrijfsinformatie.

## VACATURE TEKST:
{vacancy_text}

## BEDRIJF OVER ONS (indien beschikbaar):
{about_text}

## ANALYSE OPDRACHT:

Bepaal de volgende zaken:

1. **Sector**: In welke sector opereert dit bedrijf?
2. **Structuur Type**: 
   - "flat" = Platte organisatie, weinig lagen
   - "matrix" = Matrix structuur, meerdere rapportagelijnen
   - "hierarchical" = Traditionele hiërarchie
   
   Let op keywords: "agile", "squads", "tribes" = modern/flat
   "afdelingen", "business units", "matrix" = corporate
   
3. **Werktempo**:
   - "fast" = Startup-achtig, snel schakelen
   - "moderate" = Normaal tempo
   - "slow" = Grote organisatie, veel overleg
   
4. **Cultuur Indicatoren**: Welke woorden/zinnen geven cultuur hints?

5. **Rol Type**: Is dit een bouwers-rol of beheer-rol?

## OUTPUT FORMAT (JSON):
```json
{
    "company_name": "Naam",
    "sector": "Sector",
    "structure_type": "flat|matrix|hierarchical|unknown",
    "work_pace": "fast|moderate|slow|unknown",
    "culture_indicators": ["indicator1", "indicator2"],
    "role_type": "builder|optimizer|maintainer",
    "key_requirements": ["requirement1", "requirement2"],
    "reasoning": "Uitleg van je analyse"
}
```

Geef ALLEEN de JSON output."""
