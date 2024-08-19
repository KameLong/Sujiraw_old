import {GetStopTime, StopTime, TrainType, Trip} from "../DiaData/DiaData";
import React from "react";
import {TimeTablePageSetting} from "./TimeTablePage";
import {StationProps} from "./StationView";

interface TripViewProps {
    trip: Trip;
    type: TrainType;
    stations: StationProps[];
    setting: TimeTablePageSetting;
    direction: number;
}

function timeIntStr(time: number) {
    const ss = time % 60;
    time -= ss;
    time /= 60;
    const mm = time % 60;
    time -= mm;
    time /= 60;
    const hh = time % 24;
    return `${hh.toString().padStart(1, '0')}${mm.toString().padStart(2, '0')}`;
}

export function TripView({trip, type, setting, stations, direction}: TripViewProps) {

    function depTimeStr(time: StopTime, _i: number) {
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                if (showAri(_i)) {
                    if (_i < stations.length - 1) {
                        switch (getTimes()[_i + 1].stopType) {
                            case 0:
                                return "‥";
                            case 3:
                                return "║";
                        }
                    } else {
                        return "‥";
                    }
                }
                return timeIntStr(GetStopTime.GetDepAriTime(time));
        }
    }

    function ariTimeStr(time: StopTime, _i: number) {
        switch (time.stopType) {
            case 0:
                return "‥";
            case 2:
                return "⇂";
            case 3:
                return "║";
            default:
                if (showDep(_i)) {
                    if (_i > 0) {
                        switch (getTimes()[_i - 1].stopType) {
                            case 0:
                                return "‥";
                            case 3:
                                return "║";
                        }
                    } else {
                        return "‥";
                    }
                }
                return timeIntStr(GetStopTime.GetAriDepTime(time));
        }
    }

    function showAri(index: number): boolean {
        if(direction===0){
            return ((getStations()[index].style % 16) & 0b0010) !== 0;
        }
        return ((Math.floor(getStations()[index].style/16) % 16) & 0b0010) !== 0;
    }

    function showDep(index: number): boolean {
        if(direction===0){
            return ((getStations()[index].style % 16) & 0b0001) !== 0;
        }
        return ((Math.floor(getStations()[index].style/16) % 16) & 0b0001) !== 0;

    }

    //方向を考慮した駅一覧
    function getStations() {
        if (direction === 0) {
            return stations;
        } else {
            return stations.slice().reverse();
        }
    }
    //方向を考慮した駅時刻一覧
    function getTimes() {
        if (direction === 0) {
            return trip.times;
        } else {
            return trip.times.slice().reverse();
        }
    }


    return (
        <div className={"DiaPro"} style={{
            color: type.color,
            borderRight: '1px solid gray',
            width: (setting.fontSize * 2.2) + 'px',
            flexShrink: 0,
            textAlign: "center",
            fontSize: `${setting.fontSize}px`,
            lineHeight: `${setting.fontSize * 1.2}px`
        }}>
            {
                getTimes().map((time, _i) => {
                    return (
                        <div key={time.rsID}>
                            {
                                (showAri(_i) && showDep(_i)) ?
                                    <div style={{borderBottom: '1px black solid'}}>
                                        {ariTimeStr(time, _i)}
                                    </div> : null
                            }
                            {
                                (showAri(_i) && !showDep(_i)) ?
                                    <div>
                                        {ariTimeStr(time, _i)}
                                    </div> : null
                            }
                            {
                                (showDep(_i)) ?
                                    <div>
                                        {depTimeStr(time, _i)}
                                    </div> : null
                            }
                        </div>
                    )
                })
            }
        </div>
    )
}