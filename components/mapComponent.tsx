import React, { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { layerStore, mapLayersStore, olMapStore } from "../lib/recoil";
import LayerSwitcher from "./layerSwitcher";
import styles from "../styles/Home.module.css";
import { FileWithPath, useDropzone } from "react-dropzone";
import useMap from "../lib/useMap";
interface Props {
    id: string;
}
const MapDisplay = ({ id }: Props) => {
    const mapElement = useRef<HTMLDivElement | null>(null);
    const map = useRecoilValue(olMapStore(id));
    const { addLayer, removeLayer } = useMap(id);
    const initLayers = useRecoilValue(mapLayersStore(id));
    const setList = useSetRecoilState(layerStore(id));
    useEffect(() => {
        if (!mapElement.current) return;
        map.setTarget(mapElement.current);
    }, []);

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: ".geojson",
    });
    const acceptedFileItems = (acceptedFiles: FileWithPath[]) => {
        acceptedFiles.map((file) => {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener("loadend", function () {
                var content = reader.result;
                if (content === null) return;
                let geojson = JSON.parse(content as string);
                const key = uuidv4();
                setList((prev) => [...prev, { uniqueId: key, name: file.path! }]);
                addLayer({
                    layerKey: key,
                    additionalInfo: { name: file.path! },
                    geojson: geojson,
                    zoomTo: true,
                });
            });
        });
    };
    useEffect(() => {
        acceptedFileItems(acceptedFiles);
    }, [acceptedFiles]);
    return (
        <>
            <div id="rootProps" {...getRootProps()} className={styles.mapComponent}>
                <div id={id} ref={mapElement} className={styles.mapComponent}>
                    <LayerSwitcher id={id} map={map} layers={initLayers} />
                </div>
            </div>
        </>
    );
};

export default MapDisplay;
