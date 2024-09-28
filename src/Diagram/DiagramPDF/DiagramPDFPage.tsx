import {useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import {Fab} from "@mui/material";
import {Settings} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {Document, Font, Line, Page, PDFDownloadLink, PDFViewer, StyleSheet, Svg, Text, View} from "@react-pdf/renderer";
import {OrderType} from "../../TimeTablePage/TimeTablePDF/SettingView";
import {loadCompany, loadRoute, Route, RouteInfo, Station, Train, TrainType} from "../../DiaData/DiaData";
import {useDiagramHook} from "../DiagramHook";
import {DiagramLine} from "../DiagramCanvas";
import {DiagramPDFDocument} from "./DiagramPDFDocument";

export interface PDFSetting{
    fontSize:number,
    leftMargin:number,
    rightMargin:number,
    topMargin:number,
    stationWidth:number,
    diagramHeight:number,

}

export function DiagramPDFPage(){
    const param = useParams<{ routeID:string }>();
    const routeID=parseInt(param.routeID??"0");
    const [layout,setLayout]=React.useState<PDFSetting>({
        fontSize:3,
        leftMargin:10,
        rightMargin:10,
        topMargin:10,
        stationWidth:20,
        diagramHeight:130,

    });


    const {routeStations, downLines, upLines, routeInfo} = useDiagramHook(routeID);

    if(routeStations.length===0){
        return <div>loading...</div>
    }





    return (
        <div style={{height: '100%', width: '100%'}}>
            <Box sx={{'& > :not(style)': {m: 1}, position: 'fixed', bottom: 20, right: 20}}>
                <Fab color="primary" aria-label="add" onClick={() => console.log("todo")}>
                    <Settings/>
                </Fab>
            </Box>
            <PDFViewer style={{width: '100%', height: '100%'}}>
                    <DiagramPDFDocument upLines={upLines} downLines={downLines} routeStations={routeStations} routeInfo={routeInfo} layout={layout}/>
            </PDFViewer>


                {/*<PDFDownloadLink*/}
                {/*    style={{fontSize:20}}*/}
                {/*    document={*/}
                {/*    <DiagramPDFDocument upLines={upLines} downLines={downLines} routeStations={routeStations} routeInfo={routeInfo} layout={layout}/>*/}
                {/*    }*/}
                {/*    fileName={`ダイヤグラム.pdf`}*/}
                {/*>*/}
                {/*    {({ loading }) =>*/}
                {/*        loading ? "Loading...": "PDF ready for download"*/}
                {/*    }*/}
                {/*</PDFDownloadLink>*/}

        </div>
            );


            }