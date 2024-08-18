// import * as fs from 'fs';
const fs = require('fs');
const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("../public/diadata.txt");

console.log("test");

//駅追加
// ファイル読み込み
//  const data:string[] = fs.readFileSync("./station20240426free.csv", 'utf-8').split("\n");
//  const stationList:number[] = [];
//  data.forEach((line) => {
//      const lines = line.split(",");
//      const stationID=Number.parseInt(lines[1]);
//      if(isNaN(stationID)){
//          return;
//      }
//      if(stationList.includes(stationID)){
//             return;
//      }
//         stationList.push(stationID);
//
//      const stationName=lines[2];
//      const lon=Number.parseFloat(lines[9]);
//      const lat=Number.parseFloat(lines[10]);
//      db.serialize(() => {
//          db.run("insert into station(station_id,station_name,lat,lon) values(?,?,?,?)", stationID, stationName, lat, lon);
//      });
//  });

const data:string[] = fs.readFileSync("./trainType.txt", 'utf-8').split("\r\n");
console.log(data);
for(let i=1;i<data.length;i++){
 if(data[i].startsWith("#")){
  break;
 }
 const data2=data[i].split("\t");
 console.log(data2);
     db.serialize(() => {
         db.run("insert into type(type_id,name,short_name,color,bold,dot) values(?,?,?,?,?,?)",i-1, data2[0], data2[1], data2[2], data2[3],data2[4]);
     });
}

 db.close()


