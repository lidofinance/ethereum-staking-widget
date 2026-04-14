import { keccak256, toHex } from 'viem';

import { PARTNER_FEE_BPS } from '../consts';

// Build the appData JSON document and its keccak256 hash.
// CoW Protocol uses appData to encode partner fees and metadata.
// See: https://docs.cow.fi/governance/fees/partner-fee
export const buildAppData = (daoAgentAddress: string) => {
  const doc = {
    version: '1.1.0',
    appCode: 'Lido Staking Widget',
    metadata: {
      partnerFee: {
        bps: PARTNER_FEE_BPS,
        recipient: daoAgentAddress,
      },
    },
  };

  const fullAppData = JSON.stringify(doc);
  const appDataHash = keccak256(toHex(fullAppData));

  return { fullAppData, appDataHash };
};
