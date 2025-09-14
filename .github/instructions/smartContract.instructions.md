---
applyTo: '**/*.ts'
---
# BPMN Choreography Enactment Smart Contract Documentation

## Overview

The `enact_bpmn` validator implements a smart contract that enforces business process choreography execution on the Cardano blockchain. It manages workflow transitions between buyers and sellers following a predefined BPMN (Business Process Model and Notation) workflow, handling both normal execution paths and compensation scenarios.

## Contract Structure

### Data Types

#### BpmnEnactDatum
The contract uses two main datum states:

1. **InitState** - The initial contract state
   - `buyer`: ByteArray - The public key hash of the buyer
   - `seller`: ByteArray - The public key hash of the seller
   - `workflow`: NodeState - The initial workflow state
   - `hashBpmn`: DataHash - Hash of the BPMN workflow definition
   - `proceed`: Int - The amount to be paid upon successful completion (in lovelace)

2. **ActiveState** - The state during workflow execution
   - Contains all InitState fields plus:
   - `artifactCid`: ByteArray - IPFS Content ID referencing task deliverables

#### NodeState
Represents a task state in the BPMN workflow:
   - `current`: DataHash - Hash of the current task
   - `incoming`: Option<List<DataHash>> - List of hashes of previous tasks
   - `outgoing`: Option<List<DataHash>> - List of hashes of possible next tasks

#### EnactActions (Redeemers)
The contract supports three redeemer actions:
   - `Task`: Progresses to the next task in the workflow
   - `Compensated`: Ends the workflow with refund to the seller
   - `Uncompensated`: Completes the workflow with payment to the seller

## Transaction Flow

### Contract Initialization
1. Create a transaction that locks funds at the script address
2. Include the `InitState` datum with:
   - Buyer and seller public key hashes
   - Initial workflow state
   - BPMN definition hash
   - Proceed amount

### Task Progression (`Task` Redeemer)
1. Submit a transaction spending the UTxO at the script address
2. Include both buyer and seller signatures
3. Create a new output at the script address with an `ActiveState` datum
4. Ensure the new workflow state is a valid transition from the previous state
5. Include a valid IPFS CID for any task deliverables

### Compensation (`Compensated` Redeemer)
1. Submit a transaction spending the UTxO at the script address
2. Include both buyer and seller signatures
3. Do not create any outputs at the script address
4. Ensure exactly the proceed amount is paid to the seller address

### Successful Completion (`Uncompensated` Redeemer)
1. Submit a transaction spending the UTxO at the script address
2. Include both buyer and seller signatures
3. Do not create any outputs at the script address
4. Ensure exactly the proceed amount is paid to the seller address
5. Verify that the current workflow state has no outgoing transitions (terminal state)

## Validation Rules

### For Task Progression
1. Both buyer and seller must sign the transaction
2. The new workflow state must be valid:
   - The new task's current node must be in the outgoing list of the old task
   - The old task's current node must be in the incoming list of the new task
3. The artifact CID must be a valid IPFS content identifier
4. All datum fields except workflow and artifactCid must remain unchanged

### For Compensation
1. Both buyer and seller must sign the transaction
2. The transaction must include a payment to the seller of exactly the proceed amount
3. No outputs should be created at the contract address

### For Successful Completion
1. Both buyer and seller must sign the transaction
2. The workflow must be in a terminal state (no outgoing transitions)
3. The transaction must include a payment to the seller of exactly the proceed amount
4. No outputs should be created at the contract address
