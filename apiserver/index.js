const express = require('express');
const app = express();
const excel = require('xlsx');
const path = require('path');
const SwaggerParser = require("@apidevtools/swagger-parser");

const workbook = excel.readFile(path.join(__dirname,'PSGCPublication.xlsx'));
const psgcWorksheet = workbook.Sheets['PSGC'];

const minimized = (e)=>{ // use on map to minimize data, removed population and income data
   return { Code : e['Code'], Name: e['Name'], ['Geographic level']: e['Geographic Level']}
}

/**
 * use if the services structure is used in the future
 */
   // const parser = new SwaggerParser();
   // (async function(){
   //    const api = await parser.dereference(path.join(__dirname,'api/index.yaml'));
   //    for(let p of Object.getOwnPropertyNames(api.paths)){
   //       console.log(`Path = ${p}, Service Provider = ${api.paths[p].serviceProvider}, Operation = ${api.paths[p].serviceProviderOp}`);
   //    }
   // })()
/**
 * 
 */

const GEOGRAPHIC_LEVEL = "GeographicLevel";
/**
 * Change complicated key to much simpler keys.
 * "POPULATION\r\n(2015 POPCEN)" to Population.
 * "Urban / Rural\r\n(based on 2015 POPCEN)" to UrbanRural.
 * "Income\r\nClassification" to Income.
 * "Geographic Level to GeographicLevel.
 */
const transform = (e)=>{
   let transformed = {};
   for (let k of Object.getOwnPropertyNames(e)){

      if(k.toLowerCase().startsWith("urban")){
         transformed.UrbanRural = e[k];continue;
      }
      if(k.toLowerCase().startsWith("popu")){
         transformed.Population = e[k];continue;
      }
      if(k.toLowerCase().startsWith("incom")){
         transformed.Income = e[k];continue;
      }
      if(k.toLowerCase().startsWith("geog")){
         transformed[GEOGRAPHIC_LEVEL] = e[k];continue;
      }

      transformed[k] = e[k];
  }

   return transformed;
}

let alls = excel.utils.sheet_to_json(psgcWorksheet);
// all = alls.map(minimized);
all = alls.map(transform);
app.use('/psgc/apiv1/definition',express.static(path.join(__dirname,'api')));
app.use(express.json());

