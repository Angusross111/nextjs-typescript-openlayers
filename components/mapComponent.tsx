import React, { useEffect, useRef } from "react";

import { useRecoilValue } from "recoil";
import { mapLayersStore, olMapStore } from "../lib/recoil";
import LayerSwitcher from "./layerSwitcher";
import styles from "../styles/Home.module.css";

interface Props {
    id: string;
}
const MapDisplay = ({ id }: Props) => {
    const mapElement = useRef<HTMLDivElement | null>(null);
    const map = useRecoilValue(olMapStore(id));
    const initLayers = useRecoilValue(mapLayersStore(id));
    useEffect(() => {
        if (!mapElement.current) return;
        map.setTarget(mapElement.current);
    }, []);

    return (
        <>
            <div id={id} ref={mapElement} className={styles.mapComponent}>
                <LayerSwitcher id={id} map={map} layers={initLayers} />
            </div>
        </>
    );
};

export default MapDisplay;
