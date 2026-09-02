export type AuthTokenData = {
  via?: string;
  access_token: string;
  expires_in?: number;
  refresh_token: string;
  token_type?: string;
};

export type AuthTokenResponse = {
  data: AuthTokenData;
  meta?: {
    trace_id?: string;
  };
};
