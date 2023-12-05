// app/api/route.js 👈🏽

import { NextResponse } from "next/server";


async function get_ranks() {

}

// IDK HOW TO USE NEXTJS THESE DAMN ROUTES CANT CONNECT TO INTERWEBS

// To handle a GET request to /api
export async function GET(request) {
  // const chainId = 43114; // Avalanche C-Chain chain ID
  // const AVAX_PROVIDER = new ethers.providers.JsonRpcProvider('https://responsive-radial-seed.avalanche-mainnet.quiknode.pro/e8cac8b24cf15f52e355fc8dbe86d0f235da7d4a/ext/bc/C/rpc/', { chainId });
  // // Check network information
  // const network = await AVAX_PROVIDER.getNetwork();
  // const AVAX_WOOFY_CONTRACT = new ethers.Contract('0xBaCD77aC0c456798e05de15999CB212129d90b70', woofyAbi, AVAX_PROVIDER)
  // const AVAX_MULTICALL_CONTRACT = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', [
  //   `function tryAggregate(bool requireSuccess, tuple(address target, bytes data)[] memory calls) returns (tuple(bool success, bytes data)[] memory returnData)`,
  // ], AVAX_PROVIDER);

  // let ret = [];
  // const n = 1000;
  // const target = AVAX_WOOFY_CONTRACT.address;
  // let all = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  // for (let i = 0; i < all.length;) {
  //   let ranks = all.slice(i, i += n);
  //   let res = await AVAX_MULTICALL_CONTRACT.callStatic.tryAggregate(false, ranks.map(x => {
  //     return { target, data: `0xf0342988${x.toString(16).padStart(64, '0')}` }; // metadataIdToTokenId(uint256)
  //   }));
  //   res.forEach(({ success, data }, i) => {
  //     if (success && !is_null_hex(data)) {
  //       ret.push([parseInt(data), ranks[i]]);
  //     }
  //   });
  // }
  // console.log(ret)
  //return NextResponse.json(res, { status: 200 });
}