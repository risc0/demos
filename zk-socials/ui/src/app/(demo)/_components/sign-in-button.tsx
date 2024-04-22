"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { Button } from "@risc0/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocalStorage } from "~/app/(demo)/_hooks/useLocalStorage";

export default function SignInButton() {
	const [signingIn, setSigningIn] = useState<boolean>(false);
	// biome-ignore lint/suspicious/noExplicitAny: ignore
	const [googleUser, setGoogleUser] = useState<any>();
	// biome-ignore lint/suspicious/noExplicitAny: ignore
	const [user, setUser] = useLocalStorage<any>("google-profile", null);
	const router = useRouter();

	const login = useGoogleLogin({
		onSuccess: (codeResponse) => {
			setGoogleUser(codeResponse);
			setSigningIn(false);
		},
		onError: (error) => {
			console.error("Login Failed:", error);
			setSigningIn(false);
		},
	});

	// if already logged in
	useEffect(() => {
		if (user) {
			router.push("/");
		}
	}, [router.push, user]);

	useEffect(() => {
		if (googleUser) {
			fetch(
				`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${googleUser.access_token}`,
				{
					headers: {
						Authorization: `Bearer ${googleUser.access_token}`,
						Accept: "application/json",
					},
				},
			)
				.then(async (res) => {
					const result = await res.json();
					setUser(result);
				})
				.catch(console.error);
		}
	}, [setUser, googleUser]);

	return (
		<Button
			isLoading={signingIn}
			disabled={signingIn}
			size="lg"
			className="w-full"
			onClick={() => {
				setSigningIn(true);
				login();
			}}
		>
			Sign In with Google
		</Button>
	);
}
