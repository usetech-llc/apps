// https://github.com/usetech-llc/nft_parachain#ui-custom-types
const defaultNftTypes = `{
  "Schedule": {
      "version": "u32",
      "put_code_per_byte_cost": "Gas",
      "grow_mem_cost": "Gas",
      "regular_op_cost": "Gas",
      "return_data_per_byte_cost": "Gas",
      "event_data_per_byte_cost": "Gas",
      "event_per_topic_cost": "Gas",
      "event_base_cost": "Gas",
      "call_base_cost": "Gas",
      "instantiate_base_cost": "Gas",
      "dispatch_base_cost": "Gas",
      "sandbox_data_read_cost": "Gas",
      "sandbox_data_write_cost": "Gas",
      "transfer_cost": "Gas",
      "instantiate_cost": "Gas",
      "max_event_topics": "u32",
      "max_stack_height": "u32",
      "max_memory_pages": "u32",
      "max_table_size": "u32",
      "enable_println": "bool",
      "max_subject_len": "u32"
    },
    "AccessMode": {
      "_enum": [
        "Normal",
        "WhiteList"
      ]
    },
    "DecimalPoints": "u8",
    "CollectionMode": {
      "_enum": {
        "Invalid": null,
        "NFT": null,
        "Fungible": "DecimalPoints",
        "ReFungible": "DecimalPoints"
      }
    },
    "Ownership": {
      "Owner": "AccountId",
      "Fraction": "u128"
    },
    "FungibleItemType": {
      "Value": "u128"
    },
    "NftItemType": {
      "Owner": "AccountId",
      "ConstData": "Vec<u8>",
      "VariableData": "Vec<u8>"
    },
    "ReFungibleItemType": {
      "Owner": "Vec<Ownership<AccountId>>",
      "ConstData": "Vec<u8>",
      "VariableData": "Vec<u8>"
    },
    "CollectionType": {
      "Owner": "AccountId",
      "Mode": "CollectionMode",
      "Access": "AccessMode",
      "DecimalPoints": "DecimalPoints",
      "Name": "Vec<u16>",
      "Description": "Vec<u16>",
      "TokenPrefix": "Vec<u8>",
      "MintMode": "bool",
      "OffchainSchema": "Vec<u8>",
      "SchemaVersion": "SchemaVersion",
      "Sponsor": "AccountId",
      "SponsorConfirmed": "bool",
      "Limits": "CollectionLimits",
      "VariableOnChainSchema": "Vec<u8>",
      "ConstOnChainSchema": "Vec<u8>"
    },
    "RawData": "Vec<u8>",
    "Address": "AccountId",
    "LookupSource": "AccountId",
    "Weight": "u64",
    "CreateNftData": {
      "const_data": "Vec<u8>",
      "variable_data": "Vec<u8>" 
    },
    "CreateFungibleData": {
      "value": "u128"
    },
    "CreateReFungibleData": {
      "const_data": "Vec<u8>",
      "variable_data": "Vec<u8>" 
    },
    "CreateItemData": {
      "_enum": {
        "NFT": "CreateNftData",
        "Fungible": "CreateFungibleData",
        "ReFungible": "CreateReFungibleData"
      }
    },
    "SchemaVersion": {
      "_enum": [
        "ImageURL",
        "Unique"
      ]
    },
    "CollectionId": "u32",
    "TokenId": "u32",
    "ChainLimits": {
      "CollectionNumbersLimit": "u32",
      "AccountTokenOwnershipLimit": "u32",
      "CollectionAdminsLimit": "u64",
      "CustomDataLimit": "u32",
      "NftSponsorTimeout": "u32",
      "FungibleSponsorTimeout": "u32",
      "RefungibleSponsorTimeout": "u32",
      "OffchainSchemaLimit": "u32",
      "VariableOnChainSchemaLimit": "u32",
      "ConstOnChainSchemaLimit": "u32"
    },
    "CollectionLimits": {
      "AccountTokenOwnershipLimit": "u32",
      "SponsoredMintSize": "u32",
      "TokenLimit": "u32",
      "SponsorTimeout": "u32"
    },
    "AccountInfo": "AccountInfoWithProviders",
    "AccountInfoWithProviders": {
      "nonce": "Index",
      "consumers": "RefCount",
      "providers": "RefCount",
      "data": "AccountData"
    }
}`;

export default defaultNftTypes;
