import React, { useEffect, useState } from "react";
import Prove from "./Prove";
import { useAccount } from "wagmi";
import { GoogleTokenPayload } from "../libs/types";
import { SignInWithGoogle } from "./SignInWithGoogle";

interface ClaimProps {}

const Claim: React.FC<ClaimProps> = () => {
  const { isConnected } = useAccount();
  const [jwtExists, setJwtExists] = useState<boolean>(false);
  const [email, setEmail] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Check for JWT cookie
      const jwt = document.cookie
        .split("; ")
        .find((row) => row.startsWith("jwt="));
      const jwtValue = jwt && jwt.split("=")[1];
      let newJwtExists = false;

      if (jwtValue && jwtValue !== "") {
        newJwtExists = true;
        const payload: GoogleTokenPayload = JSON.parse(
          atob(jwtValue.split(".")[1])
        );
        setEmail(payload.email);
      } else {
        setEmail(null);
      }

      setJwtExists(newJwtExists);

      
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const stepDescriptions = [
    "Connect Wallet",
    "Sign In",
    "Prove & Claim",
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
    } else if (isConnected && !jwtExists) {
      setCurrentStep(2);
    } else if (isConnected && jwtExists) {
      setCurrentStep(3);
    } 
  }, [isConnected, jwtExists]);

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <p>Please connect your wallet to proceed.</p>;
      case 2:
        return (
          <>
            <h4> Sign in to your account</h4>
            <SignInWithGoogle disabled={jwtExists} />
            {/* <p>or</p>
            <SignInWithApple disabled={false} /> */}
          </>
        );
      case 3:
        return (
          <>
            <h4>Prove account ownership</h4>

            {email && <h5>{`Welcome, ${email}`}</h5>}
            <Prove disabled={false} email={email} />
            <h6> 
              Proving ownership will automatically 
              <br></br>
              deposit the balance to your wallet.
            </h6>
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

export default Claim;
