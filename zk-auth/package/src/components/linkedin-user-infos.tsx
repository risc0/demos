import { Alert, AlertDescription } from "@risc0/ui/alert";

export function LinkedInUserInfos({
  userInfos,
}: {
  userInfos: {
    name: string;
    email: string;
    picture?: string;
  };
}) {
  return (
    <Alert className="flex flex-row items-center gap-6 border-neutral-100 bg-neutral-50 p-5">
      <div className="flex min-h-[64px] min-w-[64px] items-center justify-center">
        <img
          src={userInfos.picture}
          alt={userInfos.name}
          width={64}
          height={64}
          className="pointer-events-none rounded-sm shadow-xs"
        />
      </div>
      <AlertDescription className="grid w-full">
        <p title={userInfos.name} className="truncate font-bold text-xl">
          {userInfos.name}
        </p>
        <p title={userInfos.email} className="truncate text-muted-foreground text-sm">
          {userInfos.email}
        </p>
        <p className="mt-1 flex flex-row items-center gap-1.5 text-[10px]">
          <img
            src="https://zkauth.vercel.app/linkedin.svg"
            width={12}
            height={12}
            alt="LinkedIn"
            className="relative -top-[2px]"
          />
          <span>LinkedIn</span>
        </p>
      </AlertDescription>
    </Alert>
  );
}
