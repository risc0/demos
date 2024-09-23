import { Alert, AlertDescription } from "@risc0/ui/alert";

export function GoogleUserInfos({
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
        <p className="mt-1 flex flex-row items-center gap-1 text-[10px]">
          <img src="https://zkauth.vercel.app/google.svg" width={16} height={16} alt="Google" />
          <span>Google</span>
        </p>
      </AlertDescription>
    </Alert>
  );
}
