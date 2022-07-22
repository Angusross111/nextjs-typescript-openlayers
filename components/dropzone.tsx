import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import Style from "ol/style/Style";
import Text from "ol/style/Text";
import { ReactElement, useCallback } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { useSetRecoilState } from "recoil";
import { v4 as uuidv4 } from "uuid";
import { layerStore } from "../lib/recoil";
import { useMap } from "../lib/useMap";

import styles from "../styles/Home.module.css";

export default function Dropzone({ id }: { id: string }): ReactElement {
    const setList = useSetRecoilState(layerStore(id));
    const { addLayer, removeLayer } = useMap(id);

    const onDropAccepted = useCallback((acceptedFiles: FileWithPath[]) => {
        acceptedFiles.map((file) => {
            var reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener("loadend", function () {
                var content = reader.result;
                if (content === null) return;
                let geojson = JSON.parse(content as string);
                console.log(geojson);
                const key = uuidv4();
                setList((prev) => [
                    ...prev,
                    { uniqueId: key, name: file.path! },
                ]);

                const styleFunc = (feature: any, resolution: any) => {
                    console.log(feature.getId());
                    return new Style({
                        fill: new Fill({
                            color: "rgba(255,255,255,0.4)",
                        }),
                        stroke: new Stroke({
                            color: "#3399CC",
                            width: 1.25,
                        }),
                        text: new Text({
                            font: "12px Calibri,sans-serif",
                            fill: new Fill({ color: "#000" }),
                            stroke: new Stroke({
                                color: "#fff",
                                width: 2,
                            }),
                            text: `${feature.getId()}`,
                        }),
                    });
                };
                console.log("Add Layer here");
                addLayer({
                    layerKey: key,
                    additionalInfo: { name: file.path! },
                    geojson: geojson,
                    zoomTo: true,
                    // style: styleFunc,
                });
            });
        });
    }, []);

    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            "application/geo+json": [".geojson"],
            "application/zip": [".zip"],
            "text/plain": [".txt"],
        },
        onDropAccepted,
    });
    return (
        <div id="rootProps" {...getRootProps()}>
            <div className={styles.dropzone}>Drop Here</div>
        </div>
    );
}
