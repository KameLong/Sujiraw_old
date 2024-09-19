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
import {SettingView, TimetablePDFSetting} from "./SettingView";

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






    const [layout,setLayout]=useState<TimetablePDFSetting>({
        tripInParagraph:20,
        paragraphPerPage:1,
        orderType:0,
        topPadding:30,
        leftPadding:20,
        rightPadding:20,
        paragraphPadding:20,
        stationNameWidth:20,

        fontSize:10,
        lineHeight:1.2,

    });




    const getPage=()=>{
        const tripnum=Math.max(route.upTrips.length,route.downTrips.length);
        // if(settingOpen){
        //     return  [...Array(1)].map((_, i) => i)
        // }
//         return  [...Array(1)].map((_, i) => i)
       return  [...Array(Math.ceil(tripnum/layout.tripInParagraph))].map((_, i) => i)
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
            fontSize: (layout.fontSize)+'pt',
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

                <SettingView layout={layout}
                setLayout={(data=>{
                    setLayout(data);
                    setSettingOpen(false);
                })}></SettingView>
            </CustomDialog>
            <PDFViewer style={{height:'calc(100% - 10px)',width:'100%'}}>
                <Document>
                    {
                        getPage().map((page,i)=> {
                            return(
                                <Page size="A4" style={styles.tableCell} key={i}>

                                    <View wrap={false} style={{
                                        marginTop:layout.topPadding+'mm',
                                        marginLeft:layout.leftPadding+'mm',
                                        marginRight:layout.rightPadding+'mm',
                                        display:"flex",flexDirection: "row"
                                    }}>
                                        <View style={{alignItems:'stretch',borderLeft:"1px solid black"}}/>
                                        <div style={{width:layout.stationNameWidth+'mm'}}>
                                            <PDFStationView   stations={getStationProps()} direction={0} setting={layout}/>
                                        </div>
                                            <View style={{display:"flex",flexDirection: "row"}}>
                                                {route.downTrips.slice(page*layout.tripInParagraph,(page+1)*layout.tripInParagraph).map((trip) => {
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
                                        marginTop: layout.paragraphPadding + 'mm',
                                        marginLeft: layout.leftPadding + 'mm',
                                        marginRight: layout.rightPadding + 'mm',
                                        display: "flex", flexDirection: "row"
                                    }}>
                                        <View style={{alignItems: 'stretch', borderLeft: "1px solid black"}}/>
                                        <div style={{width: layout.stationNameWidth + 'mm'}}>
                                            <PDFStationView   stations={getStationProps()} direction={1} setting={layout}/>
                                        </div>
                                            <View>
                                                <View style={{display: "flex", flexDirection: "row"}}>
                                                    {route.upTrips.slice(page * layout.tripInParagraph, (page+1)*layout.tripInParagraph).map((trip) => {
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





