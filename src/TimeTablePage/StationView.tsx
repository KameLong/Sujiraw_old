import {useEffect} from "react";
import {TimeTablePageSetting} from "./TimeTablePage";
import {stationStyle} from "./Util";

export interface StationProps {
    rsID: number;
    name: string;
    style: number;
}

interface StationViewProps {
    stations: StationProps[];
    setting: TimeTablePageSetting;
    direction: number;
}

export function getStationViewWidth(setting: TimeTablePageSetting) {
    return setting.fontSize * 4 + 10;
}

export function StationView({stations, setting, direction}: StationViewProps) {
    useEffect(() => {
        stations.forEach((station) => {
            const element = document.getElementById(`text-${station.rsID}`);
            if (element && element.parentElement) {
                const scale = Math.min(1, element.parentElement.offsetWidth / element.offsetWidth);
                element.style.transform = `scaleX(${scale})`;
            }
        });
    }, [stations, direction]);

    function stationList() {
        if (direction === 0) {
            return stations;
        } else {
            return stations.slice().reverse();
        }
    }



    return (
        <div style={{
            padding: '0px 5px',
            flexShrink: 0,
            textAlign: "center",
            fontSize: `${setting.fontSize}px`,
            lineHeight: `${setting.fontSize * 1.2}px`
        }}>
            {
                stationList().map((station, _i) => {
                    switch (stationStyle(station,direction)) {
                        case 1:
                        case 2:
                            return (
                                <div style={{
                                    whiteSpace: 'nowrap',
                                    overflow: "hidden",
                                    height: `${setting.fontSize * 1.2}px`,
                                    lineHeight: `${setting.fontSize * 1.2}px`
                                }} key={station.rsID}>
                                        <span id={`text-${station.rsID}`} className="text">
                                       {station.name}
                                        </span>
                                </div>
                            );
                        case 3:
                            return (
                                <div style={{
                                    whiteSpace: 'nowrap',
                                    overflow: "hidden",
                                    height: `${setting.fontSize * 2.4 + 0.5}px`,
                                    lineHeight: `${setting.fontSize * 2.4 + 0.5}px`
                                }} key={station.rsID}>
                                    <span id={`text-${station.rsID}`} className="text">{station.name}</span>
                                </div>
                            );
                    }
                })
            }
        </div>
    )
}