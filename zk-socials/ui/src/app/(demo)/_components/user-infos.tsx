import { Alert, AlertDescription } from "@risc0/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@risc0/ui/avatar";
import { getAvatarInitials } from "../_utils/get-avatar-initials";

export function UserInfos({ userInfos }) {
  return (
    <Alert className="flex flex-row items-center gap-4 bg-neutral-900 p-5">
      <Avatar className="size-16">
        <AvatarImage src={userInfos.picture} alt={userInfos.name} />
        <AvatarFallback className="text-xl">{getAvatarInitials(userInfos.name)}</AvatarFallback>
      </Avatar>
      <AlertDescription>
        <p className="font-bold text-xl">{userInfos.name}</p>
        <p className="text-muted-foreground text-sm">{userInfos.email}</p>
        <p className="font-mono text-[10px]">Google</p>
      </AlertDescription>
    </Alert>
  );
}
