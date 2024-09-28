import {useParams} from "react-router-dom";
import Box from "@mui/material/Box";
import {Fab} from "@mui/material";
import {Settings} from "@mui/icons-material";
import React, {useEffect, useState} from "react";
import {Document, Font, Line, Page, PDFDownloadLink, PDFViewer, Rect, StyleSheet, Svg, Text, View} from "@react-pdf/renderer";
import {OrderType} from "../../TimeTablePage/TimeTablePDF/SettingView";
import {loadCompany, loadRoute, Route, RouteInfo, Station, Train, TrainType} from "../../DiaData/DiaData";
import {useDiagramHook} from "../DiagramHook";
import {DiagramLine} from "../DiagramCanvas";
import {PDFSetting} from "./DiagramPDFPage";
import {DiagramStation} from "../DiagramData";

export interface DiagramPDFDocumentProps{
    layout:PDFSetting,
    routeStations:DiagramStation[],
    downLines:DiagramLine[],
    upLines:DiagramLine[],
    routeInfo:{[key:number]:RouteInfo}
}

export  function DiagramPDFDocument({layout,routeStations,downLines,upLines,routeInfo}:DiagramPDFDocumentProps){
    // ttfファイルのフォント定義
    Font.register({
        family: "NotoSansJP",
        src: "/font/NotoSansJP.ttf",
    });
    Font.register({
        family: "DiaPro",
        src: "/font/DiaPro-Regular.ttf",
    });
    const styles = StyleSheet.create({
        main: {
            fontSize: (layout.fontSize)+'pt',
            fontFamily: "NotoSansJP",
            backgroundColor:"#F8F8F8",
        },
    });
    const xTime=3600*3;
    const startTime=3600*3;

    const diagramXratio:number=(210-layout.leftMargin-layout.rightMargin-layout.stationWidth)/xTime;
    const diagramYratio:number=(layout.diagramHeight-layout.fontSize*1.2)/(routeStations.slice(-1)[0].stationTime);
    const xpos=(time:number,sTime:number):number=>{
        return (time-sTime)*diagramXratio+layout.stationWidth;
    }
    const ypos=(time:number):number=>{
        return (time)*diagramYratio+layout.fontSize*1.2;
    }

    const ViewLine=(lines:DiagramLine[],startTime:number,endTime:number):any[]=>{
        const res:any[]=[];
        lines.map(line=>{
            for(let i=0;i<line.points.length-1;i++){
                if(line.points[i].x>endTime&&line.points[i+1].x>endTime){
                    continue;
                }
                if(line.points[i].x<startTime&&line.points[i+1].x<startTime){
                    continue;
                }
                res.push(
                    <Line x1={xpos(line.points[i].x,startTime)} x2={xpos(line.points[i+1].x,startTime)} y1={ypos(line.points[i].y)} y2={ypos(line.points[i+1].y)}
                          stroke={line.color} strokeWidth={0.2}></Line>
                )
            }
        });
        return res;
    }
    const StationNameView=():any[]=>{
        return routeStations.map(station=> {
            return(
                <Text
                    y={ypos(station.stationTime)+layout.fontSize*(1.2-1.3)}
                    style={{fontSize:layout.fontSize,fontFamily:"NotoSansJP"}}
                >
                    {station.station.name}
                </Text>
            )
        });
    }

    return(
                <Document >
                    {
                        new Array(4).fill(0).map((_,i)=> {
                            return(
                                <Page size="A4" style={styles.main}>
                                    {new Array(2).fill(0).map((_,j)=>{
                                    return(
                                <Svg height={`${layout.diagramHeight}mm`} width={`${210-layout.leftMargin-layout.rightMargin}mm`}  style={{
                                    marginTop:`${layout.topMargin}mm`,
                                    marginLeft:`${layout.leftMargin}mm`,
                                    marginRight:`${layout.rightMargin}mm`,
                                    backgroundColor:"white",
                                    fontFamily:"NotoSansJP"
                                }}
                                     viewBox={`0 0 ${210-layout.leftMargin-layout.rightMargin} ${layout.diagramHeight}`}
                                >
                                    <Line x1={layout.stationWidth} y1={0} x2={layout.stationWidth} y2={200} stroke="gray" strokeWidth={0.3}/>
                                    <Line x1={0} y1={layout.fontSize*1.2} x2={210-layout.leftMargin-layout.rightMargin} y2={layout.fontSize*1.2} stroke="gray" strokeWidth={0.3}/>
                                    {
                                        ViewLine(downLines,startTime+xTime*(j+2*i),startTime+xTime*(j+2*i+1)).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    {
                                        ViewLine(upLines,startTime+xTime*(j+2*i),startTime+xTime*(j+2*i+1)).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    <Rect x={0} y={0} width={layout.stationWidth} height={layout.diagramHeight} fill="white"/>
                                    {
                                        StationNameView().map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                </Svg>
                                );})}
                                </Page>
                            );
                        })
                    }
            </Document>

)
}