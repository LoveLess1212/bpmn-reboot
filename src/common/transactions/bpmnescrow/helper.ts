import { conStr0, byteString, conStr1, deserializeAddress, integer, list } from "@meshsdk/core";
import { NodeState, InitEscrow, ActiveEscrow } from "./types";

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
    incoming?: string,
    outgoing?: string[]
): NodeState => {
    if (incoming && outgoing) { // if both incoming and outgoing are present
        return conStr0([
            byteString(current),
            conStr0([byteString(incoming)]),
            conStr0([list(outgoing.map(byteString))])
        ])
    } else if (incoming) { // if only incoming is present
        return conStr0([
            byteString(current),
            conStr0([byteString(incoming)]),
            conStr1([])
        ])
    }
    return conStr0([
        byteString(current),
        conStr1([]),
        conStr0([list(outgoing.map(byteString))])
    ])
};
/**
 * Initializes an escrow transaction with given parameters.
 * @param seller - The seller's address to be deserialized
 * @param price - The price amount for the escrow
 * @param current - The current node state
 * @param hashBpmn - The hash of the BPMN document
 * @param incoming - Optional parameter for incoming node connection
 * @param outgoing - Optional parameter for outgoing node connections
 * @returns {InitEscrow} Returns an initialized escrow transaction object
 */
export const initEscrow = (
    seller: any,
    price: number,
    current: string,
    hashBpmn: string,
    incoming?: string,
    outgoing?: string[],
): InitEscrow => {
    const { pubKeyHash: sellerPubKeyHash } = deserializeAddress(seller);
    return conStr0([
        byteString(sellerPubKeyHash),
        integer(price),
        getNodeState(current, incoming, outgoing),
        byteString(hashBpmn),
        integer(2000000)
    ])
};

/**
 * Update the escrow transaction with new node state and proceed value.
 *
 * @param buyer - The buyer's address in string format.
 * @param initDatum - The initial escrow data containing fields for seller, price, node state, hash BPMN, and proceed flag.
 * @returns The `ActiveEscrow` object constructed from the provided buyer and initial escrow data.
 */
export const initEscrow2activeEscrow = (buyer: string, initDatum: InitEscrow): ActiveEscrow => {
    const { pubKeyHash: buyerPubKeyHash } = deserializeAddress(buyer);
    const [seller, price, nodeState, hashBpmn, proceed] = initDatum.fields;
    return conStr1([
        byteString(buyerPubKeyHash),
        seller,
        price,
        nodeState,
        hashBpmn,
        proceed
    ])
};
/**
 * Creates an ActiveEscrow transaction datum
 * @param buyer - The buyer's address
 * @param seller - The seller's address
 * @param price - The price of the transaction
 * @param current - The current node state
 * @param hashBpmn - The hash of the BPMN diagram
 * @param proceed - The proceed value
 * @param incoming - Optional incoming node reference
 * @param outgoing - Optional array of outgoing node references
 * @returns An ActiveEscrow transaction datum
 */
export const activeEscrow = (
    buyer: any,
    seller: any,
    price: number,
    current: string,
    hashBpmn: string,
    proceed: number,
    incoming?: string,
    outgoing?: string[],
): ActiveEscrow => {
    const { pubKeyHash: buyerPubKeyHash } = deserializeAddress(buyer);
    const { pubKeyHash: sellerPubKeyHash } = deserializeAddress(seller);
    return conStr1([
        byteString(buyerPubKeyHash),
        byteString(sellerPubKeyHash),
        integer(price),
        getNodeState(current, incoming, outgoing),
        byteString(hashBpmn),
        integer(proceed)
    ])
};
/**
 * Updates the escrow datum with new node state and proceed value
 * @param oldDatum - The current escrow datum containing buyer, seller, price, nodeState, hashBpmn and proceed values
 * @param newNodeState - The new node state to update to
 * @param newProceed - The additional proceed value to add to existing proceed
 * @returns A new concatenated string containing the updated datum values
 */
export const updateDatum = (oldDatum: ActiveEscrow, newNodeState: NodeState, newProceed: number) => {
    const [buyer, seller, price, _nodeState, hashBpmn, proceed] = oldDatum.fields;
    const new_proceed: number = Number(proceed.int.valueOf()) + newProceed;
    return conStr1([
        buyer,
        seller,
        price,
        newNodeState,
        hashBpmn,
        integer(new_proceed)
    ])
};