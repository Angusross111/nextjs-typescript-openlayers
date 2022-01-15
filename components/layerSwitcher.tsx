import React, { useState, useEffect, useRef } from "react";
import oLMap from "ol/Map";
import OlLayerTile from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import { useRecoilValue } from "recoil";
import { mapLayersStore, olMapStore } from "../lib/recoil";
import styles from "../styles/Home.module.css";

interface Props {
    id: string;
    map: oLMap;
    layers: OlLayerTile<XYZ>[];
}
export default function LayerSwitcher({ id, map, layers }: Props) {
    const [layerIndex, setLayerIndex] = useState(1);
    const switcherMapElement = useRef<HTMLDivElement | null>(null);
    const switcherMap = useRecoilValue(olMapStore(`switcher-${id}`));
    const initLayers = useRecoilValue(mapLayersStore(`switcher-${id}`));

    useEffect(() => {
        if (!switcherMapElement.current) return;
        switcherMap.setTarget(switcherMapElement.current);
        map.getView().on("change", (e) => {
            switcherMap.setView(map.getView());
        });
    }, []);

    useEffect(() => {
        layers[layerIndex].setVisible(true);
        initLayers[layerIndex].setVisible(false);
    }, [layerIndex]);
    const handleClick = () => {
        layers[layerIndex].setVisible(false);
        initLayers[layerIndex].setVisible(true);
        setLayerIndex((prev) => (prev === 0 ? 1 : 0));
    };

    return (
        <div className={styles.layerSwitcher} onClick={handleClick}>
            <div className={styles.layerSwitcherMap} ref={switcherMapElement} />
        </div>
    );
}
