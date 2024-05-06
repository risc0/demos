import Link from "next/link";

export function TermsAndServices() {
  return (
    <p className="text-xs text-center mt-6 text-muted-foreground">
      By utilizing this app, you agree to our{" "}
      <Link className="link" target="_blank" href="https://www.risczero.com/terms-of-service">
        Terms of Service
      </Link>{" "}
      and{" "}
      <Link className="link" target="_blank" href="https://www.risczero.com/policy">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
