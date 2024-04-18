import { SignIn, SignedIn, SignedOut, currentUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@risc0/ui/card";
import { Progress } from "@risc0/ui/progress";
import ConnectWalletButton from "../../_components/connect-wallet-button";
import { AMOUNT_OF_STEPS, calculateCompletionPercentage } from "../../_utils/calculate-completion-percentage";

export default function SignInPage() {
  return (
    <Card>
      <CardHeader>
        <Progress className="mb-4" value={calculateCompletionPercentage(0, AMOUNT_OF_STEPS)} />

        <CardTitle>Pick a social account</CardTitle>
        <CardDescription>Step 1 / {AMOUNT_OF_STEPS}</CardDescription>
      </CardHeader>

      <CardContent>
        <SignedIn>
          <ConnectWalletButton />
        </SignedIn>

        <SignedOut>
          <SignIn />
        </SignedOut>
      </CardContent>
    </Card>
  );
}
