// import { PinataSDK } from 'pinata';

// export const pinataSDK = new PinataSDK({
//   pinataJwt:
//     'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYmYxNWQyZi05N2RhLTQ2YTgtOGM2Ni00MTI2MGEzNjI5OGYiLCJlbWFpbCI6Im5hY3V0OTIyQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0NDBkN2IzYmNkZTBlODY3YmFiYiIsInNjb3BlZEtleVNlY3JldCI6IjZjNWYyYjAxMTlmMTcwZDVmNWRhYTc2YWYxOWRjNzkyNzdlOGQ5OTM1NWIzYTFjODFkODUyOGI3MDIzOGRjZDAiLCJleHAiOjE3NjA3MTI0MTF9.7rZEqSPdbtUkKreR_0X9jHv4ajk76vYldGlMGzMlkIg',
//   pinataGateway: 'amethyst-useful-nightingale-390.mypinata.cloud',
// });
// export const pinataGateway = 'amethyst-useful-nightingale-390.mypinata.cloud';
// export function urlToCid(url: string) {
//   return url.trim().replace('ipfs://', '');
// }
// export function metadataToUrl(url: string): string {
//   const cid = urlToCid(url).replace(/\r?\n|\r/g, '');
//   const returnUrl = `https://${pinataGateway}/ipfs/${cid}`;
//   return returnUrl.replace(/(\r\n|\n|\r)/gm, '');
// }

// /**
//  * Fetches an XML file from IPFS and returns it as a string.
//  * @param {string} cid - The IPFS CID of the XML file.
//  * @param {string} [ipfsGateway='https://ipfs.io/ipfs/'] - The IPFS gateway URL to use.
//  * @returns {Promise<string>} A promise that resolves with the XML string.
//  * @throws {Error} If there's an error fetching the XML.
//  */
// export async function fetchIPFSXMLString(
//   cid: string,
//   ipfsGateway: string = 'ipfs.io',
// ): Promise<string> {
//   const url = `https://${ipfsGateway}/ipfs/${cid.trim()}`;
//   console.log(url);
//   try {
//     const response = await fetch(url);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const xmlText = await response.text();
//     // console.log(xmlText);
//     return xmlText;
//   } catch (error) {
//     console.error('Error fetching XML from IPFS:', error);
//     throw error;
//   }
// }
