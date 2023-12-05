// pages/index.tsx
'use client'
import { useEffect, useState } from 'react';
const { ethers } = require("ethers");
import woofyAbi from "./api/woofyabi.json"
import woofyMeta from "./api/woofymeta.json"

const Home = () => {
  const [JSONData, setJSONData ] = useState(woofyMeta)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const [selectedTraitType, setSelectedTraitType] = useState('');
  const [selectedTraitValue, setSelectedTraitValue] = useState('');
  const [filteredData, setFilteredData] = useState(JSONData);
  const [currentItems, setCurrentItems] = useState(filteredData.slice(indexOfFirstItem, indexOfLastItem));

  let uniqueTraitTypes = Array.from(
    new Set(
      JSONData.flatMap((item) =>
        item.attributes.map((attribute) => attribute.trait_type)
      )
    )
  );

  let uniqueTraitValues = Array.from(
    new Set(
      JSONData.flatMap((item) =>
        item.attributes
          .filter((attribute) => attribute.trait_type === selectedTraitType)
          .map((attribute) => attribute.value)
      ).sort()
    )
  );

  useEffect(() => {
    setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem))
  }, [currentPage])

  useEffect(() => {
    async function fetch() {
      const chainId = 43114; // Avalanche C-Chain chain ID
      const AVAX_PROVIDER = new ethers.providers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc', { chainId });
      // Check network information
      const network = await AVAX_PROVIDER.getNetwork();
      const AVAX_WOOFY_CONTRACT = new ethers.Contract('0xBaCD77aC0c456798e05de15999CB212129d90b70', woofyAbi, AVAX_PROVIDER)
      const AVAX_MULTICALL_CONTRACT = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', [
        `function tryAggregate(bool requireSuccess, tuple(address target, bytes data)[] memory calls) returns (tuple(bool success, bytes data)[] memory returnData)`,
      ], AVAX_PROVIDER);
    
      let ret: number[][] = [];
      const n = 1000;
      const target = AVAX_WOOFY_CONTRACT.address;
      let all = Array.from(Array(5555).keys());
      for (let i = 0; i < all.length;) {
        let ranks = all.slice(i, i += n);
        let res = await AVAX_MULTICALL_CONTRACT.callStatic.tryAggregate(false, ranks.map(x => {
          return { target, data: `0xf0342988${x.toString(16).padStart(64, '0')}` }; // metadataIdToTokenId(uint256)
        }));
        res.forEach(({ success, data }:any, i:any) => {
          if (success) {
            ret.push([parseInt(data), ranks[i]]);
          }
        });
      }


      var newJsonData = [...JSONData] as any
      for(var i of ret) {
        if(i[0] === 0) {
          newJsonData[i[1]-1]?.attributes.push({trait_type: 'Reveal Status', value: 'Not Revealed'})
          if(newJsonData[i[1]-1]) {
            newJsonData[i[1]-1]["revealed"] = false
          }
        } else {
          newJsonData[i[1]-1]?.attributes.push({trait_type: 'Reveal Status', value: 'Revealed'})
          if(newJsonData[i[1]-1]) {
            newJsonData[i[1]-1]["revealed"] = true
          }
        }
      }
      console.log(newJsonData)
      setJSONData(newJsonData)
      setFilteredData(newJsonData)
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      uniqueTraitTypes = Array.from(
        new Set(
          newJsonData.flatMap((item: { attributes: any[]; }) =>
            item.attributes.map((attribute) => attribute.trait_type)
          )
        )
      );
    
      uniqueTraitValues = Array.from(
        new Set(
          newJsonData.flatMap((item: { attributes: any[]; }) =>
            item.attributes
              .filter((attribute) => attribute.trait_type === selectedTraitType)
              .map((attribute) => attribute.value)
          ).sort()
        )
      );
      setCurrentPage(1)
    }
    fetch()

  }, [])

  const handleTraitTypeChange = (event: { target: { value: any; }; }) => {
    const traitType = event.target.value;
    setSelectedTraitType(traitType);
    setSelectedTraitValue('');

    if (traitType !== '') {
      const filtered = JSONData.filter((item) =>
        item.attributes.some((attr) => attr.trait_type === traitType)
      );
      setFilteredData(filtered);
      setCurrentItems(filtered.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    } else {
      setFilteredData(JSONData);
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    }
  };

  const handleTraitValueChange = (event: { target: { value: any; }; }) => {
    const traitValue = event.target.value;
    setSelectedTraitValue(traitValue);

    if (traitValue !== '') {
      const filtered = JSONData.filter((item) =>
        item.attributes.some(
          (attr) =>
            attr.trait_type === selectedTraitType && attr.value === traitValue
        )
      );
      setFilteredData(filtered);
      setCurrentItems(filtered.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    } else {
      setFilteredData(JSONData);
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    }
  };

  const dropdownStyle = {
    height: '35px',
    backgroundColor: 'whitesmoke',
    color: 'black',
    border: 'none',
    borderRadius: '5px',
    fontSize: '18px'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', fontSize: '30px', fontWeight: 'bold' }}>
        <h1>Woofy Finder</h1>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <select
          id="traitType"
          value={selectedTraitType}
          onChange={handleTraitTypeChange}
          style={dropdownStyle}
        >
          <option value="">Select a trait type</option>
          {uniqueTraitTypes.map((traitType, index) => (
            <option key={index} value={traitType}>
              {traitType}
            </option>
          ))}
        </select>

        <select
          id="traitValue"
          value={selectedTraitValue}
          onChange={handleTraitValueChange}
          style={dropdownStyle}
        >
          <option value="">Select a trait value</option>
          {uniqueTraitValues.map((traitValue, index) => (
            <option key={index} value={traitValue}>
              {traitValue}
            </option>
          ))}
        </select>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
        <p><b>{filteredData.length}</b> shown</p>
        <p><b>{filteredData.filter((a:any) => a.revealed === true).length}</b>/<b>{filteredData.length}</b> ({Math.floor((filteredData.filter((a:any) => a.revealed === true).length / filteredData.length) * 100)}%) revealed</p>
        <p><b>{ITEMS_PER_PAGE}</b> per page</p>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'top', gap: '20px' }}>
        {currentItems.map((item, index) => (
          <div key={index}>
            <div>
              <h2 style={{ textAlign: 'center' }}>{item.name}</h2>
              <img style={{ borderRadius: '10px' }} src={item.image} alt={item.name} width="200" />
              <ul style={{ listStyleType: 'none' }}>
                {item.attributes.map((attribute, attrIndex) => (
                  <li key={attrIndex}>
                    <strong>{attribute.trait_type}:</strong> {attribute.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      {/* Pagination */}
      <div>
        {filteredData.length > ITEMS_PER_PAGE && (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', gap: '5px', marginTop: '30px', marginBottom: '30px', flexWrap: 'wrap' }}>
            {Array.from({ length: Math.ceil(filteredData.length / ITEMS_PER_PAGE) }, (_, i) => (
              <button disabled={i === currentPage - 1} style={{ width: '50px', height: '50px', fontSize: '20px' }} key={i} onClick={() => paginate(i + 1)}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
