import { SignIn, SignedIn, SignedOut, currentUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import { AMOUNT_OF_STEPS, calculateCompletionPercentage } from "../../_utils/calculate-completion-percentage";
import ConnectWalletButton from "./_components/connect-wallet-button";

export default async function SignInPage() {
  const user = await currentUser();
  const currentStep = user ? 1 : 0;

  return (
    <Card>
      <CardHeader>
        <Progress className="mb-4" value={calculateCompletionPercentage(currentStep, AMOUNT_OF_STEPS)} />

        <CardTitle>{currentStep === 0 ? "Connect your Wallet" : "Pick a social account"}</CardTitle>
        <CardDescription>
          Step {currentStep + 1} / {AMOUNT_OF_STEPS}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SignedIn>
          <SignIn />
        </SignedIn>

        <SignedOut>
          <ConnectWalletButton />
        </SignedOut>
      </CardContent>
    </Card>
  );
}
