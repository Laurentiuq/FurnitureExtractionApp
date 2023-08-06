import React from 'react'
import {useState, useEffect, useRef} from 'react'
import {Chart} from 'react-google-charts'
import './App.css';
import OutputComp from './OutputComp';
import ClimbingBoxLoader from "react-spinners/ClimbingBoxLoader"
function App() {
  // the url given by the user to parse
  const [link, setLink] = useState('')
  // selected option by the user -> parse a single page or find pages inside the given url and parse them for the NER model
  const [selectedOption, setSelectedOption] = useState('')
  // data transformed so that it can be processed by the previously processed piechart 
  const [transformedData, setTransformedData] = useState([])
  // the number of most common (hardcoded) products found in the recognised entities
  const [predictDataNr, setpredictDataNr] = useState(["Product", "Number of occurences"])
  // entities identified as furniture products by the model
  const [predictData, setPredictData] = useState({})
  // options for already preddicted products piechart
  const [options, setOptions] = useState({})
  // options for the newly found products piechart
  const [optionsFound, setOptionsFound] = useState({})
  // for the loading animation while the predictions are made
  const [loading, setLoading] = useState(false)

  let opt = {
    title: 'Previously processed data',
    titleTextStyle: {
      color: '#aeb2b8',
      fontSize: 15,
      bold: true,
    },
    // array with colors of dark grey nouances for the piechart
    colors: [
      "#363636",
      "#404040",
      "#4d4d4d",
      "#595959",
      "#666666",
      "#737373",
      "#808080",
      "#8c8c8c",
      "#999999",
      "#a6a6a6",
      "#b3b3b3",
      "#bfbfbf",
      "#cccccc",
      "#d9d9d9",
      "#e5e5e5",
      "#f2f2f2",
      "#1c1c1c",
      "#262626",
      "#303030",
      "#3a3a3a"
    ],
    
    legend: 'none',
    pieSliceText: 'label',
    backgroundColor: '#282c34',
    textAlign: 'center',
    is3D: true,
    slices: {
    }
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault();

    // setLoading while the server processes the request
    setLoading(true);

    fetch('/home', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({'link': link, 'selectedOption': selectedOption}),
      
    })
      .then(response => response.json())
      .then((data) => {
        var nr_occ = data.nr_occ
        const products_list = data.products
        setPredictData(products_list)
        nr_occ = Object.entries(nr_occ)
        // sort the objects so that the one with the most occurences is first
        nr_occ.sort((a,b) => b[1] - a[1])
        // add the neccesary row so that it works for the piechart
        nr_occ.splice(0, 0, ["Product", 'Number of occurences'])

        setpredictDataNr(nr_occ)
        // for stoping the loading animation after the request is processed
        setLoading(false)
      })
      .catch(error => {
        // set a message to be shown in response if there is an error
        setPredictData({"Invalid":"Invalid data. Please try another link."})
        console.log(error)
        // stop the loading animation
        setLoading(false)
      })
      setLink('')
      setSelectedOption('')
  };

  useEffect(() => {
    // fetch data from the NER script
    fetch("/home")
      .then((res) => res.json())
      .then((dataFromServer) => {
                // Transform data into a format that PieChart can read
                // setData(dataFromServer)
                const transformedData = Object.entries(dataFromServer)
                setTransformedData(transformedData)
                let offsetSize = 0.05
                let offsizeIncrement = 1
                // Sort the data in order to have the smallest slices on the outside
                transformedData.sort((a, b) => b[1] - a[1])
                transformedData.splice(0, 0, ['Product', 'Number of mentions'])
                // Set an offset for each slice such that the smallest slices are more visible
                for(let index = 1; index < transformedData.length; index++) {
                  opt.slices[index] = {offset: offsetSize}
                  setOptions(opt)
                  offsetSize *= offsizeIncrement
                  offsizeIncrement = offsizeIncrement + 0.03
                }
                let optFound = {...opt}
                optFound.title = "Occurences from your input"
                setOptionsFound(optFound)
              });
              
  }, []);


  return (
    <div className="container">
    <div className='loader-container'>
      {!loading? (
      <div className='form-container'>
        <p className='info'>
          *Please paste the link from which you want the AI model to extract furniture products.
          Then, choose one of the two options.
          If you select "Link with a page of products," please note that this will parse most of the URLs contained on the provided page, which may take some time
        </p>
        <form  action='/' method='POST' onSubmit={handleSubmit}>

          <input className='link-input'
            type='text'
            name='link'
            value={link}
            placeholder='Paste the link here'
            onChange={(event) => {setLink(event.target.value)}}
          />

          <div className = "form-radio-buttons-container">

              <input className='radio-button'
                id = 'option1'
                type='radio' 
                name='option1'
                value='option1'
                checked={selectedOption === 'option1'}
                onChange={(event) => {setSelectedOption(event.target.value)}}/>
              <label htmlFor='option1' className='radio-button-label'> 
                Link of a single product
              </label>

            <input className='radio-button'
                id = 'option2'
                type='radio' 
                name='option2'
                value='option2'
                checked={selectedOption === 'option2'}
                onChange={(event) => {setSelectedOption(event.target.value)}} />
            <label htmlFor='option2' className='radio-button-label'>
              Link with a page of products
            </label>
            <button type='submit' on>Submit</button>

          </div>


        </form>
          
           <OutputComp dictionaryData={predictData}  />
          
        </div>) : (<ClimbingBoxLoader color="#67817c" />)}
      </div>


      <div className='output-container'>
        <div>
          <Chart
            chartType="PieChart"
            data={transformedData}
            options={options}
            onLoad={() => console.log(transformedData)}
            width="100%"
            height="400px"
            />
        </div>
        <div>
          {predictDataNr.length > 2 ?
          <Chart
              chartType="PieChart"
              data={predictDataNr}
              options={optionsFound}
              onLoad={() => console.log(predictDataNr)}
              width="100%"
              height="400px"
            />
            :
            <></>
          }
        </div>
      </div>

  
     
    </div>
  )
}

export default App