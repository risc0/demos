import React, { useEffect, useState } from "react";
import Prove from "./Prove";

import { useAccount } from "wagmi";
import SignInWithIDme from "./SignInWithIDme";

interface ClaimProps {}

const Steps: React.FC<ClaimProps> = () => {
  const { isConnected } = useAccount();
  const [jwtExists] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [userData, setUserData] = useState(null);

  const next = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const stepDescriptions = [
    "Connect Wallet",
    "Verify Identity",
    "Prove & Mint",
  ];

  const renderStepIndicator = () => {
    return (
      <div className="step-indicator">
        {stepDescriptions.map((description, index) => (
          <div
            key={index}
            className={`step ${index + 1 === currentStep ? "current" : ""}`}
          >
            {index + 1}: {description}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (!isConnected) {
      setCurrentStep(1);
    }
    if (isConnected) {
      setCurrentStep(2);
    }
  }, [isConnected]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <p>Please connect your wallet to proceed.</p>;
      case 2:
        return (
          <>
            <h4> Sign in / Signup to your account</h4>
            <SignInWithIDme
              disabled={jwtExists}
              onNext={next}
              onUserData={setUserData}
            />
          </>
        );
      case 3:
        return (
          <>
            <h4>Prove Identity</h4>
            {userData.fname && <h5>{`Welcome, ${userData.fname}`}</h5>}
            <Prove disabled={false} onNext={next} />
          </>
        );
      default:
        return <p>Unknown step</p>;
    }
  };

  return (
    <div className="claim-container">
      {renderStepIndicator()}
      <div className="step-content">{renderCurrentStep()}</div>
    </div>
  );
};

export default Steps;
