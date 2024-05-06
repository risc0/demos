"use client";

import { Button } from "@risc0/ui/button";
import { startRegistration } from "@simplewebauthn/browser";
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { getRegistrationOptions, registerUser, verifyRegistration } from "../_actions/register";

export const WebAuthnButton = () => {
  const [username, setUsername] = useState("example-username");
  const [email, setEmail] = useState("example-email@example.com");
  const [_error, setError] = useState("");

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const creationOptionsJSON: PublicKeyCredentialCreationOptionsJSON = await getRegistrationOptions(email, username);

    const registrationResponse: RegistrationResponseJSON = await startRegistration(creationOptionsJSON);

    const verificationResponse: VerifiedRegistrationResponse = await verifyRegistration(
      registrationResponse,
      creationOptionsJSON.challenge,
    );

    try {
      const user = await registerUser(verificationResponse);

      if (user instanceof Error) {
        setError(user.message ? user.message : "An unknown Registration error occurred");
        throw user;
      }
    } catch (err) {
      const registerError = err as Error;
      setError(registerError.message);
    }
  };

  return (
    <form method="POST" onSubmit={handleFormSubmit}>
      <input
        type="text"
        id="username"
        name="username"
        placeholder="Username"
        className="hidden"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Email"
        value={email}
        className="hidden"
        onChange={(event) => setEmail(event.target.value)}
      />
      <Button className="w-full" type="submit">
        Register with WebAuthn
      </Button>
    </form>
  );
};
