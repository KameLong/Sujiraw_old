import React, { useEffect, useState} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import PDFStationView from "./PDFStationView";
import PDFTripView from './PDFTripView';


import {Page, PDFViewer, Document, Font,StyleSheet,View} from "@react-pdf/renderer";
import {Button, Dialog, Fab, TextField} from "@mui/material";
import {Settings} from "@mui/icons-material";
import Box from "@mui/material/Box";
import {EditRoute, loadCompany, loadRoute, Route, RouteInfo, Station, Train, TrainType} from "../../DiaData/DiaData";
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
        trainPerPage:25,

        fontSize:70,
        trainWidth:7,
        lineHeight:102
    });




    const getPage=()=>{
        const tripnum=Math.max(route.upTrips.length,route.downTrips.length);
        if(settingOpen){

            return  [...Array(1)].map((_, i) => i)
        }
         return  [...Array(1)].map((_, i) => i)
       // return  [...Array(Math.ceil(tripnum/layout.trainPerPage))].map((_, i) => i)
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
            <Dialog open={settingOpen} onClose={e=>{}}>
                <TextField label={"余白(上)"} sx={{m:2}} value={layout.marginTop} onChange={e=>{
                    setLayout(()=> {
                        let top= parseInt(e.target.value);
                        if(top<0||isNaN(top)){
                            top=0;
                        }
                        return {...layout, marginTop: top}
                    });
                }}></TextField>
                <TextField label={"余白(左)"} sx={{m:2}} value={layout.marginLeft}
                           onChange={e=>{
                               setLayout(()=> {
                                   let left= parseInt(e.target.value);
                                   if(left<0||isNaN(left)){
                                       left=0;
                                   }
                                   return {...layout, marginLeft: left}
                               });
                           }}></TextField>
                <TextField label={"余白(ページ間)"}sx={{m:2}} value={layout.pageMargin}
                           onChange={(e)=>{
                               setLayout(()=> {
                                   let margin= parseInt(e.target.value);
                                   if(margin<0||isNaN(margin)){
                                       margin=0;
                                   }
                                   return {...layout, pageMargin: margin}
                               });
                           }}
                ></TextField>
                <TextField label={"文字サイズ(×0.1pt)"} sx={{m:2}} value={layout.fontSize}
                           onChange={(e)=>{
                               setLayout(()=> {
                                   let size= parseInt(e.target.value);
                                   if(size<0||isNaN(size)){
                                       size=0;
                                   }
                                   return {...layout, fontSize: size}
                               });
                           }}></TextField>
                <TextField label={"1行の高さ(目安：文字サイズ*1.5)"} sx={{m:2}} value={layout.lineHeight}
                           onChange={(e)=>{
                               setLayout(()=> {
                                   let height= parseInt(e.target.value);
                                   if(height<0||isNaN(height)){
                                       height=0;
                                   }
                                   return {...layout, lineHeight: height}
                               });
                           }}></TextField>
                <TextField label={"駅名の幅"} sx={{m:2}} value={layout.stationWidth}
                           onChange={(e)=>{
                               setLayout(()=> {
                                   let width= parseInt(e.target.value);
                                   if(width<0||isNaN(width)){
                                       width=0;
                                   }
                                   return {...layout, stationWidth: width}
                               });
                           }}></TextField>
                <TextField label={"1列車の幅"} sx={{m:2}} value={layout.trainWidth}
                           onChange={(e)=>{
                               setLayout(()=> {
                                   let width= parseInt(e.target.value);
                                   if(width<0||isNaN(width)){
                                       width=0;
                                   }
                                   return {...layout, trainWidth: width}
                               });
                           }}></TextField>
                <TextField label={"1ページの列車数"} sx={{m:2}} value={layout.trainPerPage}
                           onChange={(e)=>{
                               setLayout(()=> {
                                   let num= parseInt(e.target.value);
                                   if(num<0||isNaN(num)){
                                       num=0;
                                   }
                                   return {...layout, trainPerPage: num}
                               });
                           }}></TextField>
                <Button onClick={e=>{
                    setSettingOpen(false);
                }}>OK</Button>

            </Dialog>
            <PDFViewer style={{height:'calc(100% - 10px)',width:'100%'}}>
                <Document>
                    {
                        getPage().map((page)=> {
                            return(
                                <Page size="A4" style={styles.tableCell} >

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
            </PDFViewer></div>
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



