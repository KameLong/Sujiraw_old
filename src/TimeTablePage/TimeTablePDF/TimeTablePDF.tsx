import React, { useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import PDFStationView from "./PDFStationView";
import PDFTripView from './PDFTripView';


import {Page, PDFViewer, Document, Font,StyleSheet,View} from "@react-pdf/renderer";
import {Button, Dialog, DialogContent, Fab, TextField} from "@mui/material";
import { styled } from '@mui/system';
import {Settings} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {EditRoute, loadCompany, loadRoute, Route, RouteInfo, Station, Train, TrainType} from "../../DiaData/DiaData";
import { SettingView} from "./SettingView";

const CustomDialog = styled(Dialog)({
    '& .MuiDialog-paper': {
        // Add your custom styles here
        width: '800px', // Example: set the width to 80%
        margin: '5px',
    },
});

export function TimeTablePDF() {
    const [stations, setStations] = useState<{[key:number]:Station}>({});
    const [trainTypes, setTrainTypes] = useState<{[key:number]:TrainType}>({});
    const [trains, setTrains] = useState<{[key:number]:Train}>({});
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    const [routes, setRoutes] = useState<{[key:number]:Route}>({});

    const navigate=useNavigate();
    const [settingOpen,setSettingOpen]=useState(false);

    const param = useParams<{ routeID:string,direct: string  }>();
    const routeID=parseInt(param.routeID??"0");


    const route=routes[routeID];

    useEffect(() => {
        loadCompany().then((company)=>{
            setStations(company.stations);
            setTrainTypes(company.trainTypes);
            setTrains(company.trains);
            setRouteInfo(company.routes);
        });
    }, []);
    useEffect(() => {
        const res=Object.values(routeInfo).find((routeInfo)=>{
            return routeInfo.name==="阪急宝塚本線";
        });
        if(routeID===0&&res!==undefined){
            navigate(`/TimeTablePDF/${res.routeID}`);
        }
        if(routes[routeID]===undefined){
            loadRoute(routeID).then((route)=>{
                EditRoute.sortTrips(route,0,0);
                setRoutes((prev)=>{
                    const next  = {...prev};
                    if(route!==undefined){
                        next[route.routeID]=route;
                    }
                    return next;
                })
            });
        }

    }, [routeInfo,routeID]);






    const [layout,setLayout]=useState<PDFTimeTableLayout>({
        marginTop:30,
        marginLeft:5,
        pageMargin:20,
        stationWidth:20,
        trainPerPage:30,

        fontSize:70,
        trainWidth:6,
        lineHeight:80
    });




    const getPage=()=>{
        const tripnum=Math.max(route.upTrips.length,route.downTrips.length);
        if(settingOpen){

            return  [...Array(1)].map((_, i) => i)
        }
         return  [...Array(1)].map((_, i) => i)
       return  [...Array(Math.ceil(tripnum/layout.trainPerPage))].map((_, i) => i)
    }


    function getStationProps(){
        return routes[routeID].routeStations.map((item)=>{
            return {
                rsID:item.rsID,
                name:stations[item.stationID]?.name??"",
                style:item.showStyle
            }
        });
    }


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
        tableCell: {
            fontSize: (layout.fontSize*0.1)+'pt',
            fontFamily: "NotoSansJP",
        },
    });
    if(route===undefined){
        return <div>loading</div>
    }



    return (
        <div style={{height:'100%',width:'100%'}}>
            <Box sx={{ '& > :not(style)': { m: 1 }, position: 'fixed', bottom: 20, right: 20 }}>
                <Fab color="primary" aria-label="add" onClick={()=>setSettingOpen(true)}>
                    <Settings/>
                </Fab>
            </Box>
            <CustomDialog open={settingOpen} onClose={e=>{
                setSettingOpen(false);
            }}
                    maxWidth="lg"
            >

                <SettingView ></SettingView>
            </CustomDialog>
            <PDFViewer style={{height:'calc(100% - 10px)',width:'100%'}}>
                <Document>
                    {
                        getPage().map((page,i)=> {
                            return(
                                <Page size="A4" style={styles.tableCell} key={i}>

                                    <View wrap={false} style={{
                                        marginTop:layout.marginTop+'mm',
                                        marginLeft:layout.marginLeft+'mm',
                                        display:"flex",flexDirection: "row",width:`${layout.trainWidth*layout.trainPerPage+layout.stationWidth}mm`}}>
                                        <View style={{alignItems:'stretch',borderLeft:"1px solid black"}}/>
                                        <div style={{width:layout.stationWidth+'mm'}}>
                                            <PDFStationView   stations={getStationProps()} direction={0} setting={layout}/>
                                        </div>
                                            <View style={{display:"flex",flexDirection: "row"}}>
                                                {route.downTrips.slice(page*layout.trainPerPage,(page+1)*layout.trainPerPage).map((trip) => {
                                                    return (
                                                        <PDFTripView  key={trip.tripID} trip={trip} stations={getStationProps()}
                                                                      direction={0} setting={layout} type={trainTypes[trip.trainTypeID]}
                                                        />
                                                    )
                                                })}
                                                <View style={{alignItems:'stretch',borderLeft:"0.5px solid black"}}/>
                                            </View>
                                    </View>
                                    <View wrap={false} style={{
                                        marginTop: layout.pageMargin + 'mm',
                                        marginLeft: layout.marginLeft + 'mm',
                                        display: "flex", flexDirection: "row"
                                    }}>
                                        <View style={{alignItems: 'stretch', borderLeft: "1px solid black"}}/>
                                        <div style={{width: layout.stationWidth + 'mm'}}>
                                            <PDFStationView   stations={getStationProps()} direction={1} setting={layout}/>
                                        </div>
                                            <View>
                                                <View style={{display: "flex", flexDirection: "row"}}>
                                                    {route.upTrips.slice(page * layout.trainPerPage, (page+1)*layout.trainPerPage).map((trip) => {
                                                        return (
                                                            <PDFTripView   key={trip.tripID} trip={trip}
                                                                         stations={getStationProps()}
                                                                           direction={1}
                                                                           setting={layout}
                                                                           type={trainTypes[trip.trainTypeID]}

                                                            />
                                                        )
                                                    })}
                                                </View>
                                            </View>
                                            <View style={{alignItems: 'stretch', borderLeft: "0.5px solid black"}}/>
                                    </View>
                                </Page>

                        )
                        })
                    }
                </Document>
            </PDFViewer>
        </div>
    );
}

export interface PDFTimeTableLayout{
    marginTop:number;
    marginLeft:number;
    pageMargin:number;
    fontSize:number;
    stationWidth:number;
    trainWidth:number;
    trainPerPage:number;
    lineHeight:number;

}



