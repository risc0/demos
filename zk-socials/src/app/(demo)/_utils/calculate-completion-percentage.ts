export const AMOUNT_OF_STEPS = 4;

export function calculateCompletionPercentage(currentStep: number, totalSteps: number): number {
  return (currentStep / totalSteps) * 100;
}
