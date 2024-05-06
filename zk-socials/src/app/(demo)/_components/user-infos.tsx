import { Alert, AlertDescription } from "@risc0/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@risc0/ui/avatar";
import Image from "next/image";
import type { GoogleUserInfos } from "~/types/google";
import { getAvatarInitials } from "../_utils/get-avatar-initials";

export function UserInfos({ userInfos, type }: { userInfos: GoogleUserInfos; type: "google" }) {
  return (
    <Alert className="flex flex-row items-center gap-4 bg-neutral-50 p-5 dark:bg-neutral-900">
      <Avatar className="size-16">
        <AvatarImage referrerPolicy="no-referrer" src={userInfos.picture} alt={userInfos.name} />
        <AvatarFallback className="text-xl">{getAvatarInitials(userInfos.name)}</AvatarFallback>
      </Avatar>
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
              <Image src="/google.svg" width={16} height={16} alt="Google" /> Google
            </>
          )}
        </p>
      </AlertDescription>
    </Alert>
  );
}
