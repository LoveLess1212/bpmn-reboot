import {
  ConStr0,
  BuiltinByteString,
  ConStr1,
  List,
  Integer,
} from '@meshsdk/core';

export type NodeState = ConStr0<
  [
    BuiltinByteString,
    ConStr0<[List<BuiltinByteString>]> | ConStr1<[]>,
    ConStr0<[List<BuiltinByteString>]> | ConStr1<[]>
  ]
>;
export type ActiveEscrow = ConStr1<
  [
    BuiltinByteString, //buyer
    BuiltinByteString, //seller
    NodeState, //workflow state
    BuiltinByteString, //artifactCID
    BuiltinByteString, //hash BPMN
    Integer // proceed
  ]
>;
export type InitEscrow = ConStr0<
  [
    BuiltinByteString, //buyer
    BuiltinByteString, //seller
    NodeState, //workflow state
    BuiltinByteString, //hash BPMN
    Integer // proceed
  ]
>;

export interface ActiveEscrowParams {
  buyer: any;
  seller: any;
  current: string;
  hashBpmn: string;
  artifactCID: string;
  proceed: number;
  incoming?: string[];
  outgoing?: string[];
}

export interface InitEscrowParams {
  seller: any;
  buyer: any;
  current: string;
  hashBpmn: string;
  incoming?: string[];
  outgoing?: string[];
}
