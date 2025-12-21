'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Clock, ChevronRight, ArrowLeft, RefreshCw, Info } from 'lucide-react';
import AbstractMatrix, { ShapeRenderer, ShapeCell } from './AbstractMatrix';

// Types
interface Question {
    id: string;
    type: string;
    question: string;
    context: string;
    options: string[] | ShapeCell[];
    correct_answer: number;
    explanation?: string;
    difficulty_index?: number;
    grid?: (ShapeCell | null)[];
}

interface AnswerRecord {
    question_id: string;
    selected_answer: number;
    correct_answer: number;
    time_taken: number;
    difficulty_index: number;
}

interface AssessmentResult {
    raw_score: number;
    total_questions: number;
    sten_score: number;
    percentile: number;
    interpretation: string;
    feedback: string[];
    competencies: {
        accuracy: number;
        speed: number;
        difficulty_handling: number;
    };
    duration_seconds: number;
}

type AssessmentMode = 'drill' | 'exam';
type AssessmentCategory = 'abstract' | 'verbal' | 'numerical' | 'logical' | 'sequences' | 'analogies';

interface AssessmentRunnerProps {
    type: AssessmentCategory;
    mode: AssessmentMode;
    onComplete: (results: AssessmentResult, category: string) => void;
    onExit: () => void;
}

// Helper to create shape cells
const createShape = (type: string, fill: string = "solid", rotation: number = 0, color: string = "#1e3a8a", count: number = 1): ShapeCell => ({
    type: type as ShapeCell['type'],
    fill: fill as ShapeCell['fill'],
    rotation,
    color,
    count
});

