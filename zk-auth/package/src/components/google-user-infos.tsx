import { Alert, AlertDescription } from "@risc0/ui/alert";

export function GoogleUserInfos({ userInfos }: { userInfos: any }) {
  return (
    <Alert className="flex flex-row items-center border-neutral-100 gap-6 bg-neutral-50 p-5">
      <div className="min-w-[64px] min-h-[64px] flex items-center justify-center">
        <img
          src={userInfos.picture}
          alt={userInfos.name}
          width={64}
          height={64}
          className="rounded-sm shadow-xs pointer-events-none"
        />
      </div>
      <AlertDescription className="grid w-full">
        <p title={userInfos.name} className="truncate font-bold text-xl">
          {userInfos.name}
        </p>
        <p title={userInfos.email} className="truncate text-muted-foreground text-sm">
          {userInfos.email}
        </p>
        <p className="mt-1 flex flex-row gap-1 items-center text-[10px]">
          <img src="https://zkauth.vercel.app/google.svg" width={16} height={16} alt="Google" />
          <span>Google</span>
        </p>
      </AlertDescription>
    </Alert>
  );
}
