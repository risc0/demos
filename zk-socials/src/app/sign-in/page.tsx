import { Button } from "@risc0/ui/button";
import { Input } from "@risc0/ui/input";
import { LockIcon } from "lucide-react";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authOptions } from "~/auth";
import env from "~/env";

export default async function SignIn() {
  const session = await getServerSession(authOptions);
  const cookieStore = cookies();

  if (session) {
    redirect("/");
  }

  const csrfTokenCookie = `${env.NODE_ENV === "production" ? "__Host-" : ""}next-auth.csrf-token`;
  const csrfToken = cookieStore.get(csrfTokenCookie)?.value.split("|")[0];

  return (
    <div className="container flex h-dvh max-w-sm items-center justify-center">
      <form method="post" action="/api/auth/callback/credentials" className="w-full">
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <Input
          startIcon={<LockIcon />}
          autoFocus
          placeholder="Password"
          name="password"
          type="password"
          className="mb-4"
        />

        <Button type="submit" className="w-full" size="lg">
          Sign In
        </Button>
      </form>
    </div>
  );
}
