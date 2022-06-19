import React from "react";

function Table({type, tableData, counter, headingColumns}) {
    let tableClass = 'table-container__table';

    tableClass += ' table-container_table--break-md';

  const data = tableData.map((row, index) => {
        
        let rowData = [];
        let i = 0;
        
        for(const key in row) {
            rowData.push({
                key: headingColumns[i],
                val: row[key]
            });
            i++;
        }

        if(type === 'ongoing') {
          return <tr key={row.id}>
            {rowData.map((data, index) => 
            <td key={index} data-heading={data.key} className={"table-cell"}>{index != 4 ? data.val : counter[index].duration }</td>)}
            </tr>      
        } else {

          if(row.status === 'ongoing') {
            return
          }

          return <tr key={row.id}>
            {rowData.map((data, index) => 
            <td key={index} data-heading={data.key} className={"table-cell"}>{data.val}</td>)}
            </tr>
        }
    });

  return (
    <main>
      <div className={type === "pending" ? "pending  resource-card table-container" : "resource-card table-container"}>
        <div className="table-header-cont">
          <h1 className="table-header">{type}</h1>
        </div>
        <table className={tableClass}>
          <thead>
            <tr>
              {headingColumns.map((col,index) => (
                <th key={index} className="table-columns">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data}
          </tbody>
        </table>
      </div>
    </main>
  );
}

export default Table;