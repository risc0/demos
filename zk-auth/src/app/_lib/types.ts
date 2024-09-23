type StarkSessionStats = {
  segments: number;
  total_cycles: number;
  cycles: number;
};

type SnarkSessionReceipt = {
  snark: any;
  post_state_digest: number[];
  journal: number[];
};

export type ProofReq = {
  img: string;
  input: string;
  assumptions: string[];
};

export type StarkSessionStatusRes = {
  status: string;
  receipt_url?: string;
  error_msg?: string;
  state?: string;
  elapsed_time?: number;
  stats?: StarkSessionStats;
};

export type SnarkSessionStatusRes = {
  status: string;
  output?: SnarkSessionReceipt;
  error_msg?: string;
};

export type UploadRes = {
  url: string;
  uuid: string;
};

export type CreateStarkSessionRes = {
  uuid: string;
};

export type CreateSnarkSessionRes = {
  uuid: string;
};

export type SnarkSessionReq = {
  session_id: string;
};
