"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import jwtDecode from "jwt-decode";
import { useEffect } from "react";

export function SignInButton() {
	const [googleUserInfos, setGoogleUserInfos] = useLocalStorage<
		any | undefined
	>("google-infos", undefined);
	const [googleUserToken, setGoogleUserToken] = useLocalStorage<
		string | undefined
	>("google-token", undefined);
	const address = "0xeB4Fc761FAb7501abe8cD04b2d831a45E8913DdF"; // @todo: replace with the address of the user

	useEffect(() => {
		if (!googleUserToken || googleUserInfos) {
			return;
		}

		setGoogleUserInfos(jwtDecode(googleUserToken));
	}, [googleUserToken, setGoogleUserInfos, googleUserInfos]);

	return (
		<GoogleLogin
			auto_select
			theme="filled_black"
			nonce={address}
			onSuccess={(response) => {
				if (response.credential) {
					setGoogleUserToken(response.credential);
				}
			}}
		/>
	);
}
