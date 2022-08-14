import Collection from "ol/Collection";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { ModifyEvent } from "ol/interaction/Modify";
import { useEffect, useRef } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import {
    lastModifiedLayerKey,
    mapDragBox,
    mapLayersStore,
    mapModify,
    mapSelect,
    mapSelectedLayerKey,
    modifySourceState,
    olMapStore,
    redoStackState,
    undoStackState,
} from "../lib/recoil";
import LayerSwitcher from "./layerSwitcher";

export function MapDisplay({
    mapID,
    className,
}: {
    mapID: string;
    className: string;
}) {
    const mapElement = useRef<HTMLDivElement | null>(null);
    const map = useRecoilValue(olMapStore(mapID));
    const initLayers = useRecoilValue(mapLayersStore(mapID));

    const select = useRecoilValue(mapSelect(mapID));
    const setSelectedLayer = useSetRecoilState(mapSelectedLayerKey(mapID));
    const modifySource = useRecoilValue(modifySourceState(mapID));

    const modify = useRecoilValue(mapModify(mapID));
    const dragBox = useRecoilValue(mapDragBox(mapID));
    const [undoStack, setUndoStack] = useRecoilState(undoStackState(mapID));
    const [redoStack, setRedoStack] = useRecoilState(redoStackState(mapID));
    const setLastModified = useSetRecoilState(lastModifiedLayerKey(mapID));
    useEffect(() => {
        if (!mapElement.current) return;
        map.setTarget(mapElement.current);
        function dragBoxEnd() {
            const extent = dragBox.getGeometry().getExtent();
            const boxFeatures = modifySource
                .getFeaturesInExtent(extent)
                .filter((feature) =>
                    feature?.getGeometry()?.intersectsExtent(extent)
                );
            console.log("boxFeatures", boxFeatures);
        }

        const selectChange = (event: any) => {
            console.log("selectChange");
            const feature = event.element;
            const layer = select.getLayer(feature);
            if (!layer) return;
            const layerKey = layer.get("layerKey");
            setSelectedLayer(layerKey);
        };
        const remove = () => setSelectedLayer(undefined);

        const addToStack = (event: ModifyEvent) => {
            console.log("modifystart");
            if (event.features.getArray().length === 0) return;
            const feature = event.features.getArray()[0] as Feature<Geometry>;
            const layerKey = feature.get("layerKey");
            setLastModified(layerKey);
            if (Object.hasOwn(redoStack, layerKey)) {
                delete redoStack[layerKey];
            }
            if (Object.hasOwn(undoStack, layerKey)) {
                undoStack[layerKey].push(feature.clone());
                console.log(undoStack[layerKey].getArray());
            } else {
                setUndoStack((prev) => ({
                    ...prev,
                    [layerKey]: new Collection<Feature<Geometry>>([
                        feature.clone(),
                    ]),
                }));
            }
        };
        modify.on("modifystart", addToStack);
        select.getFeatures().on(["add"], selectChange);
        select.getFeatures().on(["remove"], remove);
        dragBox.on("boxend", dragBoxEnd);

        return () => {
            console.log("Cleanup");
            modify.un("modifystart", addToStack);
            select.getFeatures().un(["add"], selectChange);
            select.getFeatures().un(["remove"], remove);
            dragBox.un("boxend", dragBoxEnd);
        };
    }, [redoStack, undoStack]);

    return (
        <div id={mapID} ref={mapElement} className={className}>
            <LayerSwitcher id={mapID} map={map} layers={initLayers} />
        </div>
    );
}
