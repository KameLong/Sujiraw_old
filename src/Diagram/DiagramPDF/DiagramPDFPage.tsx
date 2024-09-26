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

export interface PDFSetting{
    fontSize:number,
    leftMargin:number,
    rightMargin:number,
    topMargin:number,
    stationWidth:number,

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

    });
    const xTime=3600*6;
    const startTime=3600*3;

    const {routeStations, downLines, upLines, routeInfo} = useDiagramHook(routeID);

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
        },
    });

    const diagramXratio:number=(210-layout.leftMargin-layout.rightMargin)/xTime;
    const diagramYratio:number=(100-layout.topMargin)/(30*60);
    const xpos=(time:number):number=>{
        return (time-startTime)*diagramXratio;
    }
    const ypos=(time:number):number=>{
        return (time)*diagramYratio;
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
                    <Line x1={xpos(line.points[i].x)} x2={xpos(line.points[i+1].x)} y1={ypos(line.points[i].y)} y2={ypos(line.points[i+1].y)}
                          stroke={line.color} strokeWidth={0.2}></Line>
                )
            }
        });
        return res;
    }
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
                <PDFDownloadLink
                    style={{fontSize:20}}
                    document={
                        <Document>
                            <Page size="A4" style={styles.main}>
                                <Svg height="200mm" width={`${210-layout.leftMargin-layout.rightMargin}mm`}  style={{
                                    marginTop:`${layout.topMargin}mm`,
                                    marginLeft:`${layout.leftMargin}mm`,
                                    marginRight:`${layout.rightMargin}mm`,
                                    backgroundColor:"#F8F8FF"

                                }}
                                     viewBox={`0 0 ${210-layout.leftMargin-layout.rightMargin} 200`}
                                >
                                    <Line x1={layout.stationWidth} y1={0} x2={layout.stationWidth} y2={200} stroke="gray" strokeWidth={0.3}/>
                                    <Line x1={0} y1={layout.fontSize} x2={210-layout.leftMargin-layout.rightMargin} y2={layout.fontSize} stroke="gray" strokeWidth={0.3}/>
                                    <Text
                                        y={50}
                                        style={{fontSize:layout.fontSize}}
                                    >
                                        test
                                    </Text>
                                    {
                                        ViewLine(downLines,startTime,startTime+xTime).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                    {
                                        ViewLine(upLines,startTime,startTime+xTime).map(item=>{
                                            return React.cloneElement(item)
                                        })
                                    }
                                </Svg>
                            </Page>
                        </Document>
                    }
                    fileName={`ダイヤグラム.pdf`}

                >
                    {({ loading }) =>
                        loading ? "Loading...": "PDF ready for download"
                    }
                </PDFDownloadLink>

        </div>
            );


            }