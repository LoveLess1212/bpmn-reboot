
import { BlockfrostProvider, KoiosProvider } from '@meshsdk/core';

export const cachingOptions = {
    enableCaching: true
}

// Original BlockfrostProvider for server-side usage
export const BlockFrostProd = () => 
    {
        return new BlockfrostProvider(process.env.NEXT_PUBLIC_BLOCK_FROST_API || '', cachingOptions)
    }

// Koios Provider for server-side usage (API routes, getServerSideProps)
export const KoiosServerProd = () => {
    const apiKey = process.env.KOIOS_API_KEY; // Use non-public env var for server
    if (!apiKey) {
        throw new Error('Koios API key not found in server environment variables');
    }
    return new KoiosProvider(apiKey);
}

// Koios Provider for client-side usage
export const KoiosClientProd = () => {
    const apiKey = process.env.NEXT_PUBLIC_KOIOS_API_KEY;
    if (!apiKey) {
        throw new Error('Koios API key not found in client environment variables');
    }
    return new KoiosProvider('preprod', apiKey);
}