const filter = (req,res,next)=>{
   console.log('params = ',req.params);
   console.log('query = ',req.query);
   console.log('url=',req.url);
   const LUZON = 'luzon';
   const VISAYAS = 'visayas';
   const MINDANAO = 'mindanao';

   let { islandgroup, region, prov, district, city, mun, bgy, geolevel } = req.query;
   let data = [...all];
   
   

   if(islandgroup){
      switch(islandgroup.toLowerCase()){
         case LUZON: {
            data = data.filter(d => 
                     String(d.Code).startsWith("01") || 
                     String(d.Code).startsWith("02") ||
                     String(d.Code).startsWith("03") ||
                     String(d.Code).startsWith("04") ||
                     String(d.Code).startsWith("05") || 
                     String(d.Code).startsWith("13")  
               )
            
         }
         break;
         case VISAYAS: {
            data = data.filter(d => 
               String(d.Code).startsWith("06") || 
               String(d.Code).startsWith("07") ||
               String(d.Code).startsWith("08")
            )
         }
         break;
         case MINDANAO: {
            data = data.filter(d => 
               String(d.Code).startsWith("09") || 
               String(d.Code).startsWith("10") ||
               String(d.Code).startsWith("11") || 
               String(d.Code).startsWith("12") ||
               String(d.Code).startsWith("14") ||
               String(d.Code).startsWith("15") ||
               String(d.Code).startsWith("16") 
            )
         }
      }
   }

   if(region){
      switch(String(region)){
         case "1" : data = data.filter( d => String(d.Code).startsWith("01") ); break;
         case "2" : data = data.filter(  d => String(d.Code).startsWith("02") ); break;
         case "3" : data = data.filter(  d => String(d.Code).startsWith("03") ); break;
         case "4" : data = data.filter(  d => String(d.Code).startsWith("04") ); break;
         case "5" : data = data.filter(  d => String(d.Code).startsWith("05") ); break;
         case "6" : data = data.filter(  d => String(d.Code).startsWith("06") ); break;
         case "7" : data = data.filter(  d => String(d.Code).startsWith("07") ); break;
         case "8" : data = data.filter(  d => String(d.Code).startsWith("08") ); break;
         case "9" : data = data.filter(  d => String(d.Code).startsWith("09") ); break;
         case "10" : data = data.filter(  d => String(d.Code).startsWith("10") ); break;
         case "11" : data = data.filter(  d => String(d.Code).startsWith("11") ); break;
         case "12" : data = data.filter(  d => String(d.Code).startsWith("12") ); break;
         case "13" : data = data.filter(  d => String(d.Code).startsWith("13") ); break;
         case "ncr" : data = data.filter(  d => String(d.Code).startsWith("13") ); break; //ncr = region 13
         case "14" : data = data.filter(  d =>  String(d.Code).startsWith("14") ) ; break;
         case "car" : data = data.filter(  d => String(d.Code).startsWith("14") ); break; // car = region 14
         case "15" : data = data.filter(  d => String(d.Code).startsWith("15") ); break;
         case "armm" : data = data.filter(  d => String(d.Code).startsWith("15") ); break;
         case "16" : data = data.filter(  d => String(d.Code).startsWith("16") ); break;
         case "caraga" : data = data.filter(  d => String(d.Code).startsWith("16") ); break; //caraga = region 16
         case "17" : data = data.filter(  d => String(d.Code).startsWith("17") ); break;
         case "mimaropa" : data = data.filter(  d =>String(d.Code).startsWith("17") ); break; //mimaropa = region 17
      }
   }

   if(prov){
      //get the prov with name
      let province = data.find( d => d.Name.toLowerCase() === prov.toLowerCase());
      console.log('Prov',province)
      if(province){
         //get the province code
         let code = province.Code.slice(0,4); //reg_prov
         data = data.filter( d=> String(d.Code).startsWith(code));
      }else{
         data = [];
      }
      
   }

   if(city){
      let foundCity = data.find( d => d.Name.toLowerCase() === city.toLowerCase())
      if(foundCity){
         let code = foundCity.Code.slice(0,6);
         //special case for City Of Manila
         //it uses entire 1339 code
         if(foundCity.Name.toLowerCase() === 'city of manila'){
            code = "1339";
         }

         console.log(code);
         data = data.filter( d => 
            String(d.Code).startsWith(code) && d[GEOGRAPHIC_LEVEL] !== 'City' && d[GEOGRAPHIC_LEVEL] !== 'Dist'
         ); //exclude the city/district  from the result it's the same
      }else{
         data = [];
      }
   }else if(mun){
      console.log('Mun',mun)
      let foundMun = data.find( d => d.Name.toLowerCase() === mun.toLowerCase())
      if(foundMun){
         let code = foundMun.Code.slice(0,6);
         data = data.filter( d=> String(d.Code).startsWith(code) && d[GEOGRAPHIC_LEVEL] !== 'Mun');//exclude the municipality from the result
      }else{
         data = [];
      }
   }

   if(geolevel){//reducer filter, only purpose is to reduce data after the above conditions
      
      data = data.filter( d => {
         if(!d[GEOGRAPHIC_LEVEL]){
            console.log('element with Undefined geo',d); //for element with undefined geolevel, some element has undefined geo level on excel
            return false;
         }
         return d[GEOGRAPHIC_LEVEL].toLowerCase() === geolevel.toLowerCase();
      });
    
   }

   res.json(data);
}

app.get('/',filter);

app.get('/islandgroups',function(req,res,next){
   res.json({data: ['Luzon','Visayas','Mindanao']});
});

app.get('/bgys',function(req,res,next){
	res.json({
		data: all.filter(e => e[GEOGRAPHIC_LEVEL] === "Bgy")
	})
});

app.get('/cities',function(req,res,next){
	res.json({
		data: all.filter(e=>e[GEOGRAPHIC_LEVEL] === "City")
	})
});

app.get('/municipalities',function(req,res,next){
	res.json({
		data: all.filter(e=>e[GEOGRAPHIC_LEVEL] === "Mun").reduce((acc,el,i)=>{
				if(!req.query.name){
					acc.push(el);
					return acc;
				}
            el["Name"].toUpperCase() === req.query.name.toUpperCase()? acc.push(el): null;
				return acc;
			},[])
   })
   
});

app.get('/districts',function(req,res,next){
	res.json({
		data: all.filter(e=>e[GEOGRAPHIC_LEVEL] === "Dist")
	})
});

app.get('/regions',function(req,res,next){
	res.json({
		data: all.filter(e=>e[GEOGRAPHIC_LEVEL] === "Reg")
	})
});

app.get('/provinces',function(req,res,next){
	res.json({
		data: all.filter(e=>e[GEOGRAPHIC_LEVEL] === "Prov")
	})
});

app.listen(8085,() => console.log('Running on port',8085))

