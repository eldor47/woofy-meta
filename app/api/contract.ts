const { ethers } = require("ethers");

const chainId = 43114; // Avalanche C-Chain chain ID
const AVAX_PROVIDER = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc', { chainId });
const AVAX_WOOFY_CONTRACT = new ethers.Contract('0xBaCD77aC0c456798e05de15999CB212129d90b70', woofyAbi, AVAX_PROVIDER)
const AVAX_MULTICALL_CONTRACT = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', [
  `function tryAggregate(bool requireSuccess, tuple(address target, bytes data)[] memory calls) returns (tuple(bool success, bytes data)[] memory returnData)`,
], AVAX_PROVIDER);

import woofyAbi from "./woofyabi.json"

export async function fetchRevealStatus(JSONData: any) {
    let ret: number[][] = [];
    const n = 1000;
    const target = AVAX_WOOFY_CONTRACT.address;
    let all = Array.from(Array(5556).keys());
    for (let i = 0; i < all.length;) {
      let ranks = all.slice(i, i += n);
      let res = await AVAX_MULTICALL_CONTRACT.callStatic.tryAggregate(false, ranks.map(x => {
        return { target, data: `0xf0342988${x.toString(16).padStart(64, '0')}` }; // metadataIdToTokenId(uint256)
      }));
      res.forEach(({ success, data }: any, i: any) => {
        if (success) {
          ret.push([parseInt(data), ranks[i]]);
        }
      });
    }

    var newJsonData = [...JSONData] as any
    for (var i of ret) {
      if (i[0] === 0) {
        newJsonData[i[1] - 1]?.attributes.push({ trait_type: 'Reveal Status', value: 'Not Revealed' })
        if (newJsonData[i[1] - 1]) {
          newJsonData[i[1] - 1]["revealed"] = false
          newJsonData[i[1] - 1]["tokenId"] = i[0]
        }
      } else {
        newJsonData[i[1] - 1]?.attributes.push({ trait_type: 'Reveal Status', value: 'Revealed' })
        if (newJsonData[i[1] - 1]) {
          newJsonData[i[1] - 1]["revealed"] = true
          newJsonData[i[1] - 1]["tokenId"] = i[0]
        }
      }
    }
    
    console.log(newJsonData)
    return newJsonData
}

export async function fetchWallets() {
    let userArray = []
    const n = 1000;
    const target = AVAX_WOOFY_CONTRACT.address;
    let all = Array.from(Array(5556).keys());
    for (let i = 0; i < all.length;) {
      let ids = all.slice(i, i += n);
      let res = await AVAX_MULTICALL_CONTRACT.callStatic.tryAggregate(false, ids.map(x => {
        return { target, data: `0x6352211e${x.toString(16).padStart(64, '0')}` }; // ownerOf(uint256)
      }));
      res.forEach(({ success, data }: any, i: any) => {
        if (success) {
          var address = data.replace('000000000000000000000000', '')
          var userFind = userArray.find(a => a.address === address)
          if (userFind) {
            userFind.ids.push(ids[i])
          } else {
            userArray.push({
              address,
              ids: [ids[1]]
            })
          }
        }
      });
    }

    return userArray.sort((a,b) => b.ids.length - a.ids.length)
}