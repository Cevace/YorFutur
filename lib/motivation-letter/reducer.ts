import type { MotivationLetterResponse } from './types';

// State types
export type MotivationLetterState =
    | { phase: 'input'; profileData: any | null }
    | { phase: 'generating'; showLoading: boolean; profileData: any | null }
    | { phase: 'selection'; response: MotivationLetterResponse; letterId: string; profileData: any | null }
    | { phase: 'editing'; response: MotivationLetterResponse; letterId: string; selectedVariant: 'strategic' | 'culture' | 'storyteller'; profileData: any | null };

// Action types
export type MotivationLetterAction =
    | { type: 'SET_PROFILE_DATA'; profileData: any }
    | { type: 'START_GENERATION' }
    | { type: 'SHOW_LOADING' }
    | { type: 'GENERATION_SUCCESS'; response: MotivationLetterResponse; letterId: string }
    | { type: 'GENERATION_ERROR' }
    | { type: 'SELECT_VARIANT'; variantId: 'strategic' | 'culture' | 'storyteller' }
    | { type: 'BACK_TO_SELECTION' }
    | { type: 'RESET' };

// Reducer
export function motivationLetterReducer(
    state: MotivationLetterState,
    action: MotivationLetterAction
): MotivationLetterState {
    switch (action.type) {
        case 'SET_PROFILE_DATA':
            return { ...state, profileData: action.profileData };

        case 'START_GENERATION':
            if (state.phase !== 'input') return state;
            return { phase: 'generating', showLoading: false, profileData: state.profileData };

        case 'SHOW_LOADING':
            if (state.phase !== 'generating') return state;
            return { ...state, showLoading: true };

        case 'GENERATION_SUCCESS':
            if (state.phase !== 'generating') return state;
            return {
                phase: 'selection',
                response: action.response,
                letterId: action.letterId,
                profileData: state.profileData
            };

        case 'GENERATION_ERROR':
            return { phase: 'input', profileData: state.profileData };

        case 'SELECT_VARIANT':
            if (state.phase !== 'selection') return state;
            return {
                phase: 'editing',
                response: state.response,
                letterId: state.letterId,
                selectedVariant: action.variantId,
                profileData: state.profileData
            };

        case 'BACK_TO_SELECTION':
            if (state.phase !== 'editing') return state;
            return {
                phase: 'selection',
                response: state.response,
                letterId: state.letterId,
                profileData: state.profileData
            };

        case 'RESET':
            return { phase: 'input', profileData: state.profileData };

        default:
            return state;
    }
}

// Initial state
export const initialState: MotivationLetterState = {
    phase: 'input',
    profileData: null
};
