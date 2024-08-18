import {GetStopTime, StopTime, TrainType, Trip} from "../DiaData/DiaData";
import React from "react";
import {TimeTablePageSetting} from "./TimeTablePage";
import {StationProps} from "./StationView";

interface TripViewProps{
    trip:Trip;
    type:TrainType;
    stations:StationProps[];
    setting:TimeTablePageSetting;
}

export function TripView({trip,type,setting,stations}:TripViewProps){
    function timeIntStr(time:number){
        const ss=time%60;
        time-=ss;
        time/=60;
        const mm=time%60;
        time-=mm;
        time/=60;
        const hh=time%24;
        return `${hh.toString().padStart(1,'0')}${mm.toString().padStart(2,'0')}`;
    }
    function depTimeStr(time:StopTime){
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                return timeIntStr(GetStopTime.GetDepAriTime(time));
        }
    }
    function ariTimeStr(time:StopTime){
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                return timeIntStr(GetStopTime.GetAriDepTime(time));
        }
    }
    function showAri(index:number):boolean{
        return ((stations[index].style%16) & 0b0010)!==0;
    }
    function showDep(index:number):boolean{
        return ((stations[index].style%16) & 0b0001)!==0;
    }

    return (
        <div className={"DiaPro"} style={{color:type.color,borderRight:'1px solid gray',width:(setting.fontSize*2.2)+'px',flexShrink:0,textAlign:"center",fontSize:`${setting.fontSize}px`,lineHeight:`${setting.fontSize*1.2}px`}}>
            {
                trip.times.map((time,_i)=>{
                    return (
                        <div key={time.rsID}>
                            {
                                (showAri(_i)&&showDep(_i))?
                                <div  style={{borderBottom:'1px black solid'}}>
                                    {ariTimeStr(time)}
                                </div>:null
                            }
                            {
                                (showAri(_i)&&!showDep(_i))?
                                    <div>
                                        {ariTimeStr(time)}
                                    </div>:null
                            }
                            {
                                (showDep(_i))?
                                    <div>
                                        {depTimeStr(time)}
                                    </div>:null
                            }
                        </div>
                )
                })
            }
        </div>
    )
}