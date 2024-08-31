import {Button, Modal} from "@mui/material";
import React, {forwardRef, useState} from "react";
import {RouteSelectView, RouteSelectViewProps} from "./RouteSelectView";
import {useNavigate} from "react-router-dom";
import {RouteInfo} from "../DiaData/DiaData";

interface BottomMenuProps {
    routeID:number;
    routeInfo:{[key:number]:RouteInfo};
}
export function BottomMenu({routeID,routeInfo}:BottomMenuProps){
    const [openRouteSelect,setOpenRouteSelect]=useState<boolean>(false);
    const navigate=useNavigate();

    const RouteSelectViewWithRef = forwardRef((props: RouteSelectViewProps, ref) => {
        return <RouteSelectView {...props}  />;
    });

    return (
        <div style={{display: "flex", position: 'fixed', zIndex:100,bottom: 0, width: '100%', backgroundColor: "#FFF"}}>
            <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                    onClick={() => setOpenRouteSelect(true)}>
                路線
            </Button>
            <Button sx={{m: 1}} variant={"contained"} style={{width: 0, flexGrow: 1, textAlign: 'center'}}
                    onClick={() => {
                        navigate(`/TimeTable/${routeID}/0`);
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
                        navigate(`/TimeTable/${routeID}/1`);
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