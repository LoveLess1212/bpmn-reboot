import { KoiosProvider } from '@meshsdk/core';
import { BlockfrostProvider } from '@meshsdk/core';

export const BlockchainProvider = new KoiosProvider(
    'preprod',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZGRyIjoic3Rha2UxdTl3ejdnanpmcXZ2OG04dHhxaHh0ZTZlOWo1d3Fnc2RrZjByN3JhNDZsZW13eGNkM2o4NnAiLCJleHAiOjE3NTk2NjA4NzgsInRpZXIiOjEsInByb2pJRCI6IlRoZXNpcyJ9.jV_JC7DOPjOQHv-s4DDoZJYCvv6QATdVljA46zmu_U8'
);
export const BlockFrostProd = new BlockfrostProvider(
    'preprod',
    'bhlMliCvWTsl9s3dB9YFsiVPmrfaXUak'
);
