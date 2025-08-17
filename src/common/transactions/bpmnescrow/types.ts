import { ConStr0, BuiltinByteString, ConStr1, List, Integer } from "@meshsdk/core"

export type NodeState = ConStr0<[
    BuiltinByteString,
    ConStr0<[BuiltinByteString]> | ConStr1<[]>,
    ConStr0<[List<BuiltinByteString>]> | ConStr1<[]>
]>
export type ActiveEscrow = ConStr1<[
    BuiltinByteString,
    BuiltinByteString,
    Integer,
    NodeState,
    BuiltinByteString,
    Integer
]>
export type InitEscrow = ConStr0<[
    BuiltinByteString,
    Integer,
    NodeState,
    BuiltinByteString,
    Integer
]>