// Question banks for all 6 categories
const QUESTION_BANKS: Record<AssessmentCategory, Question[]> = {
    abstract: [
        {
            id: 'abstract-1',
            type: 'Abstract Reasoning',
            question: 'Welk figuur volgt logischerwijs in de reeks?',
            context: 'Het patroon roteert met de klok mee (90°) per rij, en de vulling wisselt.',
            grid: [
                createShape("square", "solid", 0),
                createShape("square", "solid", 90),
                createShape("square", "solid", 180),
                createShape("square", "outline", 0),
                createShape("square", "outline", 90),
                createShape("square", "outline", 180),
                createShape("square", "striped", 0),
                createShape("square", "striped", 90),
                null
            ],
            options: [
                createShape("square", "striped", 180),
                createShape("square", "solid", 270),
                createShape("circle", "striped", 180),
                createShape("square", "outline", 270)
            ],
            correct_answer: 0,
            explanation: 'Het patroon toont rotatie met 90° per cel en vulling verandert per rij.',
            difficulty_index: 0.65,
        },
        {
            id: 'abstract-2',
            type: 'Abstract Reasoning',
            question: 'Welk figuur hoort op de lege plek?',
            context: 'De vorm verandert per kolom, de kleur blijft per rij gelijk.',
            grid: [
                createShape("circle", "solid", 0, "#1e3a8a"),
                createShape("square", "solid", 0, "#1e3a8a"),
                createShape("triangle", "solid", 0, "#1e3a8a"),
                createShape("circle", "solid", 0, "#d97706"),
                createShape("square", "solid", 0, "#d97706"),
                createShape("triangle", "solid", 0, "#d97706"),
                createShape("circle", "solid", 0, "#10b981"),
                createShape("square", "solid", 0, "#10b981"),
                null
            ],
            options: [
                createShape("triangle", "solid", 0, "#10b981"),
                createShape("circle", "solid", 0, "#10b981"),
                createShape("triangle", "solid", 0, "#d97706"),
                createShape("diamond", "solid", 0, "#10b981")
            ],
            correct_answer: 0,
            explanation: 'Elke rij heeft dezelfde kleur, elke kolom dezelfde vorm.',
            difficulty_index: 0.55,
        },
        {
            id: 'abstract-3',
            type: 'Abstract Reasoning',
            question: 'Wat is het volgende figuur in de matrix?',
            context: 'Het aantal vormen neemt toe per cel (1 → 2 → 3).',
            grid: [
                createShape("circle", "solid", 0, "#1e3a8a", 1),
                createShape("circle", "solid", 0, "#1e3a8a", 2),
                createShape("circle", "solid", 0, "#1e3a8a", 3),
                createShape("circle", "outline", 0, "#1e3a8a", 1),
                createShape("circle", "outline", 0, "#1e3a8a", 2),
                createShape("circle", "outline", 0, "#1e3a8a", 3),
                createShape("circle", "striped", 0, "#1e3a8a", 1),
                createShape("circle", "striped", 0, "#1e3a8a", 2),
                null
            ],
            options: [
                createShape("circle", "striped", 0, "#1e3a8a", 3),
                createShape("circle", "solid", 0, "#1e3a8a", 3),
                createShape("square", "striped", 0, "#1e3a8a", 3),
                createShape("circle", "striped", 0, "#1e3a8a", 1)
            ],
            correct_answer: 0,
            explanation: 'Het patroon toont toenemend aantal cirkels per rij.',
            difficulty_index: 0.75,
        },
    ],
    verbal: [
        {
            id: 'verbal-1',
            type: 'Verbal Reasoning',
            question: 'Stelling: De winst van TechCorp steeg in 2024 door de toename in online verkoop.',
            context: 'In 2024 zag TechCorp een verschuiving in consumentengedrag. Hoewel de online verkoop steeg met 20%, daalde de winstmarge door toegenomen logistieke kosten en retourzendingen. Het management besloot te investeren in AI-gedreven retourbeheer.',
            options: ['Waar', 'Niet Waar', 'Niet te zeggen'],
            correct_answer: 1,
            explanation: 'Niet Waar. De tekst stelt dat de winstmarge daalde ondanks de stijging in verkoop.',
            difficulty_index: 0.55,
        },
        {
            id: 'verbal-2',
            type: 'Verbal Reasoning',
            question: 'Stelling: Het management van TechCorp zag retourbeheer als een prioriteit.',
            context: 'In 2024 zag TechCorp een verschuiving in consumentengedrag. Hoewel de online verkoop steeg met 20%, daalde de winstmarge door toegenomen logistieke kosten en retourzendingen. Het management besloot te investeren in AI-gedreven retourbeheer.',
            options: ['Waar', 'Niet Waar', 'Niet te zeggen'],
            correct_answer: 0,
            explanation: 'Waar. De tekst vermeldt dat het management besloot te investeren in retourbeheer.',
            difficulty_index: 0.45,
        },
        {
            id: 'verbal-3',
            type: 'Verbal Reasoning',
            question: 'Stelling: De logistieke kosten waren hoger dan verwacht.',
            context: 'In 2024 zag TechCorp een verschuiving in consumentengedrag. Hoewel de online verkoop steeg met 20%, daalde de winstmarge door toegenomen logistieke kosten en retourzendingen. Het management besloot te investeren in AI-gedreven retourbeheer.',
            options: ['Waar', 'Niet Waar', 'Niet te zeggen'],
            correct_answer: 2,
            explanation: 'Niet te zeggen. De tekst noemt niet of de kosten hoger waren dan verwacht.',
            difficulty_index: 0.60,
        },
    ],
    numerical: [
        {
            id: 'numerical-1',
            type: 'Numerical Reasoning',
            question: 'Wat is de procentuele verandering van Q1 naar Q2 (afgerond)?',
            context: 'Kwartaalomzet TechCorp 2024:\n\n• Q1: €120.000\n• Q2: €145.000\n• Q3: €110.000\n• Q4: €160.000\n\nTotale jaaromzet: €535.000',
            options: ['+15%', '+21%', '+25%', '+18%'],
            correct_answer: 1,
            explanation: 'Berekening: ((145.000 - 120.000) / 120.000) × 100 = 20.83% ≈ 21%',
            difficulty_index: 0.55,
        },
        {
            id: 'numerical-2',
            type: 'Numerical Reasoning',
            question: 'Welk kwartaal had de grootste procentuele stijging?',
            context: 'Kwartaalomzet TechCorp 2024:\n\n• Q1: €120.000\n• Q2: €145.000\n• Q3: €110.000\n• Q4: €160.000\n\nTotale jaaromzet: €535.000',
            options: ['Q2 (+21%)', 'Q3 (-24%)', 'Q4 (+45%)', 'Q1 (n.v.t.)'],
            correct_answer: 2,
            explanation: 'Q4: ((160.000 - 110.000) / 110.000) × 100 = 45.45%',
            difficulty_index: 0.70,
        },
        {
            id: 'numerical-3',
            type: 'Numerical Reasoning',
            question: 'Hoeveel procent van de jaaromzet komt uit Q4?',
            context: 'Kwartaalomzet TechCorp 2024:\n\n• Q1: €120.000\n• Q2: €145.000\n• Q3: €110.000\n• Q4: €160.000\n\nTotale jaaromzet: €535.000',
            options: ['25%', '30%', '35%', '28%'],
            correct_answer: 1,
            explanation: 'Berekening: (160.000 / 535.000) × 100 = 29.9% ≈ 30%',
            difficulty_index: 0.50,
        },
    ],
    logical: [
        {
            id: 'logical-1',
            type: 'Logical Deduction',
            question: 'Welke conclusie is ZEKER waar?',
            context: 'Premisse 1: Alle managers hebben een laptop.\nPremisse 2: Jan is een manager.\nPremisse 3: Sommige managers hebben ook een tablet.',
            options: ['Jan heeft een tablet', 'Jan heeft een laptop', 'Alle laptopbezitters zijn managers', 'Jan heeft geen tablet'],
            correct_answer: 1,
            explanation: 'Uit premisse 1 en 2 volgt logisch dat Jan een laptop heeft.',
            difficulty_index: 0.45,
        },
        {
            id: 'logical-2',
            type: 'Logical Deduction',
            question: 'Welke stelling is ONWAAR?',
            context: 'Als het regent, dan is de straat nat.\nDe straat is nat.\n\nNoot: Er kunnen ook andere oorzaken zijn voor een natte straat.',
            options: ['Het kan geregend hebben', 'Het moet geregend hebben', 'De straat kan door sproeiers nat zijn', 'We kunnen niet zeker zijn of het regende'],
            correct_answer: 1,
            explanation: 'Dit is de "affirming the consequent" fout. Een natte straat bewijst niet dat het regende.',
            difficulty_index: 0.65,
        },
        {
            id: 'logical-3',
            type: 'Logical Deduction',
            question: 'Welke conclusie volgt logisch?',
            context: 'Geen enkele consultant werkt parttime.\nSommige werknemers werken parttime.\n\nConclusie: ...',
            options: ['Alle werknemers zijn consultants', 'Geen enkele werknemer is consultant', 'Sommige werknemers zijn geen consultants', 'Alle consultants zijn werknemers'],
            correct_answer: 2,
            explanation: 'Aangezien sommige werknemers parttime werken en geen consultant parttime werkt, zijn die werknemers geen consultants.',
            difficulty_index: 0.70,
        },
    ],
    sequences: [
        {
            id: 'sequences-1',
            type: 'Number Sequences',
            question: 'Wat is het volgende getal in de reeks?',
            context: '2, 4, 8, 16, 32, ?',
            options: ['48', '64', '56', '36'],
            correct_answer: 1,
            explanation: 'Elk getal is het vorige × 2. 32 × 2 = 64',
            difficulty_index: 0.35,
        },
        {
            id: 'sequences-2',
            type: 'Number Sequences',
            question: 'Wat is het volgende getal in de reeks?',
            context: '1, 1, 2, 3, 5, 8, 13, ?',
            options: ['18', '21', '19', '15'],
            correct_answer: 1,
            explanation: 'Fibonacci reeks: elk getal is de som van de twee voorgaande. 8 + 13 = 21',
            difficulty_index: 0.50,
        },
        {
            id: 'sequences-3',
            type: 'Number Sequences',
            question: 'Wat is het ontbrekende getal?',
            context: '3, 6, 11, 18, ?, 38',
            options: ['25', '27', '26', '24'],
            correct_answer: 1,
            explanation: 'Het patroon is +3, +5, +7, +9, +11. Na 18: 18 + 9 = 27',
            difficulty_index: 0.60,
        },
    ],
    analogies: [
        {
            id: 'analogies-1',
            type: 'Verbal Analogies',
            question: 'Vogel staat tot vleugel als vis staat tot ...',
            context: 'Een vogel gebruikt vleugels om te bewegen. Wat gebruikt een vis?',
            options: ['Schub', 'Vin', 'Staart', 'Kieuw'],
            correct_answer: 1,
            explanation: 'Zoals een vogel vleugels gebruikt om te vliegen, gebruikt een vis vinnen om te zwemmen.',
            difficulty_index: 0.40,
        },
        {
            id: 'analogies-2',
            type: 'Verbal Analogies',
            question: 'Chirurg staat tot scalpel als timmerman staat tot ...',
            context: 'Een chirurg gebruikt een scalpel als gereedschap. Wat is het primaire gereedschap van een timmerman?',
            options: ['Schroef', 'Hamer', 'Spijker', 'Lat'],
            correct_answer: 1,
            explanation: 'Zoals een chirurg een scalpel als primair gereedschap heeft, is dat voor een timmerman de hamer.',
            difficulty_index: 0.45,
        },
        {
            id: 'analogies-3',
            type: 'Verbal Analogies',
            question: 'Auteur staat tot roman als componist staat tot ...',
            context: 'Een auteur creëert een roman. Wat creëert een componist?',
            options: ['Muziek', 'Symfonie', 'Noten', 'Concert'],
            correct_answer: 1,
            explanation: 'Zoals een auteur een complete roman schrijft, componeert een componist een complete symfonie.',
            difficulty_index: 0.55,
        },
    ],
};

