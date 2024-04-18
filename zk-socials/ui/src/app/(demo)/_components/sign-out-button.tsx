"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function SignOutButton() {
	const router = useRouter();

	return (
		<ClerkSignOutButton
			signOutCallback={() => {
				router.push("/sign-in");
			}}
		>
			Sign Out
		</ClerkSignOutButton>
	);
}
