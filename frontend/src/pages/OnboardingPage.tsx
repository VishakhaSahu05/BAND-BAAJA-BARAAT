import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingStep1 } from '../features/onboarding/components/OnboardingStep1';
import { OnboardingStep2 } from '../features/onboarding/components/OnboardingStep2';
import { OnboardingStep3 } from '../features/onboarding/components/OnboardingStep3';
import { DEFAULT_ONBOARDING_STATE, type OnboardingState } from '../features/onboarding/types';
import { ApiClientError } from '../services/apiClient';
import * as weddingsApi from '../services/weddingsApi';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [state, setState] = useState<OnboardingState>(DEFAULT_ONBOARDING_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateState(patch: Partial<OnboardingState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  async function handleFinalSubmit() {
    setErrorMessage(null);

    if (!state.brideName.trim() || !state.groomName.trim() || !state.weddingDate || !state.venue.trim()) {
      setErrorMessage('Please go back and fill in the couple names, wedding date, and venue from Step 1.');
      return;
    }

    setIsSubmitting(true);

    try {
      const budgetPaise = state.budget.trim() ? Math.round(Number(state.budget) * 100) : undefined;

      await weddingsApi.createWedding({
        brideName: state.brideName,
        groomName: state.groomName,
        weddingDate: state.weddingDate,
        timeZone: state.timeZone,
        location: {
          formattedAddress: state.venue,
          city: state.venue,
          state: state.venue,
          country: 'India',
        },
        budgetPaise,
        hashtag: state.hashtag.trim() || undefined,
        description: state.description.trim() || undefined,
        rituals: state.rituals,
        ceremonySpan: state.ceremonySpan,
        guestEstimate: {
          total: state.guestTotal,
          groomSide: state.groomSideGuests,
          brideSide: state.brideSideGuests,
        },
        rsvpCollectionMode: state.rsvpCollectionMode,
        isItineraryPrivate: state.isItineraryPrivate,
      });

      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof ApiClientError ? error.displayMessage : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === 1) {
    return (
      <OnboardingStep1
        state={state}
        onChange={updateState}
        onNext={() => setStep(2)}
        onSkip={() => navigate('/', { replace: true })}
      />
    );
  }

  if (step === 2) {
    return (
      <OnboardingStep2 state={state} onChange={updateState} onNext={() => setStep(3)} onBack={() => setStep(1)} />
    );
  }

  return (
    <OnboardingStep3
      state={state}
      onChange={updateState}
      onSubmit={() => {
        void handleFinalSubmit();
      }}
      onBack={() => setStep(2)}
      isSubmitting={isSubmitting}
      errorMessage={errorMessage}
    />
  );
}
