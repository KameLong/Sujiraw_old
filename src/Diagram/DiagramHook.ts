import {useEffect, useState} from "react";
import {loadCompany, loadRoute, RouteInfo, StopTime} from "../DiaData/DiaData";
import {DiagramStation, DiagramTrip} from "./DiagramData";
import {DiagramLine} from "./DiagramCanvas";

const getAD = (stopTime: StopTime) => {
    if (stopTime.ariTime >= 0) {
        return stopTime.ariTime;
    }
    return stopTime.depTime;
}
const getDA=(stopTime:StopTime)=>{
    if(stopTime.depTime>=0){
        return stopTime.depTime;
    }
    return stopTime.ariTime;
}

const makeDiagramLine=(trips:DiagramTrip[],routeStations:DiagramStation[]):DiagramLine[]=>{
    const diagramLines:DiagramLine[]=[];
    trips.forEach(trip=>{

        let diagramLine:DiagramLine={
            color:trip.trainType.color,
            points:[],
            number:"",
        };
        const stopTimes=trip.direction===0?trip.stopTimes:trip.stopTimes.slice().reverse();
        for(let i=0;i<stopTimes.length;i++){
            const st=stopTimes[i];
            if(st.ariTime>=0){
                diagramLine.points.push({
                    x:st.ariTime,
                    y:routeStations.filter(item=>item.rsID===st.rsID)[0].stationTime
                });
            }
            if(st.depTime>=0) {
                diagramLine.points.push({
                    x: st.depTime,
                    y:routeStations.filter(item=>item.rsID===st.rsID)[0].stationTime
                });
            }
        }
        diagramLines.push(diagramLine);
    })
    return diagramLines;

}

export function useDiagramHook(routeID:number){
    const [routeStations, setRouteStations] = useState<DiagramStation[]>([]);
    const [downLines,setDownLines]=useState<DiagramLine[]>([]);
    const [upLines,setUpLines]=useState<DiagramLine[]>([]);
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    useEffect(() => {
        loadCompany().then(async(company)=>{
            const stations=company.stations;
            const trainTypes=company.trainTypes;

            const trains=company.trains;
            setRouteInfo(company.routes);

            const route=await loadRoute(routeID);
            //routeの処理
            const rs=route.routeStations.map((item,_i)=>{
                return {...item,stationTime:_i*120,station:stations[item.stationID]}
            });
            setRouteStations(rs);
            const downTrips=route.downTrips.map(item=>{
                return {...item,stopTimes:item.times.map(item=>{
                        return {...item,depTime:getDA(item),ariTime:getAD(item)}
                    }),trainType:trainTypes[item.trainTypeID]
                }
            });
            const upTrips=route.upTrips.map(item=>{
                return {...item,stopTimes:item.times.map(item=>{
                        return {...item,depTime:getDA(item),ariTime:getAD(item)}
                    }),trainType:trainTypes[item.trainTypeID]
                }
            });

            setDownLines(makeDiagramLine(downTrips,rs));
            setUpLines(makeDiagramLine(upTrips,rs));
        });
    }, [routeID]);
    return {routeStations,downLines,upLines,routeInfo};
}