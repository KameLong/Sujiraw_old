

import React, {useCallback, useEffect, useRef, useState} from 'react';
import { DiagramStation, DiagramTrip} from "./DiagramData";
import {useParams} from "react-router-dom";
import {Company, fetchGzipJson, Route, RouteInfo, Station, StopTime, Train, TrainType} from "../DiaData/DiaData";
import {DiagramCanvas, DiagramLine, DiagramTransformC, Point} from "./DiagramCanvas";
import {Transform} from "node:stream";

let befTime=Date.now();
export const usePreventDefault = <T extends HTMLElement>(
    eventName: string,
    enable = true
) => {
    const ref = useRef<T>(null);
    useEffect(() => {
        const current = ref.current;
        if (!current) {
            return;
        }
        const handler = (event: Event) => {
            if (enable) {
                event.preventDefault();
            }
        };
        current.addEventListener(eventName, handler);
        return () => {
            current.removeEventListener(eventName, handler);
        };
    }, [enable, eventName]);

    return ref;
};



const fontSize=10;

const transform:DiagramTransform={
    x:0,
    y:-fontSize*3,
    xScale:0.1,
    yScale:0.4
}

const gesture2:Gesture2={
    isAction:false,
    isXDrag:false,
    isYDrag:false,
    transform:transform,
    start1:{x:0,y:0},
    moving1:{x:0,y:0},
    start2:{x:0,y:0},
    moving2:{x:0,y:0}
};


