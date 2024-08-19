import {TrainType, Trip} from "../DiaData/DiaData";
import {TimeTablePageSetting} from "./TimeTablePage";

interface TripNameViewProps {
    trip: Trip;
    type: TrainType;
    setting: TimeTablePageSetting;
}

export function getTripNameViewHeight(setting: TimeTablePageSetting) {
    return setting.fontSize * 9;
}

export function TripNameView({trip, type, setting}: TripNameViewProps) {
    return (
        <div style={{
            color: type.color,
            borderRight: '1px solid gray',
            width: (setting.fontSize * 2.2) + 'px',
            flexShrink: 0,
            textAlign: "center",
            fontSize: `${setting.fontSize}px`,
            lineHeight: `${setting.fontSize * 1.2}px`
        }}>
            <div>　</div>
            <div>{type.shortName.length === 0 ? "　" : type.shortName}</div>
            <div style={{borderTop: '1px solid black'}}>
            </div>
        </div>
    )
}