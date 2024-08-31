

import React, {useEffect, useRef, useState} from 'react';
import { DiagramStation, DiagramTrip} from "./DiagramData";
import {useParams} from "react-router-dom";
import {Company, fetchGzipJson, Route, RouteInfo, Station, StopTime, Train, TrainType} from "../DiaData/DiaData";

let befTime=Date.now();
const fontSize=10;


//canvas.drawLine(options.scaleX *60 * (15 + 60 * i), 0, options.scaleX *60 * (15 + 60 * i),axisHeight * options.scaleY, paint);
function DrawLine(ctx:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,width:number,color:string,transform:DiagramTransform,SCALE :number){
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth=width*SCALE;
    ctx.moveTo((x1-transform.x)*transform.xScale*SCALE, (y1-transform.y)*transform.yScale*SCALE);
    ctx.lineTo((x2-transform.x)*transform.xScale*SCALE, (y2-transform.y)*transform.yScale*SCALE);
    ctx.stroke();
}
function DrawText(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,transform:DiagramTransform,SCALE :number) {
    ctx.font = `${fontSize*SCALE}px sans-serif`;
    ctx.fillText(text,(x-transform.x)*transform.xScale*SCALE,1.5*fontSize*SCALE);

}

function DrawTimeHeader(canvas:CanvasRenderingContext2D,verticalAxis:number,transform:DiagramTransform,diaRect:DiagramRect,SCALE :number){
    //時間軸表示に合わせて描画する内容を切り替える
    //隣の文字との間隔が狭くなる時は一部の表示を無くすことで文字がかぶらないようにする
    canvas.fillStyle = "#888";
    switch(verticalAxis) {
        case 0:
            for (let i = 0; i < 24; i++) {
                DrawText(canvas, i.toString(), i * 3600, -50, transform, SCALE);
            }
            break;
        case 2:
            if (fontSize * 5 < 20 * 60 * transform.xScale) {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i + ":00", ((i ) * 3600), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":20", ((i ) * 3600 + 1200), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":40", ((i ) * 3600 + 2400), -fontSize, transform, SCALE);
                }
            } else {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i.toString(), i * 3600, -50, transform, SCALE);
                }
            }
            break;
        // @ts-ignore
        case 3:
            if (fontSize * 5 < 15 * 60 * transform.xScale) {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i + ":15", (i  * 3600 + 900), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":45", (i  * 3600 + 2700), -fontSize, transform, SCALE);
                }
            }
        case 1:
            if (fontSize * 5 < 30 * 60 * transform.xScale) {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i + ":00", (i * 3600 ), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":30", (i * 3600 + 1800), -fontSize, transform, SCALE);
                }
            } else {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i.toString(), i * 3600, -50, transform, SCALE);
                }
            }
            break;
        // @ts-ignore
        case 7:
            if (fontSize * 5 < 5 * 60 * transform.xScale) {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i + ":05", (i * 3600 + 300), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":15", (i* 3600 + 900), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":25", (i* 3600 + 1500), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":35", (i* 3600 + 2100), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":45", (i* 3600 + 2700), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":55", (i* 3600 + 3300), -fontSize, transform, SCALE);
                }
            }
        case 6:
        case 5:
        case 4:
            if (fontSize * 5 < 10 * 60 * transform.xScale) {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i + ":10", (i * 3600 + 600), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":20", (i * 3600 + 1200), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":40", (i * 3600 + 2400), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":50", (i * 3600 + 3000), -fontSize, transform, SCALE);
                }
            }
            if (fontSize * 5 < 30 * 60 * transform.xScale) {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i + ":00", (i* 3600 + 0), -fontSize, transform, SCALE);
                    DrawText(canvas, i + ":30", (i * 3600 + 1800), -fontSize, transform, SCALE);
                }
            } else {
                for (let i = 0; i < 24; i++) {
                    DrawText(canvas, i.toString(), i * 3600, -50, transform, SCALE);
                }
            }
            break;
    }
    canvas.fillStyle = "#000";

}

