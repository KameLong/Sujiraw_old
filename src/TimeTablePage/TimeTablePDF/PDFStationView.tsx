import React from "react";

import {Text, View} from "@react-pdf/renderer";
import {TimeTablePageSetting} from "../TimeTablePage";
import {StationProps} from "../StationView";
import {stationStyle} from "../Util";
import {PDFTimeTableLayout} from "./TimeTablePDF";

interface PDFStationViewProps {
    stations: StationProps[];
    setting: PDFTimeTableLayout;
    direction: number;
}

function PDFStationView({stations,setting,direction}:PDFStationViewProps){
    const showStations=(direction===0)?stations: stations.slice().reverse();

    return (
        <View style={{width:'100%',borderRight:"1px solid black"}}>
            <div style={{borderBottom: "1px solid #000"}}></div>
            <div >
               <Text style={{paddingLeft:'2px'}}>列車番号</Text>
            </div>
            <div>
                <Text style={{paddingLeft:'2px'}}>列車種別</Text>
            </div>
            <div style={{borderBottom: "1px solid #000"}}></div>

            {
                showStations.map((station, _i) => {
                    switch (stationStyle(station,direction)) {
                        case 1:
                        case 2:
                            return (
                                <div style={{
                                    whiteSpace: 'nowrap',
                                    overflow: "hidden",
                                }} key={station.rsID}>
                                    <Text style={{paddingLeft:'2px',height:(setting.lineHeight*0.1)+'px',overflow:'hidden'}}>
                                       {station.name}
                                        </Text>
                                </div>
                            );
                        case 3:
                            return (
                                <div style={{
                                    whiteSpace: 'nowrap',
                                    overflow: "hidden",
                                }} key={station.rsID}>
                                    <Text style={{paddingLeft:'2px',verticalAlign:'sub', height:((setting.lineHeight*0.1)*2)+'px',fontSize:(setting.fontSize*0.13)+'pt'}}>{station.name}</Text>
                                </div>
                            );
                    }
                })
            }
            <div style={{borderBottom: "1px solid #000"}}></div>
        </View>

    );
}

export default PDFStationView;