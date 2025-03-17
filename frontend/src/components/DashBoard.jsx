import React,{ useState }  from "react";


function DashBoard(props){

    return (
        <button className = "dashboard-component" >
            {props.value}
        </button>
    )
}

export default DashBoard;