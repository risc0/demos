"use client";

import { startRegistration } from "@simplewebauthn/browser";
import type { VerifiedRegistrationResponse } from "@simplewebauthn/server";
import type { PublicKeyCredentialCreationOptionsJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { getRegistrationOptions, registerUser, verifyRegistration } from "../_actions/register";

export const WebAuthnButton = () => {
  const [username, setUsername] = useState("example-username");
  const [email, setEmail] = useState("example-email@example.com");
  const [error, setError] = useState("");

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const creationOptionsJSON: PublicKeyCredentialCreationOptionsJSON = await getRegistrationOptions(email, username);

    console.log("creationOptionsJSON", creationOptionsJSON);

    const registrationResponse: RegistrationResponseJSON = await startRegistration(creationOptionsJSON);
    console.log("registrationResponse", registrationResponse);

    const verificationResponse: VerifiedRegistrationResponse = await verifyRegistration(
      registrationResponse,
      creationOptionsJSON.challenge,
    );
    console.log("verificationResponse", verificationResponse);

    try {
      const user = await registerUser(verificationResponse);
      console.log("user", user);

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
        value={username}
        onChange={(event) => setUsername(event.target.value)}
      />
      <input
        type="email"
        id="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input type="submit" value="Register" />
      {error != null ? <pre>{error}</pre> : null}
      {error === "User with this email already exists" ? (
        <p>
          Please{" "}
          <Link href="/login">
            <b>sign in</b>
          </Link>{" "}
          using your existing account credentials instead
        </p>
      ) : null}
    </form>
  );
};
