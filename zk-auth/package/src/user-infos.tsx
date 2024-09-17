import { Alert, AlertDescription } from "@risc0/ui/alert";

export function UserInfos({ userInfos, type }: { userInfos: any; type: "google" }) {
  return (
    <Alert className="flex flex-row items-center gap-4 bg-neutral-50 p-5 dark:bg-neutral-900">
      <AlertDescription className="grid w-full">
        <p title={userInfos.name} className="truncate font-bold text-xl">
          {userInfos.name}
        </p>
        <p title={userInfos.email} className="truncate text-muted-foreground text-sm">
          {userInfos.email}
        </p>
        <p className="mt-1 flex flex-row gap-2 font-mono text-[10px]">
          {type === "google" && (
            <>
              <img src="https://zkauth.vercel.app/google.svg" width={16} height={16} alt="Google" /> Google
            </>
          )}
        </p>
      </AlertDescription>
    </Alert>
  );
}
