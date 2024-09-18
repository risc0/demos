import { Alert, AlertDescription } from "@risc0/ui/alert";

export function UserInfos({ userInfos, type }: { userInfos: any; type: "google" }) {
  return (
    <Alert className="flex flex-row items-center border-neutral-100 gap-6 bg-neutral-50 p-5">
      <img
        src={userInfos.picture}
        alt={userInfos.name}
        width={96}
        height={96}
        className="rounded-md shadow-xs pointer-events-none"
      />
      <AlertDescription className="grid w-full">
        <p title={userInfos.name} className="truncate font-bold text-xl">
          {userInfos.name}
        </p>
        <p title={userInfos.email} className="truncate text-muted-foreground text-sm">
          {userInfos.email}
        </p>
        <p className="mt-1 flex flex-row gap-1.5 items-center text-[10px]">
          {type === "google" && (
            <>
              <img src="https://zkauth.vercel.app/google.svg" width={16} height={16} alt="Google" />
              <span>Google</span>
            </>
          )}
        </p>
      </AlertDescription>
    </Alert>
  );
}
