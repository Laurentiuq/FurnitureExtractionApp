import React, {useState} from 'react';

const OutputComp = ({dictionaryData}) => {


  // Convert the dictionaryData into an array of key-value pairs
  
  const dictionaryEntries = Object.entries(dictionaryData);
  const hasEntries = dictionaryEntries.length;
  return (
    <div>
      {hasEntries? (
      <div style={{height: '500px', width: '440px', overflow:'scroll'}}>
        
        <h2 style={{marginLeft: '5px'}}>Results:</h2>
        
        <ul style={{fontSize: '17px', color: '#999999'}}>
          {dictionaryEntries.map(([key, value]) => (
            <li key={key}>
              <strong>{value}</strong>
            </li>
          ))}
        </ul>
      </div>
      ) :(<div></div>)}
    </div>
    
  );
};

export default OutputComp;
