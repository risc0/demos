"use server";

import { clerkClient } from "@clerk/nextjs";
import { revalidatePath } from "next/cache";

export async function setUserWalletAddress({ walletAddress, userId }) {
	await clerkClient.users.updateUserMetadata(userId, {
		publicMetadata: {
			walletAddress,
		},
	});

	revalidatePath("/");
}