// Get random question from category
const getRandomQuestion = (category: AssessmentCategory): Question => {
    const questions = QUESTION_BANKS[category];
    const randomIndex = Math.floor(Math.random() * questions.length);
    return { ...questions[randomIndex], id: `${category}-${Date.now()}-${randomIndex}` };
};

// Check if options are shape objects
const isShapeOptions = (options: string[] | ShapeCell[]): options is ShapeCell[] => {
    return options.length > 0 && typeof options[0] === 'object' && 'type' in options[0];
};

// Calculate results
const calculateResults = (answers: AnswerRecord[], duration: number, category: string): AssessmentResult => {
    const correctCount = answers.filter(a => a.selected_answer === a.correct_answer).length;
    const totalQuestions = answers.length;
    const avgDifficulty = answers.reduce((sum, a) => sum + a.difficulty_index, 0) / totalQuestions;

    const rawRatio = correctCount / totalQuestions;
    const difficultyModifier = 1.0 + (avgDifficulty - 0.5);
    const weightedPerformance = rawRatio * difficultyModifier;

    let stenScore = 5;
    if (weightedPerformance < 0.20) stenScore = 1;
    else if (weightedPerformance < 0.30) stenScore = 2;
    else if (weightedPerformance < 0.40) stenScore = 3;
    else if (weightedPerformance < 0.50) stenScore = 4;
    else if (weightedPerformance < 0.60) stenScore = 5;
    else if (weightedPerformance < 0.70) stenScore = 6;
    else if (weightedPerformance < 0.80) stenScore = 7;
    else if (weightedPerformance < 0.88) stenScore = 8;
    else if (weightedPerformance < 0.95) stenScore = 9;
    else stenScore = 10;

    const percentileMap: Record<number, number> = { 1: 2, 2: 7, 3: 16, 4: 31, 5: 50, 6: 69, 7: 84, 8: 93, 9: 98, 10: 99 };

    const categoryLabels: Record<string, string> = {
        abstract: "Abstract Reasoning",
        verbal: "Verbal Reasoning",
        numerical: "Numerical Reasoning",
        logical: "Logical Deduction",
        sequences: "Number Sequences",
        analogies: "Verbal Analogies"
    };

    let feedback: string[];
    if (stenScore >= 8) {
        feedback = [
            `Uitstekende prestatie in ${categoryLabels[category]}. Je behoort tot de top 10%.`,
            "Tip: Blijf je snelheid behouden, maar let op 'instinkers'.",
            "Advies: Je bent klaar voor Big 4 assessments."
        ];
    } else if (stenScore >= 5) {
        feedback = [
            `Solide gemiddelde score in ${categoryLabels[category]} (STEN ${stenScore}).`,
            "Tip: Probeer het tempo iets te verhogen.",
            "Truc: Gebruik de eliminatiemethode bij twijfel."
        ];
    } else {
        feedback = [
            `Je score in ${categoryLabels[category]} (STEN ${stenScore}) heeft nog oefening nodig.`,
            "Tip: Neem meer tijd om de vraagstelling goed te lezen.",
            "Truc: Streep eerst de overduidelijk foute antwoorden weg."
        ];
    }

    const accuracy = Math.round((correctCount / totalQuestions) * 100);
    const avgTimePerQ = duration / totalQuestions;
    const speedScore = Math.min(100, Math.round((60 / avgTimePerQ) * 70));

    const hardQs = answers.filter(a => a.difficulty_index >= 0.7);
    const difficultyHandling = hardQs.length > 0
        ? Math.round((hardQs.filter(a => a.selected_answer === a.correct_answer).length / hardQs.length) * 100)
        : accuracy;

    return {
        raw_score: correctCount,
        total_questions: totalQuestions,
        sten_score: stenScore,
        percentile: percentileMap[stenScore] || 50,
        interpretation: stenScore >= 9 ? "Uitmuntend" : stenScore >= 7 ? "Hoog Gemiddeld" : stenScore >= 5 ? "Gemiddeld" : "Laag Gemiddeld",
        feedback,
        competencies: { accuracy, speed: speedScore, difficulty_handling: difficultyHandling },
        duration_seconds: duration
    };
};

