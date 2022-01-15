import React, { useEffect, useRef, useState } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Map from "ol/Map";
import View from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
const initLayers = [
    new OlLayerTile({
        source: new XYZ({
            url: "http://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
        }),
    }),
    new OlLayerTile({
        source: new XYZ({
            url: "http://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
        }),
    }),
];

const Home: NextPage = () => {
    const mapElement = useRef<HTMLDivElement | null>(null);
    const [map, setMap] = useState<Map | undefined>();

    useEffect(() => {
        setMap(initMap(mapElement));
    }, []);
    function initMap(mapElement: React.MutableRefObject<HTMLDivElement | null>): Map | undefined {
        if (!mapElement.current) return;

        const view = new View({
            projection: "EPSG:4326",
            center: [133, -29],
            zoom: 5,
        });

        const map = new Map({
            layers: initLayers,
            view: view,
            controls: [],
        });
        map.setTarget(mapElement.current);
        return map;
    }

    return (
        <div className={styles.container}>
            <div id="Map-provider" ref={mapElement} className={styles.map} />
        </div>
    );
};

export default Home;
