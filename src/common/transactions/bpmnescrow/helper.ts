import {
  conStr0,
  byteString,
  conStr1,
  deserializeAddress,
  integer,
  list,
} from '@meshsdk/core';
import {
  NodeState,
  InitEscrow,
  ActiveEscrow,
  InitEscrowParams,
  ActiveEscrowParams,
} from './types';

/**
 * Creates a node state representation by combining current node, incoming, and outgoing connections.
 *
 * @param current - The identifier of the current node
 * @param incoming - Optional identifier of the incoming connection
 * @param outgoing - Optional array of outgoing connection identifiers
 * @returns A NodeState representing the current node's state with its connections
 *
 * @example
 * // With both incoming and outgoing
 * getNodeState("node1", "in1", ["out1", "out2"])
 *
 * // With only incoming
 * getNodeState("node1", "in1")
 *
 * // With only outgoing
 * getNodeState("node1", undefined, ["out1", "out2"])
 */
export const getNodeState = (
  current: string,
  incoming?: string[],
  outgoing?: string[]
): NodeState | undefined => {
  if (incoming && outgoing) {
    // if both incoming and outgoing are present
    return conStr0([
      byteString(current),
      conStr0([list(incoming.map(byteString))]),
      conStr0([list(outgoing.map(byteString))]),
    ]);
  } else if (incoming) {
    // if only incoming is present
    return conStr0([
      byteString(current),
      conStr0([list(incoming.map(byteString))]),
      conStr1([]),
    ]);
  } else if (outgoing) {
    // if only outgoing is present
    return conStr0([
      byteString(current),
      conStr1([]),
      conStr0([list(outgoing.map(byteString))]),
    ]);
  } else {
    throw new Error('Either incoming or outgoing must be provided.');
  }
};
/**
 * Initializes an escrow transaction with given parameters.
 * @param seller - The seller's address to be deserialized
 * @param current - The current node state
 * @param hashBpmn - The hash of the BPMN document
 * @param incoming - Optional parameter for incoming node connection
 * @param outgoing - Optional parameter for outgoing node connections
 * @returns {InitEscrow} Returns an initialized escrow transaction object
 */

export const initEscrow = ({
  seller,
  buyer,
  current,
  hashBpmn,
  incoming,
  outgoing,
  proceed,
}: InitEscrowParams): InitEscrow => {
  const { pubKeyHash: sellerPubKeyHash } = deserializeAddress(seller);
  const { pubKeyHash: buyerPubKeyHash } = deserializeAddress(buyer);
  if (!getNodeState(current, incoming, outgoing)) {
    throw new Error(
      'NodeState is undefined. Please provide valid current, incoming, or outgoing parameters.'
    );
  }
  return conStr0([
    byteString(buyerPubKeyHash),
    byteString(sellerPubKeyHash),
    getNodeState(current, incoming, outgoing)!,
    byteString(hashBpmn),
    integer(proceed),
  ]);
};

/**
 * Update the escrow transaction with new node state and proceed value.
 *
 * @param buyer - The buyer's address in string format.
 * @param initDatum - The initial escrow data containing fields for seller, node state, hash BPMN, and proceed flag.
 * @returns The `ActiveEscrow` object constructed from the provided buyer and initial escrow data.
 */
export const initEscrow2activeEscrow = (
  initDatum: InitEscrow,
  artifactCID: string
): ActiveEscrow => {
  const [buyer, seller, nodeState, hashBpmn, proceed] = initDatum.fields;
  return conStr1([
    buyer,
    seller,
    nodeState,
    byteString(Buffer.from(artifactCID).toString('hex')),
    hashBpmn,
    proceed,
  ]);
};
/**
 * Creates an ActiveEscrow transaction datum
 * @param buyer - The buyer's address
 * @param seller - The seller's address
 * @param current - The current node state
 * @param hashBpmn - The hash of the BPMN diagram
 * @param proceed - The proceed value
 * @param incoming - Optional incoming node reference
 * @param outgoing - Optional array of outgoing node references
 * @returns An ActiveEscrow transaction datum
 */
export const activeEscrow = ({
  buyer,
  seller,
  current,
  hashBpmn,
  artifactCID,
  proceed,
  incoming,
  outgoing,
}: ActiveEscrowParams): ActiveEscrow => {
  const { pubKeyHash: buyerPubKeyHash } = deserializeAddress(buyer);
  const { pubKeyHash: sellerPubKeyHash } = deserializeAddress(seller);

  if (!getNodeState(current, incoming, outgoing)) {
    throw new Error(
      'NodeState is undefined. Please provide valid current, incoming, or outgoing parameters.'
    );
  }
  return conStr1([
    byteString(buyerPubKeyHash),
    byteString(sellerPubKeyHash),
    getNodeState(current, incoming, outgoing)!,
    byteString(Buffer.from(artifactCID).toString('hex')),
    byteString(hashBpmn),
    integer(proceed),
  ]);
};
/**
 * Updates the escrow datum with new node state and proceed value
 * @param oldDatum - The current escrow datum containing buyer, seller, nodeState, hashBpmn and proceed values
 * @param newNodeState - The new node state to update to
 * @param newProceed - The additional proceed value to add to existing proceed
 * @returns A new concatenated string containing the updated datum values
 */
export const updateDatum = (
  oldDatum: InitEscrow,
  newNodeState: NodeState,
  artifactCID: string
): ActiveEscrow => {
  const [buyer, seller, _nodeState, hashBpmn, proceed] = oldDatum.fields;
  console.log('hashBpmn:', hashBpmn);
  const artifactCidIn = Buffer.from(artifactCID).toString('hex');
  const byteStringArtifactCidIn = byteString(artifactCidIn);
  try {
    return conStr1([
      buyer,
      seller,
      newNodeState,
      byteStringArtifactCidIn,
      hashBpmn,
      proceed,
    ]);
  } catch (error) {
    console.error('Error updating datum:', error);
    throw error;
  }
};

export const updateActiveDatum = (
  oldDatum: ActiveEscrow,
  newNodeState: NodeState,
  artifactCID: string
): ActiveEscrow => {
  const [buyer, seller, _nodeState, _oldArtifactCID, hashBpmn, proceed] =
    oldDatum.fields;
  const artifactCidIn = Buffer.from(artifactCID).toString('hex');
  const byteStringArtifactCidIn = byteString(artifactCidIn);
  try {
    return conStr1([
      buyer,
      seller,
      newNodeState,
      byteStringArtifactCidIn,
      hashBpmn,
      proceed,
    ]);
  } catch (error) {
    console.error('Error updating datum:', error);
    throw error;
  }
};
