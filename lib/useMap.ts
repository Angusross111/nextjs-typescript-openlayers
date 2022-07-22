import { GeoJSON, Geometry as GeoJsonGeometry } from "geojson";
import { Collection } from "ol";
import Feature from "ol/Feature";
import OlGeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { createFeatures, layerStyles } from "./mapUtils";

import {
    activeModifyLayerKey,
    lastModifiedGeometry,
    lastZoomState,
    mapSelect,
    modifySourceState,
    olMapStore,
    redoStackState,
    undoStackState,
} from "./recoil";

export const useMap = (mapid: string) => {
    const map = useRecoilValue(olMapStore(mapid));
    const select = useRecoilValue(mapSelect(mapid));
    const [lastZoomID, setLastZoomID] = useRecoilState(lastZoomState(mapid));
    const modifySource = useRecoilValue(modifySourceState(mapid));
    const setModifyActive = useSetRecoilState(activeModifyLayerKey(mapid));
    const [undoStack, setUndoStack] = useRecoilState(undoStackState(mapid));
    const [redoStack, setRedoStack] = useRecoilState(redoStackState(mapid));
    const [lastModified, setLastModified] = useRecoilState(
        lastModifiedGeometry(mapid)
    );

    map.getView().on("change", (event) =>
        localStorage.setItem(
            `mapView-${mapid}`,
            JSON.stringify({
                center: event.target.getCenter(),
                zoom: event.target.getZoom(),
            })
        )
    );

    const addLayer = ({
        layerKey,
        geometryClass,
        geojson,
        additionalInfo,
        zoomTo,
        style,
    }: {
        layerKey: string;
        geometryClass?: string;
        geojson: GeoJSON | GeoJSON[];
        additionalInfo?: { [key: string]: any };
        zoomTo?: boolean;
        style?: Style | Style[];
    }) => {
        console.log("addLayer: ", layerKey);
        const features = createFeatures({ layerKey, geojson, additionalInfo });
        if (style) features.map((feature) => feature.setStyle(style));
        const layerSource = new VectorSource({ features });

        const layer = new VectorLayer({
            source: layerSource,
            updateWhileAnimating: true,
        });
        layer.set("layerKey", layerKey);
        if (geometryClass) {
            layer.set("geometryClass", geometryClass);
            const zIndex = Object.hasOwn(layerStyles, geometryClass)
                ? layerStyles[geometryClass].zIndex
                : 1;
            const geometryStyle = Object.hasOwn(layerStyles, geometryClass)
                ? layerStyles[geometryClass].style
                : undefined;
            if (!style) layer.setStyle(geometryStyle);
            layer.setZIndex(zIndex);
        }
        if (additionalInfo)
            Object.entries(additionalInfo).map(([key, value]) =>
                layer.set(key, value)
            );
        removeLayer(layerKey);

        map.addLayer(layer);

        if (zoomTo) zoomToLayer(layerKey);
    };

    const removeLayer = (layerKey: string) => {
        const layer = getLayer(layerKey);
        if (!layer) return;
        map.removeLayer(layer);
    };

    const setLayerVisibility = ({
        layerKey,
        visible,
    }: {
        layerKey: string;
        visible: boolean;
    }): void => {
        if (!map) return;
        map.getLayers()
            .getArray()
            .filter((layer: BaseLayer) => layer.get("layerKey") === layerKey)
            .forEach((layer) => {
                layer.setVisible(visible);
            });
    };

    const zoomToLayer = (layerKey: string) => {
        const layer = getLayer(layerKey);
        if (!layer) return;
        const layerExtend = layer.getSource()?.getExtent();
        if (!layerExtend) return;
        setLastModified(layerKey);
        const currentZoom = map.getView().getZoom();
        map.getView().fit(layerExtend, {
            size: map.getSize(),
            maxZoom:
                lastZoomID !== layerKey
                    ? currentZoom && currentZoom < 14
                        ? 14
                        : currentZoom
                    : 100,
            duration: 300,
        });
        setLastZoomID(layerKey);
    };
    const selectLayer = (layerKey: string) => {
        console.log("layerKey", layerKey);
        const feature = getFeature({ layerKey });
        if (!feature) return;
        const featureLayer = select.getLayer(feature);

        if (featureLayer && featureLayer.get("layerKey") === layerKey) {
            return;
        }

        select.getFeatures().push(feature);
    };

    const unSelectLayer = () => {
        select.getFeatures().clear();
    };

    const modifyLayer = (layerKey: string) => {
        setModifyActive(layerKey);
        disableSelect();
        const features = getLayerFeatures(layerKey);
        const modifyFeatures = getModifyFeatures(layerKey).filter(
            (feature) => feature.get("layerKey") === layerKey
        );
        modifyFeatures.map((feature) => modifySource.removeFeature(feature));

        modifySource.addFeatures(features);
        console.log("modifySource features", modifySource.getFeatures());
    };

    const saveModify = (layerKey: string) => {
        const features = getModifyFeatures(layerKey);
        setModifyActive(undefined);
        enableSelect();
        features.map((feature) => modifySource.removeFeature(feature));
        removeRedoStack(layerKey);
        removeUndoStack(layerKey);
    };

    const getGeometry = ({
        layerKey,
    }: {
        layerKey: string | undefined;
    }): GeoJsonGeometry | undefined => {
        if (!layerKey) return;
        const feature = getFeature({ layerKey });
        if (!feature) return;
        const geojsonObject = new OlGeoJSON().writeFeatureObject(feature);
        return geojsonObject.geometry as GeoJsonGeometry;
    };

    const getGeometries = ({
        layerKey,
    }: {
        layerKey: string | undefined;
    }): GeoJsonGeometry[] => {
        if (!layerKey) return [];
        const converter = new OlGeoJSON();
        const features = getFeatures({ layerKey });
        const geojsonList = features.map((feature) =>
            converter.writeFeatureObject(feature)
        );
        return geojsonList.map(
            (feature) => feature.geometry as GeoJsonGeometry
        );
    };

    const getFeature = ({
        layerKey,
    }: {
        layerKey: string;
    }): Feature | undefined => {
        if (!map) return;
        const layer = map
            .getLayers()
            .getArray()
            .find(
                (layer: BaseLayer) => layer.get("layerKey") === layerKey
            ) as VectorLayer<VectorSource<Geometry>>;

        if (!layer) return;
        const features = layer.getSource()?.getFeatures();
        return features && features.length > 0 ? features[0] : undefined;
    };

    const undo = (stackKey?: string) => {
        if (!stackKey || !lastModified) return;
        if (!stackKey) stackKey = lastModified;
        if (Object.hasOwn(undoStack, stackKey)) {
            //Get the current feature from Map as well as last feature from stack
            const currModifyFeature = getModifyFeature(stackKey);
            console.log("currModifyFeature", currModifyFeature);
            if (!currModifyFeature) return;
            const prevModifyFeature = undoStack[stackKey].pop();
            if (!prevModifyFeature) return;

            // Push current feature to the redo stack, with same format as undo stack above
            addFeatureToRedoStack({
                stackKey,
                feature: currModifyFeature.clone(),
            });

            //Replace current feature with last feature
            currModifyFeature.setGeometry(prevModifyFeature.getGeometry());

            // If that was the last Undo feature, remove that collection from the stack.
            if (undoStack[stackKey].getLength() === 0) {
                removeUndoStack(stackKey);
            }
        }
    };
    const redo = (stackKey?: string) => {
        if (!stackKey || !lastModified) return;
        if (!stackKey) stackKey = lastModified;
        if (Object.hasOwn(redoStack, stackKey)) {
            const currModifyFeature = getModifyFeature(stackKey);
            console.log("currModifyFeature", currModifyFeature);
            if (!currModifyFeature) return;
            const prevModifyFeature = redoStack[stackKey].pop();
            if (!prevModifyFeature) return;
            const planID: string | undefined = currModifyFeature.get("planID");
            addFeatureToUndoStack({
                stackKey,
                feature: currModifyFeature.clone(),
            });

            currModifyFeature.setGeometry(prevModifyFeature.getGeometry());
            if (redoStack[stackKey].getLength() === 0) {
                removeRedoStack(stackKey);
            }
        }
    };

    const cancelModify = (layerKey?: string) => {
        if (!layerKey) {
            if (lastModified) {
                cancelModify(lastModified);
            } else {
                modifySource.clear();
                setModifyActive(undefined);
                enableSelect();
            }
            return;
        }
        setModifyActive(undefined);
        enableSelect();
        const feature = getFeature({ layerKey });
        const modifyFeatures = getModifyFeatures(layerKey);

        if (!feature || modifyFeatures.length === 0) return;

        if (Object.hasOwn(undoStack, layerKey)) {
            const originalFeature = undoStack[layerKey].item(0);

            if (!originalFeature) return;
            feature.setGeometry(originalFeature.getGeometry());
            const planID: string | undefined = feature.get("planID");
            removeUndoStack(layerKey);
            removeRedoStack(layerKey);
        }
        modifyFeatures.map((feature) => modifySource.removeFeature(feature));
    };

    const addFeatureToUndoStack = ({
        stackKey,
        feature,
    }: {
        stackKey: string;
        feature: Feature<Geometry>;
    }) => {
        if (Object.hasOwn(undoStack, stackKey)) {
            undoStack[stackKey].push(feature);
        } else {
            setUndoStack((prev) => ({
                ...prev,
                [stackKey]: new Collection<Feature<Geometry>>([feature]),
            }));
        }
    };

    const removeRedoStack = (layerKey: string) => {
        setRedoStack(({ [layerKey]: key, ...prev }) => prev);
    };

    const disableSelect = () => {
        select.getFeatures().clear();
        select.setActive(false);
    };
    const enableSelect = () => {
        select.setActive(true);
    };

    const replaceGeometry = ({
        layerKey,
        geojson,
    }: {
        layerKey: string;
        geojson: GeoJSON | GeoJSON[];
    }) => {
        const currModifyFeatures = getModifyFeatures(layerKey);
        if (currModifyFeatures.length === 0) return;
        if (Object.hasOwn(undoStack, layerKey)) {
            undoStack[layerKey].push(currModifyFeatures[0].clone());
        } else {
            setUndoStack((prev) => ({
                ...prev,
                [layerKey]: new Collection<Feature<Geometry>>([
                    currModifyFeatures[0].clone(),
                ]),
            }));
        }
        let format = new OlGeoJSON();
        const geometry = format.readGeometry(geojson);
        currModifyFeatures[0].setGeometry(geometry);
    };

    //Internal
    const getLayer = (
        layerKey: string
    ): VectorLayer<VectorSource<Geometry>> | undefined => {
        if (!map) return;
        const layer = map
            .getLayers()
            .getArray()
            .find((layer: BaseLayer) => layer.get("layerKey") === layerKey);
        return (layer as VectorLayer<VectorSource<Geometry>>) || undefined;
    };

    const getLayerFeatures = (layerKey: string) => {
        const layer = getLayer(layerKey);
        return layer?.getSource()?.getFeatures() ?? [];
    };
    const getModifyFeatures = (layerKey: string) => {
        return modifySource
            .getFeatures()
            .filter((feature) => feature.get("layerKey") === layerKey);
    };
    const getModifyFeature = (stackKey: string) => {
        const [layerKey, indexKey] = stackKey.split("_");

        const features = modifySource
            .getFeatures()
            .filter((feature) => feature.get("layerKey") === layerKey);
        if (indexKey)
            return features.find(
                (feature) => feature.get("indexKey").toString() === indexKey
            );

        return features.length > 0 ? features[0] : undefined;
    };
    const getFeatures = ({ layerKey }: { layerKey: string }): Feature[] => {
        if (!map) return [];
        const layer = map
            .getLayers()
            .getArray()
            .find(
                (layer: BaseLayer) => layer.get("layerKey") === layerKey
            ) as VectorLayer<VectorSource<Geometry>>;

        return layer?.getSource()?.getFeatures() ?? [];
    };
    const addFeatureToRedoStack = ({
        stackKey,
        feature,
    }: {
        stackKey: string;
        feature: Feature<Geometry>;
    }) => {
        if (Object.hasOwn(redoStack, stackKey)) {
            redoStack[stackKey].push(feature);
        } else {
            setRedoStack((prev) => ({
                ...prev,
                [stackKey]: new Collection<Feature<Geometry>>([feature]),
            }));
        }
    };
    const removeUndoStack = (layerKey: string) => {
        setUndoStack(({ [layerKey]: key, ...prev }) => prev);
    };
    return {
        map,
        select,
        lastModified,
        addLayer,
        removeLayer,
        getGeometry,
        getGeometries,
        setLayerVisibility,
        zoomToLayer,
        selectLayer,
        unSelectLayer,
        undo,
        redo,
        addFeatureToUndoStack,
        modifyLayer,
        saveModify,
        getFeature,
        cancelModify,
        undoStackKeys: Object.keys(undoStack),
        removeUndoStack,
        removeRedoStack,
        disableSelect,
        enableSelect,
        replaceGeometry,
    };
};
