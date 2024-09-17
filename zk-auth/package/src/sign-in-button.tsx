import { GoogleLogin } from "@react-oauth/google";
import { useLocalStorage } from "@risc0/ui/hooks/use-local-storage";
import jwtDecode from "jwt-decode";
import { useEffect } from "react";

export function SignInButton({ address }: { address: string }) {
  const [googleUserInfos, setGoogleUserInfos] = useLocalStorage(`google-infos-${address}`, undefined);
  const [googleUserToken, setGoogleUserToken] = useLocalStorage<string | undefined>(
    `google-token-${address}`,
    undefined,
  );

  useEffect(() => {
    if (!googleUserToken || googleUserInfos) {
      return;
    }

    setGoogleUserInfos(jwtDecode(googleUserToken));
  }, [googleUserToken, setGoogleUserInfos, googleUserInfos]);

  return (
    <GoogleLogin
      auto_select
      nonce={address}
      onSuccess={(response) => {
        if (response.credential) {
          setGoogleUserToken(response.credential);
        }
      }}
    />
  );
}
