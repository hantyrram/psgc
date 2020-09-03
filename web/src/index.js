import React, {useEffect} from 'react';
import ReactDOM from 'react-dom';
// import SwaggerUI from "swagger-ui-react";

import SwaggerUI from 'swagger-ui';
import "swagger-ui-react/swagger-ui.css";
// const App = () => <SwaggerUI url="apiv1/definition/index.yaml" />

// const App = () => {
//    useEffect(()=>{
//       SwaggerUI()
//    },[])
//    return('')
// }

// ReactDOM.render(<App />, document.getElementById("root"))

/**
 * 
 */
SwaggerUI({
  dom_id: '#root',
  url: "http://psgc.hantyr.com/psgc/apiv1/definition/index.yaml"
})




