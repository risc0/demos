import { Alert, AlertDescription } from "@risc0/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@risc0/ui/avatar";
import { getAvatarInitials } from "../_utils/get-avatar-initials";

export function UserInfos({ userInfos }) {
  return (
    <Alert className="flex flex-row items-center gap-4 dark:bg-neutral-900 bg-neutral-50 p-5">
      <Avatar className="size-16">
        <AvatarImage src={userInfos.picture} alt={userInfos.name} />
        <AvatarFallback className="text-xl">{getAvatarInitials(userInfos.name)}</AvatarFallback>
      </Avatar>
      <AlertDescription className="grid w-full">
        <p title={userInfos.name} className="font-bold text-xl truncate">
          {userInfos.name}
        </p>
        <p title={userInfos.email} className="text-muted-foreground text-sm truncate">
          {userInfos.email}
        </p>
        <p className="font-mono text-[10px]">Google</p>
      </AlertDescription>
    </Alert>
  );
}
