export type SnarkReceipt = {
	snark: {
		a: [string, string];
		b: [[string, string], [string, string]];
		c: [string, string];
		public: [string, string, string, string];
	};
	post_state_digest: string;
	journal: string;
};