export default function AssessmentRunner({ type, mode, onComplete, onExit }: AssessmentRunnerProps) {
    const totalQuestions = mode === 'drill' ? 5 : 15;
    const showFeedback = mode === 'drill'; // Only show feedback in drill mode

    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState({ current: 1, total: totalQuestions, correct: 0 });
    const [timeLeft, setTimeLeft] = useState(mode === 'drill' ? 120 : 90); // Stricter timer for exam
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
    const [totalDuration, setTotalDuration] = useState(0);
    const [answers, setAnswers] = useState<AnswerRecord[]>([]);
    const [aiQuestions, setAiQuestions] = useState<Question[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [usingAI, setUsingAI] = useState(false);

    // Fetch AI questions on mount
    useEffect(() => {
        const fetchAIQuestions = async () => {
            try {
                const res = await fetch('/api/assessment/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category: type, count: totalQuestions }),
                });
                const data = await res.json();
                if (data.success && data.questions?.length > 0) {
                    setAiQuestions(data.questions);
                    setUsingAI(true);
                }
            } catch (error) {
                console.log('Falling back to hardcoded questions:', error);
            }
        };
        fetchAIQuestions();
    }, [type, totalQuestions]);

    const loadQuestion = useCallback(() => {
        setLoading(true);
        setTimeout(() => {
            let question: Question;
            if (usingAI && aiQuestions.length > questionIndex) {
                // Use AI-generated question
                question = aiQuestions[questionIndex];
            } else {
                // Fallback to hardcoded
                question = getRandomQuestion(type);
            }
            setCurrentQuestion(question);
            setLoading(false);
            setTimeLeft(mode === 'drill' ? 120 : 90);
            setQuestionStartTime(Date.now());
        }, 300);
    }, [type, mode, usingAI, aiQuestions, questionIndex]);

    useEffect(() => {
        loadQuestion();
    }, [loadQuestion]);

    // Timer with visibility handling
    useEffect(() => {
        if (loading || (showResult && showFeedback)) return;

        let lastTime = Date.now();

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Pause tracking when tab hidden
                lastTime = 0;
            } else {
                // Resume when visible
                lastTime = Date.now();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        const timer = setInterval(() => {
            if (document.hidden) return; // Don't tick when hidden
            setTimeLeft((t) => (t > 0 ? t - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(timer);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [loading, showResult, showFeedback]);

    // Auto-submit when timer reaches 0
    useEffect(() => {
        if (timeLeft === 0 && selectedAnswer !== null && !showResult) {
            handleSubmit();
        }
    }, [timeLeft]);

    const handleSelectAnswer = (index: number) => {
        if (showResult && showFeedback) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null || !currentQuestion) return;

        const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
        setTotalDuration(prev => prev + timeTaken);

        const answerRecord: AnswerRecord = {
            question_id: currentQuestion.id,
            selected_answer: selectedAnswer,
            correct_answer: currentQuestion.correct_answer,
            time_taken: timeTaken,
            difficulty_index: currentQuestion.difficulty_index || 0.5
        };
        setAnswers(prev => [...prev, answerRecord]);

        if (selectedAnswer === currentQuestion.correct_answer) {
            setProgress(p => ({ ...p, correct: p.correct + 1 }));
        }

        if (showFeedback) {
            setShowResult(true);
        } else {
            // Exam mode: go directly to next question
            handleNextQuestion();
        }
    };

    const handleNextQuestion = () => {
        if (progress.current >= progress.total) {
            const finalAnswers = [...answers];
            const results = calculateResults(finalAnswers, totalDuration, type);
            const categoryLabels: Record<string, string> = {
                abstract: "Abstract Reasoning",
                verbal: "Verbal Reasoning",
                numerical: "Numerical Reasoning",
                logical: "Logical Deduction",
                sequences: "Number Sequences",
                analogies: "Verbal Analogies"
            };
            onComplete(results, categoryLabels[type] || type);
        } else {
            setProgress(p => ({ ...p, current: p.current + 1 }));
            setQuestionIndex(i => i + 1);
            setSelectedAnswer(null);
            setShowResult(false);
            loadQuestion();
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const progressPercentage = (progress.current / progress.total) * 100;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-200">
                <RefreshCw className="animate-spin text-cevace-blue mb-4" size={40} />
                <p className="text-gray-900 font-medium">Vraag wordt voorbereid...</p>
                <p className="text-gray-500 text-sm mt-1">
                    {mode === 'exam' ? 'Examensimulatie laden...' : 'Oefenvraag laden...'}
                </p>
            </div>
        );
    }

    if (!currentQuestion) return null;

    const isAbstract = currentQuestion.grid && isShapeOptions(currentQuestion.options);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header with mode indicator */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-900">
                            Vraag {progress.current} van {progress.total}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${mode === 'exam'
                            ? 'bg-cevace-orange/10 text-cevace-orange'
                            : 'bg-cevace-blue/10 text-cevace-blue'
                            }`}>
                            {mode === 'exam' ? 'Examen' : 'Oefenmodus'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                        <Clock size={16} />
                        <span className={`font-mono text-sm ${timeLeft < 30 ? 'text-red-500' : ''}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cevace-orange rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                    />
                </div>
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
                {/* Left: Context Panel */}
                <div className="p-6 bg-gray-50 border-r border-gray-200">
                    <div className="mb-4">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            {isAbstract ? 'Matrix Patroon' : 'Bronmateriaal'}
                        </span>
                    </div>

                    {isAbstract && currentQuestion.grid ? (
                        <div className="flex flex-col items-center">
                            <AbstractMatrix grid={currentQuestion.grid} size="medium" />
                            <p className="text-sm text-gray-500 mt-4 text-center italic">
                                {currentQuestion.context}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-500 mb-2 font-semibold">
                                {currentQuestion.type}
                            </p>
                            <div className="text-gray-900 leading-relaxed whitespace-pre-line">
                                {currentQuestion.context}
                            </div>
                        </div>
                    )}

                    {currentQuestion.difficulty_index && (
                        <div className="mt-4 flex items-center gap-2">
                            <span className="text-xs text-gray-500">Moeilijkheid:</span>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i <= Math.round(currentQuestion.difficulty_index! * 5)
                                            ? 'bg-cevace-orange'
                                            : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Question Panel */}
                <div className="p-6 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 leading-relaxed">
                        {currentQuestion.question}
                    </h3>

                    <div className={`mb-6 flex-1 ${isAbstract ? 'grid grid-cols-2 gap-4' : 'space-y-3'}`}>
                        {currentQuestion.options.map((option, idx) => {
                            const isSelected = selectedAnswer === idx;
                            const isCorrect = idx === currentQuestion.correct_answer;
                            const showCorrectness = showResult && showFeedback;

                            let borderClass = 'border-gray-200 hover:border-cevace-blue/50';
                            let bgClass = 'bg-white';

                            if (showCorrectness) {
                                if (isCorrect) {
                                    borderClass = 'border-green-500';
                                    bgClass = 'bg-green-50';
                                } else if (isSelected && !isCorrect) {
                                    borderClass = 'border-red-500';
                                    bgClass = 'bg-red-50';
                                }
                            } else if (isSelected) {
                                borderClass = 'border-cevace-blue';
                                bgClass = 'bg-cevace-blue/5';
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectAnswer(idx)}
                                    disabled={showCorrectness}
                                    className={`text-left p-4 rounded-xl border-2 transition-all flex ${isAbstract ? 'flex-col items-center justify-center' : 'justify-between items-center'
                                        } ${borderClass} ${bgClass}`}
                                >
                                    {isAbstract && typeof option === 'object' ? (
                                        <>
                                            <span className="text-xs font-bold text-gray-400 mb-2">
                                                {String.fromCharCode(65 + idx)}
                                            </span>
                                            <ShapeRenderer shape={option as ShapeCell} size={60} />
                                        </>
                                    ) : (
                                        <span className={`font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {option as string}
                                        </span>
                                    )}
                                    {showCorrectness && isCorrect && <CheckCircle size={20} className="text-green-500" />}
                                    {showCorrectness && isSelected && !isCorrect && <XCircle size={20} className="text-red-500" />}
                                </button>
                            );
                        })}
                    </div>

                    {showResult && showFeedback && currentQuestion.explanation && (
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                            <div className="flex items-start gap-3">
                                <Info size={20} className="text-cevace-blue flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-sm mb-1">Uitleg</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                        {currentQuestion.explanation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <button
                            onClick={onExit}
                            className="flex items-center gap-2 px-5 py-2 text-gray-600 border border-gray-300 rounded-full font-medium hover:border-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Afbreken
                        </button>

                        {!showResult || !showFeedback ? (
                            <button
                                onClick={handleSubmit}
                                disabled={selectedAnswer === null}
                                className={`px-6 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${selectedAnswer !== null
                                    ? 'bg-cevace-orange text-white hover:bg-cevace-orange/90 shadow-md'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {mode === 'exam' ? 'Volgende' : 'Controleer'}
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="px-6 py-3 bg-cevace-orange text-white rounded-full font-bold hover:bg-cevace-orange/90 shadow-md transition-all flex items-center gap-2"
                            >
                                {progress.current >= progress.total ? 'Afronden' : 'Volgende vraag'}
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
