# Decentraland LandWorks Rents

This strategy allows calculating the VP of Land/Estate owners after ownership is transferred to the LandWorks contract.
Whenever a DCL LAND/Estate owner lists a property in LandWorks, a 1:1 LandWorks ERC-721 is given back to him. This LW ERC-721 has the option to be staked
in a separate contract.

The goal of this strategy is to include the VP to users that have listed their properties in LandWorks. VP is only given to owners of the DCL LAND/Estate.

## Example

The following example params are for obtaining the VP users have after sending their Lands/Estates to the LandWorks contract on Ethereum Mainnet.

```json
{
  "subgraphs": {
    "landworks": "https://api.thegraph.com/subgraphs/name/enterdao/landworks"
  },
  "addresses": {
    "estate": "0x959e104E1a4dB6317fA58F8295F586e1A978c297",
    "land": "0xF87E31492Faf9A91B02Ee0dEAAd50d51d56D5d4d",
    "stakingContract": "0x36e59268239022702d88716f25fb462fa588ea4d"
  },
  "multipliers": {
    "land": 2000
  }
}
```

The land multiplier determines how much VP is given by each LAND the address possesses in the LandWorks contract. For example, if the user has 5 LANDs in the LandWorks contract, he will receive 5 \* 2000 VP.
Additionally, if the user has 1 Estate in LandWorks contract, which is composed of 5 lands, the user will be given 5 \* 2000 VP as well.