function DrawVerticalAxis(ctx:CanvasRenderingContext2D,verticalAxis:number,transform:DiagramTransform,diaRect:DiagramRect,SCALE :number){

    switch (verticalAxis){
        case 1:
            for (let i = 0; i < 24; i++) {
                //30分ごとの目盛
                DrawLine(ctx,i*3600+1800,diaRect.yStart,i*3600+1800,diaRect.yEnd,1,"#AAA",transform,SCALE);
            }
            break;
        case 2:
            //20分ごとの目盛
            for (let i = 0; i < 24; i++) {
                DrawLine(ctx,i*3600+1200,diaRect.yStart,i*3600+1200,diaRect.yEnd,1,"#AAA",transform,SCALE);
                DrawLine(ctx,i*3600+2400,diaRect.yStart,i*3600+2400,diaRect.yEnd,1,"#AAA",transform,SCALE);
            }
            break;
        case 3:
            //15分ごとの目盛
            for (let i = 0; i < 24; i++) {
                DrawLine(ctx,i*3600+900,diaRect.yStart,i*3600+900,diaRect.yEnd,1,"#AAA",transform,SCALE);
                DrawLine(ctx,i*3600+1800,diaRect.yStart,i*3600+1800,diaRect.yEnd,1,"#AAA",transform,SCALE);
                DrawLine(ctx,i*3600+2700,diaRect.yStart,i*3600+2700,diaRect.yEnd,1,"#AAA",transform,SCALE);
            }
            break;
        case 4:
            //10分ごとの目盛
            for (let i = 0; i < 24; i++) {
                DrawLine(ctx,i*3600+600,diaRect.yStart,i*3600+600,diaRect.yEnd,0.5,"#AAA",transform,SCALE);
                DrawLine(ctx,i*3600+1200,diaRect.yStart,i*3600+1200,diaRect.yEnd,0.5,"#AAA",transform,SCALE);
                DrawLine(ctx,i*3600+2400,diaRect.yStart,i*3600+2400,diaRect.yEnd,0.5,"#AAA",transform,SCALE);
                DrawLine(ctx,i*3600+3000,diaRect.yStart,i*3600+3000,diaRect.yEnd,0.5,"#AAA",transform,SCALE);
            }
            for (let i = 0; i < 24; i++) {
                DrawLine(ctx,i*3600+1800,diaRect.yStart,i*3600+1800,diaRect.yEnd,1,"#AAA",transform,SCALE);
            }
            break;
    }

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

    const [transform,setTransform]=useState<DiagramTransform>({
        x:3600*6,
        y:-fontSize*3*SCALE,
        xScale:0.03*SCALE,
        yScale:0.1*SCALE
    });
    const [diaRect,setDiaRect]=useState<DiagramRect>({
        yStart:0,
        yEnd:0,
        xStart:3600*3,
        xEnd:3600*27
    });
    const [gesture,setGesture]=useState<Gesture>({
        isDrag:false,
        start1:{x:0,y:0},
        moving:{x:0,y:0}
    });
    const [gesture2,setGesture2]=useState<Gesture2>({
        isXDrag:false,
        isYDrag:false,
        transform:transform,
        start1:{x:0,y:0},
        moving1:{x:0,y:0},
        start2:{x:0,y:0},
        moving2:{x:0,y:0}
    });



    useEffect(()=>{
        setDownLines(makeDiagramLine(downTrips));
    },[downTrips])
    useEffect(()=>{
        setUpLines(makeDiagramLine(upTrips));
    },[upTrips])




    useEffect(() => {
        const canvas=(document.getElementById("test") as  HTMLCanvasElement);
        canvas.width=canvas.clientWidth*SCALE;
        canvas.height=canvas.clientHeight*SCALE;

    }, []);
    useEffect(() => {
       // render();

    }, [transform]);
    useEffect(() => {
        // render(true);
    }, [downLines,upLines]);


    (function loop(){
        window.requestAnimationFrame(loop);
        render();
    })();

    function render(force:boolean=false){
        // if(force&&Date.now()-befTime<30){
        //     return;
        // }
        // befTime=Date.now();
        // const rand=Date.now();

        const canvas=(document.getElementById("test") as  HTMLCanvasElement);
        const ctx = canvas?.getContext("2d");
        if(ctx===null||ctx===undefined){
//            setTimeout(render,30);
            return;
        };
        ctx.clearRect(0,0,canvas.width,canvas.height);
        DrawVerticalAxis(ctx,4,transform,diaRect,SCALE);

        for(let h=3;h<28;h++){
            ctx.beginPath();
            ctx.strokeStyle = "#AAA";
            ctx.lineWidth = 2*SCALE;
            ctx.moveTo((h*3600-transform.x)*transform.xScale*SCALE, (diaRect.yStart-transform.y)*transform.yScale*SCALE);
            ctx.lineTo((h*3600-transform.x)*transform.xScale*SCALE, (diaRect.yEnd-transform.y)*transform.yScale*SCALE);
            ctx.stroke();
        }
        for(let station of routeStations){
            let width=1;
            if(station.main){
                width=2;
            }
            if(routeStations[0]===station||routeStations.slice(-1)[0]===station){
                width=2;
            }
            ctx.beginPath();
            ctx.strokeStyle = "#808080";
            ctx.lineWidth = width;
            ctx.moveTo((diaRect.xStart-transform.x)*transform.xScale*SCALE, (station.stationTime-transform.y)*transform.yScale*SCALE);
            ctx.lineTo((diaRect.xEnd-transform.x)*transform.xScale*SCALE, (station.stationTime-transform.y)*transform.yScale*SCALE);
            ctx.stroke();
        }

        downLines.forEach(item=>{
            if(item.points.length<2){
                return;
            }
            ctx.beginPath();
            ctx.strokeStyle = item.color;
            ctx.lineWidth = SCALE;
            ctx.moveTo((item.points[0].x-transform.x)*transform.xScale*SCALE, (item.points[0].y-transform.y)*transform.yScale*SCALE);
            for(let i=1;i<item.points.length;i++){
                ctx.lineTo((item.points[i].x-transform.x)*transform.xScale*SCALE, (item.points[i].y-transform.y)*transform.yScale*SCALE);
            }
            ctx.stroke();




            const numberText=item.number;
            ctx.save();
            ctx.translate((item.points[0].x-transform.x)*transform.xScale*SCALE, (item.points[0].y-transform.y)*transform.yScale*SCALE);
            ctx.rotate(Math.atan2((item.points[1].y-item.points[0].y)*transform.yScale,(item.points[1].x-item.points[0].x)*transform.xScale));
            ctx.fillText(numberText,0,0);
            ctx.restore();
        });
        upLines.forEach(item=>{
            if(item.points.length<2){
                return;
            }
            ctx.beginPath();
            ctx.strokeStyle = item.color;
            ctx.lineWidth = SCALE;
            ctx.moveTo((item.points[0].x-transform.x)*transform.xScale*SCALE, (item.points[0].y-transform.y)*transform.yScale*SCALE);
            for(let i=1;i<item.points.length;i++){
                ctx.lineTo((item.points[i].x-transform.x)*transform.xScale*SCALE, (item.points[i].y-transform.y)*transform.yScale*SCALE);
            }
            ctx.stroke();

            const numberText=item.number;
            ctx.save();
            ctx.translate((item.points[0].x-transform.x)*transform.xScale*SCALE, (item.points[0].y-transform.y)*transform.yScale*SCALE);
            ctx.rotate(Math.atan2((item.points[1].y-item.points[0].y)*transform.yScale,(item.points[1].x-item.points[0].x)*transform.xScale));
            ctx.fillText(numberText,0,0);
            ctx.restore();
        })


        ctx.clearRect(0,0,canvas.width,1.8*SCALE*fontSize);
        DrawTimeHeader(ctx,4,transform,diaRect,SCALE);

        const stationViewWidth=80*SCALE;
        ctx.beginPath();
        ctx.fillStyle = "#FFFFFF";
        ctx.rect(0, 0, stationViewWidth, 1000*SCALE);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = "#808080";
        ctx.lineWidth = 4;
        ctx.moveTo(stationViewWidth, (diaRect.yStart-transform.y)*transform.yScale*SCALE);
        ctx.lineTo(stationViewWidth, (diaRect.yEnd-transform.y)*transform.yScale*SCALE);
        ctx.stroke();

        for(let station of routeStations){
            let width=1;
            if(station.main){
                width=2;
            }
            if(routeStations[0]===station||routeStations.slice(-1)[0]===station){
                width=2;
            }
            ctx.beginPath();
            ctx.strokeStyle = "#808080";
            ctx.lineWidth = width;
            ctx.moveTo(0, (station.stationTime-transform.y)*transform.yScale*SCALE);
            ctx.lineTo(stationViewWidth, (station.stationTime-transform.y)*transform.yScale*SCALE);
            ctx.stroke();
            ctx.beginPath();
            ctx.fillStyle = "#000000";
            ctx.font = `${12*SCALE}px sans-serif`;
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";
            ctx.fillText(station.station.name,5,(station.stationTime-transform.y)*transform.yScale*SCALE);
        }
//        console.log(Date.now()-rand);



    }

    const canvas = useRef<HTMLCanvasElement>(null);
    // useEffect(() => {
    //     canvas.current?.addEventListener("touchstart", onTouchStart, { passive: false });
    //     canvas.current?.addEventListener("touchmove", onTouchMove, { passive: false });
    //     canvas.current?.addEventListener("touchend", onTouchEnd, { passive: false });
    //     return (() => {
    //         canvas.current?.removeEventListener("touchstart", onTouchStart);
    //         canvas.current?.removeEventListener("touchmove", onTouchMove);
    //         canvas.current?.removeEventListener("touchend", onTouchEnd);
    //     });
    // },[canvas]);




    return (
        <canvas tabIndex={1} id="test"  style={{width:'100%',height:'100%',overflowY:'hidden'}}
    onTouchStart={(e)=>{
        if(e.touches.length===1) {
            setGesture({
                isDrag:true,
                start1:{x:e.touches[0].clientX,y:e.touches[0].clientY},
                moving:{x:e.touches[0].clientX,y:e.touches[0].clientY}
            });
        }
        if(e.touches.length===2) {
            setGesture2({
                isXDrag:Math.abs(e.touches[0].clientX-e.touches[1].clientX)>100,
                isYDrag:Math.abs(e.touches[0].clientY-e.touches[1].clientY)>100,
                transform:transform,
                start1:{x:e.touches[0].clientX,y:e.touches[0].clientY},
                moving1:{x:e.touches[0].clientX,y:e.touches[0].clientY},
                start2:{x:e.touches[1].clientX,y:e.touches[1].clientY},
                moving2:{x:e.touches[1].clientX,y:e.touches[1].clientY}
            });
        }
        e.preventDefault();

    }}
    onTouchMove={(e)=>{
        if(e.touches.length===1) {
            console.log("2");

            setTransform((prev)=>{
                const res = {
                    x: prev.x - (e.touches[0].clientX - gesture.moving.x) / prev.xScale,
                    y: prev.y - (e.touches[0].clientY - gesture.moving.y) / prev.yScale,
                    xScale: prev.xScale,
                    yScale: prev.yScale
                }
                res.y=Ypos(res,diaRect);
                return res
            });
            setGesture(prev=>{return{
                isDrag: true,
                start1: prev.start1,
                moving: {x: e.touches[0].clientX, y: e.touches[0].clientY}
            }});
        }
        if(e.touches.length===2) {
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
            let x1=prevTransform.x+gesture2.start1.x/prevTransform.xScale-nowPos1.x/scaleX;
            let y1=prevTransform.y+gesture2.start1.y/prevTransform.yScale-nowPos1.y/scaleY;
            let x2=prevTransform.x+gesture2.start2.x/prevTransform.xScale-nowPos2.x/scaleX;
            let y2=prevTransform.y+gesture2.start2.y/prevTransform.yScale-nowPos2.y/scaleY;
            let x=(x1+x2)/2;
            let y=(y1+y2)/2;


            setGesture2(prev=>{return{
                isXDrag:Math.abs(e.touches[0].clientX-e.touches[1].clientX)>100,
                isYDrag:Math.abs(e.touches[0].clientY-e.touches[1].clientY)>100,
                transform:prev.transform,
                start1: prev.start1,
                start2: prev.start2,
                moving1: nowPos1,
                moving2: nowPos2
            }});
            setTransform((prev)=> {
                const res = {
                    x: x,
                    y: y,
                    xScale: scaleX,
                    yScale: scaleY
                }
                res.y=Ypos(res,diaRect);

                return res;
            });
        }
    }}
    onTouchEnd={(e)=>{
        if(e.touches.length===1) {
            setGesture({
                isDrag:true,
                start1:{x:e.touches[0].clientX,y:e.touches[0].clientY},
                moving:{x:e.touches[0].clientX,y:e.touches[0].clientY}
            });
        }
        if(e.touches.length===2) {
            setGesture2({
                isXDrag:Math.abs(e.touches[0].clientX-e.touches[1].clientX)>100,
                isYDrag:Math.abs(e.touches[0].clientY-e.touches[1].clientY)>100,
                transform:transform,
                start1:{x:e.touches[0].clientX,y:e.touches[0].clientY},
                moving1:{x:e.touches[0].clientX,y:e.touches[0].clientY},
                start2:{x:e.touches[1].clientX,y:e.touches[1].clientY},
                moving2:{x:e.touches[1].clientX,y:e.touches[1].clientY}
            });
        }
    }}
>
    </canvas>
);
}

export default DiagramPage;

const getAD=(stopTime:StopTime)=>{
    if(stopTime.ariTime>=0){
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


interface DiagramLine{
    color:string;
    number:string;
    points:Point[];
}

interface DiagramTransform{
    x:number;
    y:number;
    xScale:number;
    yScale:number;
}

interface Point{
    x:number;
    y:number;
}
interface Gesture{
    isDrag:boolean;
    start1:Point;
    moving:Point;
}
interface Gesture2{
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