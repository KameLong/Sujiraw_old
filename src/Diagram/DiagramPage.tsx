

import React, {useCallback, useEffect, useRef, useState} from 'react';
import { DiagramStation, DiagramTrip} from "./DiagramData";
import {useParams} from "react-router-dom";
import {Company, fetchGzipJson, Route, RouteInfo, Station, StopTime, Train, TrainType} from "../DiaData/DiaData";
import {DiagramCanvas, DiagramLine, DiagramTransformC, Point} from "./DiagramCanvas";




const fontSize=10;

const transform:DiagramTransform={
    x:0,
    y:0,
    xScale:0.1,
    yScale:0.4
}


const zoomX:Gesture={
    isDrag:false,
    sPos:[0,0],
    mPos:[0,0],
    transform:transform
}
const zoomY:Gesture={
    isDrag:false,
    sPos:[0,0],
    mPos:[0,0],
    transform:transform
}

function DiagramPage() {
    const params = useParams<{ routeID: string }>();
    const routeID = Number.parseInt(params.routeID??"0");

    const [stations, setStations] = useState<{[key:number]:Station}>({});
    const [trainTypes, setTrainTypes] = useState<{[key:number]:TrainType}>({});
    const [trains, setTrains] = useState<{[key:number]:Train}>({});
    const [routeInfo, setRouteInfo] = useState<{[key:number]:RouteInfo}>({});
    const [routes, setRoutes] = useState<{[key:number]:Route}>({});
    const SCALE:number=window.devicePixelRatio;

    function Ypos(diagramRect:DiagramRect){
        const windowHeight=window.innerHeight*SCALE;
        const newY=Math.min(transform.y,-(windowHeight-50)/transform.yScale/SCALE+diagramRect.yEnd);
        if(newY<0){
            return 0;
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
        const canvas=(document.getElementById("canvas") as  HTMLCanvasElement);
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
        console.log("diagramCanvas");
        setDiagramCanvas(diagramCanvas);
    }, []);

    useEffect(() => {
        diagramCanvas.diaRect=diaRect;
        requestAnimationFrame(()=>render(new DiagramTransformC(transform.x,transform.y,transform.xScale,transform.yScale,SCALE)));
    }, [diagramCanvas,diaRect]);


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
        }, [diagramCanvas,downLines,upLines,routeStations]
    );

    const ref=useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const onTouchStart=(e:TouchEvent):void=>{
            if(e.touches.length>=2){
                zoomX.isDrag=Math.abs(e.touches[0].clientX-e.touches[1].clientX)>100;
                zoomX.transform={...transform}
                zoomX.sPos=[e.touches[0].clientX,e.touches[1].clientX];
                zoomX.mPos=[e.touches[0].clientX,e.touches[1].clientX];

                zoomY.isDrag=Math.abs(e.touches[0].clientY-e.touches[1].clientY)>100;
                zoomY.transform={...transform}
                zoomY.sPos=[e.touches[0].clientY,e.touches[1].clientY];
                zoomY.mPos=[e.touches[0].clientY,e.touches[1].clientY];
                e.preventDefault();
            }
        };
        const onTouchMove=(e:TouchEvent)=>{
            if(e.touches.length>=2) {
                e.preventDefault();
                requestAnimationFrame(() => {
                    const nowPos1 = {x: e.touches[0].clientX, y: e.touches[0].clientY};
                    const nowPos2 = {x: e.touches[1].clientX, y: e.touches[1].clientY};
                    if(zoomX.isDrag){
                        if (Math.abs(nowPos2.x - nowPos1.x) >= 100) {
                            const prevTransform = zoomX.transform;
                            let scaleX = Math.abs(prevTransform.xScale * (nowPos1.x - nowPos2.x) / (zoomX.sPos[0] - zoomX.sPos[1]));
                            let x = (prevTransform.xScale / scaleX) * (prevTransform.x + (zoomX.sPos[0] + zoomX.sPos[1]) / 2);
                            transform.xScale = scaleX;
                            transform.x = x;
                        }
                    }else{
                        if(Math.abs(e.touches[0].clientX-e.touches[1].clientX)>100){
                            zoomX.isDrag=true;
                            zoomX.transform={...transform}
                            zoomX.sPos=[e.touches[0].clientX,e.touches[1].clientX];
                            zoomX.mPos=[e.touches[0].clientX,e.touches[1].clientX];
                        }
                    }
                    if(zoomY.isDrag){
                        if (Math.abs(nowPos2.y - nowPos1.y) >= 100) {
                            const prevTransform = zoomY.transform;
                            let scaleY = Math.abs(prevTransform.yScale * (nowPos1.y - nowPos2.y) / (zoomY.sPos[0] - zoomY.sPos[1]));
                            let y = (prevTransform.yScale / scaleY) * (prevTransform.y + (zoomY.sPos[0] + zoomY.sPos[1]) / 2);
                            transform.yScale = scaleY;
                            transform.y = y;
                        }
                    }else{
                        if(Math.abs(e.touches[0].clientY-e.touches[1].clientY)>100){
                            zoomY.isDrag=true;
                            zoomY.transform={...transform}
                            zoomY.sPos=[e.touches[0].clientY,e.touches[1].clientY];
                            zoomY.mPos=[e.touches[0].clientY,e.touches[1].clientY];
                        }
                    }

                    const x1 = -nowPos1.x + transform.xScale / zoomX.transform.xScale * (zoomX.sPos[0] + zoomX.transform.x);
                    const x2 = -nowPos2.x + transform.xScale / zoomX.transform.xScale * (zoomX.sPos[1] + zoomX.transform.x);
                    const y1 = -nowPos1.y + transform.yScale / zoomY.transform.yScale * (zoomY.sPos[0] + zoomY.transform.y);
                    const y2 = -nowPos2.y + transform.yScale / zoomY.transform.yScale * (zoomY.sPos[1] + zoomY.transform.y);
                    let x = (x1 + x2) / 2;
                    let y = (y1 + y2) / 2;
                    transform.x = x;
                    transform.y = y;

                    transform.y=Ypos(diaRect);
                    ref.current?.scrollTo(transform.x, transform.y);

                    document.getElementById("dummy")!.style.width = (24 * 3600 * transform.xScale+80) + "px";
                    document.getElementById("dummy")!.style.height = diaRect.yEnd * transform.yScale + "px";

                    requestAnimationFrame(()=>render(new DiagramTransformC(transform.x,transform.y,transform.xScale,transform.yScale,SCALE)));

                });
            }
        };

        ref.current?.addEventListener('touchstart',onTouchStart);
        ref.current?.addEventListener('touchmove',onTouchMove);
        return () => {
            ref.current?.removeEventListener('touchstart',onTouchStart);
            ref.current?.removeEventListener('touchmove',onTouchMove);
        };
    }, [diaRect]);
    useEffect(() => {
        const resizeEvent=()=>{
            const canvas=(document.getElementById("canvas") as  HTMLCanvasElement);
            if(canvas===null||canvas===undefined){
                return;
            }
            canvas.width=canvas.clientWidth*SCALE;
            canvas.height=canvas.clientHeight*SCALE;
            requestAnimationFrame(()=>render(new DiagramTransformC(transform.x,transform.y,transform.xScale,transform.yScale,SCALE)));
        }
        window.addEventListener('resize', resizeEvent);
        return ()=>{
            window.removeEventListener('resize',resizeEvent);
        }
    }, [render]);
    useEffect(() => {
        if(!ref.current){
            return;
        }
       ref.current.onscroll = (e) => {
            const target=e.target as HTMLDivElement;
            transform.x=(target.scrollLeft);
            transform.y=(target.scrollTop);
           requestAnimationFrame(()=>render(new DiagramTransformC(transform.x,transform.y,transform.xScale,transform.yScale,SCALE)));
        }
        requestAnimationFrame(()=>render(new DiagramTransformC(transform.x,transform.y,transform.xScale,transform.yScale,SCALE)));


    }, [render]);





console.log(transform.xScale);
    return (
        <div ref={ref}
             style={{position: 'relative', height: '100%', overflowX: "auto", overflowY: "auto"}}
        >
            <canvas
                id="canvas" style={{position: 'fixed',pointerEvents: 'none', width: '100%', height: '100%', overflowY: 'hidden'}}
            >
            </canvas>
            <div id="dummy" style={{
                width: (24 * 3600) * transform.xScale+80,
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
    sPos:number[];
    mPos:number[];
    transform:DiagramTransform;
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