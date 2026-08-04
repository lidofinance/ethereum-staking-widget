/**
 * Response contracts of the earn API endpoints. Shared between the
 * frontend hooks (`shared/hooks/use-earn-vaults-{apr,tvl}.ts`) and the
 * Fastify routes that produce them (`server/src/routes/earn-vaults-*.ts`) —
 * previously the types lived in `pages/api/earn/*` next to the handlers.
 */
export type VaultsAprResponse = {
  data: {
    maxValue: number;
    [key: string]:
      { apr: number | undefined; timestamp: number | undefined } | number;
  };
  meta: {
    resTimestamp: number;
  };
};

export type VaultsTvlResponse = {
  data: Record<
    string,
    { tvlEthWei: string | undefined; timestamp: number | undefined }
  >;
  meta: {
    resTimestamp: number;
  };
};
