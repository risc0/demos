"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Listener({ children }) {
	const router = useRouter();

	const observeAndClick = (selector: string, callback: () => void) => {
		const observer = new MutationObserver((mutationsList) => {
			let foundElement = false;

			mutationsList.some((mutation) => {
				if (mutation.type === "childList") {
					const traverse = (node) => {
						if (!node.querySelectorAll) {
							return;
						}

						const element = node.querySelector(selector);

						if (element) {
							callback();
							foundElement = true;

							return true; // Exit the loop if element is found
						}

						for (const childNode of node.childNodes) {
							if (traverse(childNode)) return true;
						}

						return false;
					};

					return traverse(mutation.target);
				}

				return false;
			});

			if (foundElement) {
				observer.disconnect();
			}
		});

		const walletListener = document.getElementById("wallet-listener");

		if (walletListener) {
			observer.observe(walletListener, { childList: true, subtree: true });

			return () => {
				// cleanup
				observer.disconnect();
			};
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once
	useEffect(() => {
		// listen for metamask button and click on it
		const metamaskButtonCallback = () => {
			const button: HTMLButtonElement | null =
				document.querySelector("#metamask");

			button?.click();
		};

		return observeAndClick("#metamask", metamaskButtonCallback);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once
	useEffect(() => {
		// listen for success message and navigate away
		const successMessageCallback = () => {
			console.log("FOUND SUCCESS MESSAGE");
			router.push("/");
		};

		return observeAndClick(
			'[data-localization-key="userProfile.web3WalletPage.successMessage"]',
			successMessageCallback,
		);
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: run once
	useEffect(() => {
		// listen for add wallets button and click on it
		const addWalletButtonCallback = () => {
			const button: HTMLButtonElement | null = document.querySelector(
				"button.cl-profileSectionPrimaryButton__password",
			);

			button?.click();
		};

		return observeAndClick(
			"button.cl-profileSectionPrimaryButton__password",
			addWalletButtonCallback,
		);
	}, []);

	return <div id="wallet-listener">{children}</div>;
}
