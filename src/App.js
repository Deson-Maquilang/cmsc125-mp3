import React, {useState} from 'react';
import Table from './Table';
import './App.css';
import { jobList, memoryList, jobListSimulation, memoryListSimulation } from './Lists';

function App() {

  document.body.style = 'background: #ffffff;';
  document.title = 'Maquilang, Deson | MP3';

  //CONST STATES
  const [start, setStart] = useState(false);
  const [simulationType, setSimulationType] = useState("");
  const [jobListData, setJobListData] = useState(jobListSimulation)
  const [memoryListData,setMemoryListData] = useState(memoryListSimulation)
  const [throughPutVal, setThroughPutVal] = useState(0);
  const [queueTime, setQueueTime] = useState(0);
  const [internalFragementation, setInternalFragmentation] = useState(0);
  const [storageUtilization , setStorageUtilization] = useState(0);
  const [averageWaitingTime, setAverageWaitingTime] = useState(0);
  const [notUsed, setNotUsed] = useState(0)
  const [heavilyUsed, setHeavilyUsed] = useState(0)
  const [showButton, setShowButtons] = useState(true);
  var timerState, totalWaitingTime = 0, throughput = 0, fragmentation = 0, interalFramentation = 0;
  var time = 0, totalMemoryUsage = 0, totalProcessingJobs = 0, storageUtil = 0, percentageNotUsed = 0, percentageHeavilyUsed = 0;


  const handleStart = (type) => {
    setSimulationType(type);
    setStart(true);
  }

  //FUNCTIONS
  function startSimulation(type, memoryListData, jobListData) {
 
    var tempJobList = [...jobListData]
    var tempMemoryList = [...memoryListData]
  

    if(type === "worst-fit") {
      tempMemoryList = tempMemoryList.sort((a,b) => parseFloat(b.size) - parseFloat(a.size))
    }
    else if(type === "best-fit") {
      tempMemoryList = tempMemoryList.sort((a,b) => parseFloat(a.size) - parseFloat(b.size))
    }


    //pick each process and find suitable blocks
    for(var i = 0; i < tempJobList.length; i++) {

      for(var j = 0; j < tempMemoryList.length; j++) {
        if((tempMemoryList[j]['size']>= tempJobList[i]['jobSize']) && tempMemoryList[j]['status'] === "FREE" && tempJobList[i]['status'] === "STANDBY") {
          tempJobList[i]['time'] -= 1; //start decrement
          tempMemoryList[j]['status'] = "OCCUPIED BY JOB STREAM NO. " + tempJobList[i]['jobStream'];
          tempJobList[i]['utilizedSpace'] = ((tempJobList[i]['jobSize']/ tempMemoryList[j]['size']) * 100).toFixed(2) + "%";
          fragmentation += tempMemoryList[j]['size'] - tempJobList[i]['jobSize'];
          tempMemoryList[j]['occupiedBy'] = i;
          tempMemoryList[j]['jobs'] += 1;
          tempJobList[i]['status'] = "ONGOING";
          break;
        } 
        if(tempJobList[i]['time'] == 0) {
           //FREE UP MEMORY BLOCK ONCE PROCESS IS DONE
          if(tempMemoryList[j]['occupiedBy'] == i) {
            tempMemoryList[j]['status'] = "FREE";
            tempJobList[i]['status'] = "DONE";
          }
        }
      }

      //DECREMENT TIME FOR JOB PROCESSES THAT ARE ONGOING 
      if(tempJobList[i]['status'] == "ONGOING") {
        if(tempJobList[i]['time'] > 0) {
          tempJobList[i]['time'] -= 1;
        } 
      }

      if(tempMemoryList.filter((data) => data.status == "FREE").length == tempMemoryList.length) {
        clearInterval(timerState);
      }

      //INCREMENT WAITING TIME FOR JOB PROCESSES THAT ARE NOT ONGOING AND DONE
      if(tempJobList[i]['status'] == "STANDBY")  {
        tempJobList[i]['waitingTime'] += 1;
      }

    }

    time++;

          let occupied = 0;

          for (let j = 0; j < tempMemoryList.length; j++) {
              if (tempMemoryList[j].status != "FREE") {
                  occupied++;
              }
          }

          totalMemoryUsage += (occupied / tempMemoryList.length) * 100;

     
          let processing = 0;
          for (let i = 0; i < tempJobList.length; i++) {
              if (tempJobList[i].status == "ONGOING") {
                  processing++;
              }
          }

          totalProcessingJobs += processing;

          let notUsed = 0;
          for (let i = 0; i < tempMemoryList.length; i++) {
            if (tempMemoryList[i].jobs === 0) {
                notUsed++;
            }
          }

          let heavilyUsed = 0;
  
          for (let i = 0; i < tempMemoryList.length; i++) {
            if(tempMemoryList[i]['jobs'] >= ((40/100) * tempMemoryList.length)){
              heavilyUsed++;
            }
          }

  
      percentageNotUsed = ((notUsed / tempMemoryList.length) * 100).toFixed(2); 
      setNotUsed(percentageNotUsed)
      percentageHeavilyUsed = ((heavilyUsed / tempMemoryList.length) * 100).toFixed(2); 
      setHeavilyUsed(percentageHeavilyUsed)
      throughput = (totalProcessingJobs / time).toFixed(2);
      setThroughPutVal(throughput);
      storageUtil = (totalMemoryUsage/time).toFixed(2);
      setStorageUtilization(storageUtil)
      totalWaitingTime = time;
      setQueueTime(totalWaitingTime)

      // get average waiting time
      let totalWaiting = 0;
      for (let i = 0; i < tempJobList.length; i++) {
          totalWaiting += tempJobList[i].waitingTime;
      }

      setAverageWaitingTime((totalWaiting/tempJobList.length).toFixed(2))
      setInternalFragmentation(fragmentation)

  }


  React.useEffect(() => {
    if(start) {  
      setShowButtons(false) 
      timerState = setInterval(function () {
      startSimulation(simulationType, memoryListData, jobListData)
      },1000);
    } 
  },[simulationType])

  return (
    <div className="App">
      {showButton && (
        <div className='row'>
          <h2 className='dataset-header'>Select partioning method to run:  
            <button className='run-btn' onClick={() => handleStart("first-fit")}>FIRST-FIT</button>
            <button className='run-btn worst-fit' onClick={() => handleStart("worst-fit")}>WORST-FIT</button>
            <button className='run-btn best-fit' onClick={() => handleStart("best-fit")}>BEST-FIT</button>
          </h2>
        </div>
      )}
      {!showButton && (
        <div className='row'>
          <button className='close-btn' onClick={() => window.location.reload()}>CLOSE</button>
        </div>
      )}
            <h3 className='simulation-header'> {simulationType}  </h3>
        <Table
            type={"Summary Performance of the System"}
            tableData={[{throughPut: throughPutVal, storageUtil: storageUtilization, partitionsNotUsed: notUsed + "%", partitionsHeavilyUsed: heavilyUsed + "%", waitingQueue: queueTime, waitingInQueue: averageWaitingTime, fragmentation: internalFragementation + " bytes"}]}
            headingColumns={["THROUGHPUT", "STORAGE UTILIZATION", "PARTITION NOT USED", "PARTITION HEAVILY USED" , "WAITING QUEUE LENGTH", "WAITING TIME IN QUEUE", "TOTAL INTERNAL FRAGMENTATION"]}
            rowsPerPage={10}
      />
        <div className='row'>
            <div className='col-6'>
              <Table
                  type={"Data Set: Memory List"}
                  tableData={memoryList}
                  headingColumns={["MEMORY BLOCK","SIZE"]}
              />

              <Table
                  type={"Data Set: Job List"}
                  tableData={jobList}
                  headingColumns={["JOB STREAM","TIME","JOB SIZE"]}
              />
            </div>

          <div className='col-6'>
            <Table
                type={"Simulated: Memory List"}
                tableData={memoryListSimulation}
                headingColumns={["MEMORY BLOCK", "STATUS" , "NO. OF JOBS HANDLED" , "LAST OCCUPIED BY" ,"SIZE"]}
            />
            <Table
                type={"Simulated: Job List"}
                tableData={jobListSimulation}
                headingColumns={["JOB STREAM", "STATUS", "WAITING TIME", "TIME", "UTILIZED SPACE", "JOB SIZE"]}
            />
          </div>
        </div>
        <h1 className="text-end">
        MACHINE PROBLEM 3
      </h1>
      <h1 className="text-end">
        ON MEMORY MANAGEMENT AND ALLOCATION STRATEGIES
      </h1>
      <h1 className="text-end">
        DESON G. MAQUILANG
      </h1>
    </div>
  );
}

export default App;
