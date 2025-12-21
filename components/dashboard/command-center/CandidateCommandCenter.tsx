'use client';

import React from 'react';
import BentoGrid, {
    GridCellFullWidth,
    GridCellLarge,
    GridCellMedium,
    GridCellHalf
} from './BentoGrid';
import MorningBriefing from './MorningBriefing';
import ActionCenter from './ActionCenter';
import ApplicationFunnel from './ApplicationFunnel';
import JobRadarWidget from './JobRadarWidget';
import OpportunityHubWidget from './OpportunityHubWidget';
import { getPriorityActions, getActionCounts } from './priorityEngine';
import { getAIRecommendations } from './mockData';
import { UserData, AgendaEvent } from './types';

interface CandidateCommandCenterProps {
    userData: UserData;
}

/**
 * Get agenda events from real Supabase applications
 * Extracts interviews, deadlines, and follow-ups from real data
 */
function getAgendaEventsFromReal(realApps: UserData['realApplications']): AgendaEvent[] {
    if (!realApps || realApps.length === 0) return [];

    const events: AgendaEvent[] = [];

    realApps.forEach(app => {
        // Interview events (Blue)
        if (app.interview_date) {
            events.push({
                id: `interview-${app.id}`,
                type: 'interview',
                title: `Interview bij ${app.company_name}`,
                company: app.company_name,
                date: app.interview_date,
                color: 'bg-blue-500'
            });
        }

        // Deadline events (Red)
        if (app.deadline_date) {
            events.push({
                id: `deadline-${app.id}`,
                type: 'deadline',
                title: `Deadline: ${app.job_title}`,
                company: app.company_name,
                date: app.deadline_date,
                color: 'bg-red-500'
            });
        }

        // Follow-up events (Yellow)
        if (app.follow_up_date) {
            events.push({
                id: `followup-${app.id}`,
                type: 'followup',
                title: `Follow-up: ${app.company_name}`,
                company: app.company_name,
                date: app.follow_up_date,
                color: 'bg-yellow-500'
            });
        }
    });

    // Sort by date (soonest first)
    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * CandidateCommandCenter - Main Dashboard Component
 * Assembles all widgets into a Bento Grid layout
 * 
 * Layout:
 * ┌─────────────────────────────────────────────┐
 * │              Morning Briefing (A)           │
 * ├────────────────────────┬────────────────────┤
 * │    Action Center (B)   │ App Funnel (C)     │
 * ├────────────────────────┼────────────────────┤
 * │    Job Radar (D)       │ Opportunity Hub(E) │
 * └────────────────────────┴────────────────────┘
 */
export default function CandidateCommandCenter({ userData }: CandidateCommandCenterProps) {
    // Derive priority actions from user data
    const priorityActions = getPriorityActions(userData);
    const actionCounts = getActionCounts(priorityActions);

    // Get agenda events from real applications (if available) 
    const agendaEvents = getAgendaEventsFromReal(userData.realApplications);
    const aiRecommendations = getAIRecommendations(userData.userRole);

    return (
        <BentoGrid>
            {/* Block A: Morning Briefing - Full Width */}
            <GridCellFullWidth>
                <MorningBriefing
                    firstName={userData.firstName}
                    priorityCount={actionCounts.total}
                    criticalCount={actionCounts.critical}
                />
            </GridCellFullWidth>

            {/* Block B: Action Center - Large */}
            <GridCellLarge>
                <ActionCenter actions={priorityActions} />
            </GridCellLarge>

            {/* Block C: Application Funnel - Medium */}
            <GridCellMedium>
                <ApplicationFunnel stats={userData.funnelStats} />
            </GridCellMedium>

            {/* Block D: Job Radar - Half */}
            <GridCellHalf>
                <JobRadarWidget matches={userData.jobMatches} />
            </GridCellHalf>

            {/* Block E: Opportunity Hub - Half (replaced KnowledgeGrowth) */}
            <GridCellHalf>
                <OpportunityHubWidget
                    agendaEvents={agendaEvents}
                    aiRecommendations={aiRecommendations}
                />
            </GridCellHalf>
        </BentoGrid>
    );
}
