
import { BlockfrostProvider } from '@meshsdk/core';

export const cachingOptions = {
    enableCaching: true
}
export const BlockFrostProd = () => 
    {
        return new BlockfrostProvider(process.env.NEXT_PUBLIC_BLOCK_FROST_API || '', cachingOptions)
    }