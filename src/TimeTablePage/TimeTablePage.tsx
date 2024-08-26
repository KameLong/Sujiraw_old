import React, {forwardRef, useEffect,  useState} from "react";
import {
    Company,
    EditRoute, loadCompany, loadRoute,
    Route,
    RouteInfo,
    Station,
    Train,
    TrainType,
} from "../DiaData/DiaData";
import {getStationViewWidth, StationView} from './StationView';
import {getTripNameViewHeight, TripNameView} from './TripNameView';
import {TripView} from "./TripVIew";
import {Button, Modal} from "@mui/material";
import {RouteSelectView, RouteSelectViewProps} from "../Menu/RouteSelectView";
import {useNavigate, useParams} from "react-router-dom";
import { StationHeaderView } from "./StationHeaderView";
export interface TimeTablePageSetting{
    fontSize:number,
    lineHeight:number,
}
export default function TimeTablePage() {
    const [stations, setStations] = useState<{[key:number]:Station}>({});
    const [trainTypes, setTrainTypes] = useState<{[key:number]:TrainType}>({});
    const [trains, setTrains] = useState<{[key:number]:Train}>({});
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    const [routes, setRoutes] = useState<{[key:number]:Route}>({});
    const navigate=useNavigate();
    const [setting,setSetting]=useState<TimeTablePageSetting>({
        fontSize:13,
        lineHeight:1.1
    });
    const [openRouteSelect,setOpenRouteSelect]=useState<boolean>(false);
    const param = useParams<{ routeID:string,direct: string  }>();
    const routeID=parseInt(param.routeID??"0");
    const direct=parseInt(param.direct??"0");
   useEffect(() => {
       loadCompany().then((company)=>{
           setStations(company.stations);
           // console.log(stations);
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
            navigate(`/TimeTable/${res.routeID}/${direct}`);
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



    function getTrips() {
        if(direct===0){
            return routes[routeID].downTrips;
        }else{
            return routes[routeID].upTrips;
        }
    }

    useEffect(() => {
        window.onscroll=(e=>{
            const tripNameLayout=document.getElementById("tripNameLayout")
            const stationViewLayout=document.getElementById("stationViewLayout")
            if(tripNameLayout!==null){
                tripNameLayout.style.left=-window.scrollX+"px";
            }
            if(stationViewLayout!==null){
                stationViewLayout.style.top=-window.scrollY+"px";
            }
        })
   }, []);
    function getStationProps(){
        return routes[routeID].routeStations.map((item)=>{
            return {
                rsID:item.rsID,
                name:stations[item.stationID]?.name??"",
                style:item.showStyle
            }
        });
    }
    const RouteSelectViewWithRef = forwardRef((props: RouteSelectViewProps, ref) => {
        return <RouteSelectView {...props}  />;
    });

    if(routes[routeID]===undefined){
        return (
            <div style={{fontSize: `${setting.fontSize}px`, lineHeight: `${setting.fontSize * setting.lineHeight}px`}}>
                <div style={{display: "flex", position: 'fixed', bottom: 0, width: '100%', backgroundColor: "#FFF"}}>
                    <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                            onClick={() => setOpenRouteSelect(true)}>
                        路線
                    </Button>
                    <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                            onClick={() => {
                                navigate(`/TimeTable/${routeID}/0}`);
                            }}>
                        下り
                    </Button>
                    <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                            onClick={() => {
                                navigate(`/TimeTable/${routeID}/1}`);
                            }}>
                        上り
                    </Button>
                    <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                            onClick={() => {
                                navigate(`/Diagram/${routeID}`);
                            }}>
                        ダイヤ
                    </Button>
                </div>
                <Modal
                    id={"routeSelect"}
                    open={openRouteSelect}
                    onClose={() => setOpenRouteSelect(false)}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <RouteSelectViewWithRef routes={routeInfo} closeModal={() => {
                        setOpenRouteSelect(false)
                    }}/>
                </Modal>
            </div>
        )
    }
    return (
        <div style={{fontSize: `${setting.fontSize}px`, lineHeight: `${setting.fontSize * setting.lineHeight}px`}}>
            <div style={{display: "flex", width: '100%', height: '100%', paddingBottom: "70px"}}>
                <div style={{
                    width: `${getStationViewWidth(setting)}px`,
                    borderRight: "2px solid black",
                    borderBottom: "2px solid black",
                    position: "fixed",
                    height: `${getTripNameViewHeight(setting)}px`,
                    background: "white",
                    zIndex: "10"
                }}>
                    <StationHeaderView  setting={setting}/>

                </div>
                <div style={{
                    width: `${getStationViewWidth(setting)}px`,
                    borderRight: "2px solid black",
                    position: 'fixed',
                    paddingTop: `${getTripNameViewHeight(setting)}px`,
                    background: "white"
                }} id="stationViewLayout">
                    <StationView stations={getStationProps()} setting={setting} direction={direct}/>
                </div>
                <div style={{flexShrink: 1, flexGrow: 1, paddingRight: '30px'}}>
                    <div id="tripNameLayout" style={{
                        borderBottom: "2px solid black",
                        display: 'flex',
                        background: "white",
                        position: "fixed",
                        paddingLeft: `${getStationViewWidth(setting)}px`,
                        height: `${getTripNameViewHeight(setting)}px`
                    }}>
                        {
                            getTrips().map((trip) =>
                                <TripNameView key={trip.tripID} trip={trip} type={trainTypes[trip.trainTypeID]}
                                              setting={setting}
                                train={trains[trip.trainID]}
                                stations={stations}/>
                            )}
                    </div>
                    <div>
                        <div style={{
                            display: "flex",
                            borderBottom: "2px solid black",
                            paddingLeft: `${getStationViewWidth(setting)}px`,
                            paddingTop: `${getTripNameViewHeight(setting)}px`
                        }} id="tripTimeLayout">
                            {
                                getTrips().map((trip) =>
                                    <TripView key={trip.tripID} trip={trip} type={trainTypes[trip.trainTypeID]}
                                              setting={setting} stations={getStationProps()} allStations={stations}
                                              train={trains[trip.trainID]}
                                              direction={direct}/>
                                )}
                        </div>
                    </div>
                </div>
            </div>
            <div style={{display: "flex", position: 'fixed', bottom: 0, width: '100%', backgroundColor: "#FFF"}}>
                <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                        onClick={() => setOpenRouteSelect(true)}>
                    路線
                </Button>
                <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                        onClick={() => {
                            navigate(`/TimeTable/${routeID}/0}`);
                        }}>
                    下り
                </Button>
                {/*<svg viewBox="0 0 64 64" width="48" height="48" stroke={"#52a8ff"} strokeWidth={2} style={{backgroundColor:'black'}}>*/}
                {/*    <rect width="36" height="32" x="7" y="21" rx="4"></rect>*/}
                {/*    <rect width="28" height="18" x="11" y="24" rx="4"></rect>*/}
                {/*    <circle cx="36" cy="47" r="2.5"></circle>*/}
                {/*    <circle cx="14" cy="47" r="2.5"></circle>*/}
                {/*    <line x1="57" x2="42" y1="11" y2="22"></line>*/}
                {/*    <line x1="57" x2="42" y1="41" y2="52"></line>*/}
                {/*    <line x1="23" x2="8" y1="11" y2="22"></line>*/}
                {/*</svg>*/}
                <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                        onClick={() => {
                            navigate(`/TimeTable/${routeID}/1}`);
                        }}>
                    上り
                </Button>
                {/*<svg viewBox="0 0 64 64" width="48" height="48" stroke={"#52a8ff"} strokeWidth={2} style={{backgroundColor:'black'}}>*/}
                {/*    <rect width="36" height="32" x="21" y="21" rx="4"></rect>*/}
                {/*    <rect width="28" height="18" x="25" y="24" rx="4"></rect>*/}
                {/*    <circle cx="28" cy="47" r="2.5"></circle>*/}
                {/*    <circle cx="50" cy="47" r="2.5"></circle>*/}
                {/*    <line x1="7" x2="22" y1="11" y2="22"></line>*/}
                {/*    <line x1="7" x2="22" y1="41" y2="52"></line>*/}
                {/*    <line x1="41" x2="56" y1="11" y2="22"></line>*/}
                {/*</svg>*/}
                <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                        onClick={() => {
                            navigate(`/Diagram/${routeID}`);
                        }}>
                    ダイヤ
                </Button>
                {/*<svg viewBox="0 0 64 64" width="48" height="48" stroke={"#52a8ff"} strokeWidth={2} style={{backgroundColor:'black'}}>*/}
                {/*    <path d="M8 8 l10 12 l12 0 l26 36 M56 8 l-12 24 l-8 0 l-12 24 M8 30 l12 0l11 -22" ></path>*/}
                {/*</svg>*/}
            </div>
            <Modal
                id={"routeSelect"}
                open={openRouteSelect}
                onClose={() => setOpenRouteSelect(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <RouteSelectViewWithRef routes={routeInfo}  closeModal={()=>{setOpenRouteSelect(false)}}/>
            </Modal>
        </div>
    );
}