function DiagramPage() {
    const params = useParams<{ routeID: string }>();
    const routeID = Number.parseInt(params.routeID??"0");

    const [stations, setStations] = useState<{[key:number]:Station}>({});
    const [trainTypes, setTrainTypes] = useState<{[key:number]:TrainType}>({});
    const [trains, setTrains] = useState<{[key:number]:Train}>({});
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    const [routes, setRoutes] = useState<{[key:number]:Route}>({});
    const SCALE:number=window.devicePixelRatio;
    //const SCALE:number=1;
    console.log(SCALE);

    function Ypos(transform:DiagramTransform,diagramRect:DiagramRect){
        const windowHeight=window.innerHeight*SCALE;
        const newY=Math.min(transform.y,-(windowHeight-50)/transform.yScale/SCALE+diagramRect.yEnd);
        if(newY<-fontSize*2/transform.yScale){
            return -fontSize*2/transform.yScale;
        }
        return newY;

    }



    async function  loadRoute(id:number):Promise<Route>{
        return await fetchGzipJson(`/route_${id}.json.gz`) as Route;
    }
    async function loadCompany():Promise<Company>{
        return await fetchGzipJson(`/company.json.gz`);
    }


    const [routeStations, setRouteStations] = useState<DiagramStation[]>([]);
    const [downTrips, setDownTrips] = useState<DiagramTrip[]>([]);
    const [upTrips, setUpTrips] = useState<DiagramTrip[]>([]);
    const [diagramCanvas,setDiagramCanvas]=useState<DiagramCanvas>(new DiagramCanvas(undefined));


    const [downLines,setDownLines]=useState<DiagramLine[]>([]);
    const [upLines,setUpLines]=useState<DiagramLine[]>([]);
    useEffect(() => {
        loadCompany().then((company)=>{
            setStations(company.stations);
            setTrainTypes(company.trainTypes);
            setTrains(company.trains);
            setRouteInfo(company.routes);

            return  loadRoute(routeID);
        }).then((route)=>{
            setRoutes(prev=>{return {...prev,[routeID]:route}});
        });
    }, [routeID]);
    useEffect(() => {
        const route=routes[routeID];
        if(route===undefined){
            return;
        }
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
        setDownTrips(downTrips);
        const upTrips=route.upTrips.map(item=>{
            return {...item,stopTimes:item.times.map(item=>{
                    return {...item,depTime:getDA(item),ariTime:getAD(item)}
                }),trainType:trainTypes[item.trainTypeID]
            }
        });
        setUpTrips(upTrips);
        setDiaRect(prevState => {
            return {
                xStart: prevState.xStart,
                xEnd: prevState.xEnd,
                yStart: rs[0].stationTime,
                yEnd: rs.slice(-1)[0].stationTime
            }
        })
    }, [routes]);
    function color2Number(color:string):number{
        switch (color.length){
            case 7:
                return Number.parseInt(color.slice(1),16);
            case 4:
                return color2Number("#"+color[1]+color[1]+color[2]+color[2]+color[3]+color[3]);
        }
        return 0;

    }

    const makeDiagramLine=(trips:DiagramTrip[]):DiagramLine[]=>{
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

    // const [transform,setTransform]=useState<DiagramTransform>({
    //     x:3600*6,
    //     y:-fontSize*3*SCALE,
    //     xScale:0.1*SCALE,
    //     yScale:0.4*SCALE
    // });
    const [diaRect,setDiaRect]=useState<DiagramRect>({
        yStart:0,
        yEnd:0,
        xStart:3600*3,
        xEnd:3600*27
    });





    useEffect(()=>{
        setDownLines(makeDiagramLine(downTrips));
    },[downTrips])
    useEffect(()=>{
        setUpLines(makeDiagramLine(upTrips));
    },[upTrips])




    useEffect(() => {
        const canvas=(document.getElementById("test") as  HTMLCanvasElement);
        if(canvas===null||canvas===undefined){
            return;
        }
        canvas.width=canvas.clientWidth*SCALE;
        canvas.height=canvas.clientHeight*SCALE;
        const diagramCanvas= new DiagramCanvas(canvas);
        if(!diagramCanvas.ctx){
            return;
        }
        diagramCanvas.transform=new DiagramTransformC(transform.x,transform.y,transform.xScale,transform.yScale,SCALE);
        diagramCanvas.diaRect=diaRect;
        console.log("diagramCanvas");
        setDiagramCanvas(diagramCanvas);
    }, [diaRect,]);

    useEffect(() => {
        // render(true);
    }, [downLines,upLines]);

    const render = useCallback(
        (transform:DiagramTransformC) => {
        diagramCanvas.Clear();
        diagramCanvas.transform=transform;
        diagramCanvas.DrawVerticalAxis(4);
        diagramCanvas.DrawStationAxis(routeStations);
         diagramCanvas.DrawTrips(downLines);
         diagramCanvas.DrawTrips(upLines);
        diagramCanvas.DrawTimeHeader(4);
         diagramCanvas.DrawStations(routeStations);
        }, [diagramCanvas]
    );

    const ref=useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        if(!ref.current){
            return;
        }
        ref.current.addEventListener('touchstart',(e)=>{
            if(e.touches.length>=2){
                gesture2.isAction=true;
                e.preventDefault();
                gesture2.isXDrag=Math.abs(e.touches[0].clientX-e.touches[1].clientX)>100;
                gesture2.isYDrag=Math.abs(e.touches[0].clientY-e.touches[1].clientY)>100;
                gesture2.start1={x:e.touches[0].clientX,y:e.touches[0].clientY};
                gesture2.moving1={x:e.touches[0].clientX,y:e.touches[0].clientY};
                gesture2.start2={x:e.touches[1].clientX,y:e.touches[1].clientY};
                gesture2.moving2={x:e.touches[1].clientX,y:e.touches[1].clientY};
                gesture2.transform={...transform};
                gesture2.isAction=false;
            }
        });

        ref.current.addEventListener('touchmove',(e)=>{
            if(e.touches.length>=2){
                e.preventDefault();
                if(gesture2.isAction){
                    return;
                }
                gesture2.isAction=true;
                const nowPos1={x:e.touches[0].clientX,y:e.touches[0].clientY};
                const nowPos2={x:e.touches[1].clientX,y:e.touches[1].clientY};
                const prevTransform=gesture2.transform;

                let scaleX=Math.abs(prevTransform.xScale*(nowPos1.x-nowPos2.x)/(gesture2.start1.x-gesture2.start2.x));
                let scaleY=Math.abs(prevTransform.yScale*(nowPos1.y-nowPos2.y)/(gesture2.start1.y-gesture2.start2.y));
                if(Math.abs(nowPos2.y-nowPos1.y)<100) {
                    scaleY = transform.yScale;
                }
                if(Math.abs(nowPos2.x-nowPos1.x)<100) {
                    scaleX = transform.xScale;
                }
                // scaleY = transform.yScale;
                // scaleX = transform.xScale;

                const x1=-nowPos1.x+scaleX/prevTransform.xScale*(gesture2.start1.x+prevTransform.x);
                const x2=-nowPos2.x+scaleX/prevTransform.xScale*(gesture2.start2.x+prevTransform.x);
                const y1=-nowPos1.y+scaleY/prevTransform.yScale*(gesture2.start1.y+prevTransform.y);
                const y2=-nowPos2.y+scaleY/prevTransform.yScale*(gesture2.start2.y+prevTransform.y);
                let x=(x1+x2)/2;
                let y=(y1+y2)/2;
                ref.current?.scrollTo(x,y);
                console.log(x,y,transform.x,transform.y);
                gesture2.isXDrag=Math.abs(e.touches[0].clientX-e.touches[1].clientX)>100;
                gesture2.isYDrag=Math.abs(e.touches[0].clientY-e.touches[1].clientY)>100;
                gesture2.moving1= nowPos1;
                gesture2.moving2= nowPos2;

                transform.xScale=scaleX;
                transform.yScale=scaleY;
                transform.x=x;
                transform.y=y;
                document.getElementById("dummy")!.style.width=24*3600*transform.xScale+"px";
                document.getElementById("dummy")!.style.height=diaRect.yEnd*transform.yScale+"px";

                    gesture2.isAction=false;
                requestAnimationFrame(()=>render(new DiagramTransformC(transform.x/transform.xScale,(transform.y)/transform.yScale,transform.xScale,transform.yScale,SCALE)));
         }
        });
        ref.current.addEventListener('touchend',(e)=>{
            if(e.touches.length>=2){
                e.preventDefault();
            }
        });
    }, []);
    useEffect(() => {
        if(!ref.current){
            return;
        }
       ref.current.onscroll = (e) => {
            const target=e.target as HTMLDivElement;
            transform.x=(target.scrollLeft);
            transform.y=(target.scrollTop);
           requestAnimationFrame(()=>render(new DiagramTransformC(transform.x,transform.y,transform.xScale,transform.yScale,SCALE)));
            console.log(target.scrollLeft,target.scrollTop);
        }

    }, [render]);






    return (
        <div ref={ref}
             style={{position: 'relative', height: '100%', overflowX: "auto", overflowY: "auto"}}
        >
            <canvas
                id="test" style={{position: 'fixed',pointerEvents: 'none', width: '100%', height: '100%', overflowY: 'hidden'}}
            >
            </canvas>
            <div id="dummy" style={{
                width: 24 * 3600 * transform.xScale,
                height: transform.yScale * diaRect.yEnd
            }}>

            </div>

        </div>

    );
}

export default DiagramPage;

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
const hasTime=(stopTime:StopTime)=>{
    return stopTime.depTime>=0||stopTime.ariTime>=0;
}


interface DiagramTransform{
    x:number;
    y:number;
    xScale:number;
    yScale:number;
}



interface Gesture{
    isDrag:boolean;
    start1:Point;
    moving:Point;
}
interface Gesture2{
    isAction:boolean;
    isXDrag:boolean;
    isYDrag:boolean;
    transform:DiagramTransform;
    start1:Point;
    start2:Point;
    moving1:Point;
    moving2:Point;
}
interface DiagramRect{
    xStart:number;
    xEnd:number;
    yStart:number;
    yEnd:number;
}