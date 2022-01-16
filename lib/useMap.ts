import Map from "ol/Map";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";

import OlGeoJSON from "ol/format/GeoJSON";

import { GeoJSON } from "geojson";
import { Fill, Stroke, Style, Text } from "ol/style";
import { useRecoilValue } from "recoil";
import { mapSelect, olMapStore } from "./recoil";

interface AddLayerProps {
    layerKey: string;
    geojson: GeoJSON;
    additionalInfo?: { [key: string]: any };
    style?: Style;
    zIndex?: number;
    zoomTo?: boolean;
}
interface RemoveLayerProps {
    layerKey?: string;
    layerObject?: BaseLayer;
}
interface SetVisibleProps {
    layerKey: string;
    visible: boolean;
}
interface ZoomToProps {
    layerKey?: string;
    layerObject?: VectorLayer<any>;
}
interface SelectProps {
    layerKey: string;
}

interface UseMapReturn {
    map: Map;
    addLayer: (options: AddLayerProps) => void;
    removeLayer: (options: RemoveLayerProps) => void;
    removeAllLayers: () => void;
    getLayer: (layerKey: string) => BaseLayer | undefined;
    setLayerVisibility: (options: SetVisibleProps) => void;
    zoomToLayer: (options: ZoomToProps) => void;
    selectLayer: (options: SelectProps) => void;
}

const defaultStyle = new Style({
    fill: new Fill({
        color: "rgba(255,255,255,0.4)",
    }),
    stroke: new Stroke({
        color: "#3399CC",
        width: 1.25,
    }),
});

const useMap = (mapid: string): UseMapReturn => {
    const map = useRecoilValue(olMapStore(mapid));
    const select = useRecoilValue(mapSelect(mapid));

    const removeLayer = ({ layerKey, layerObject }: RemoveLayerProps): void => {
        if (!map) return;
        if (layerObject) {
            map.removeLayer(layerObject);
        } else if (layerKey) {
            map.getLayers()
                .getArray()
                .filter((layer: BaseLayer) => layer.get("layerKey") === layerKey)
                .forEach((layer) => {
                    if (!map) return;
                    map.removeLayer(layer);
                });
        }
    };
    const removeAllLayers = (): void => {
        if (!map) return;
        const layers = [...map.getLayers().getArray()];
        layers.forEach((layer) => {
            if (layer instanceof VectorLayer) {
                console.log("Remove: ", layer);
                map.removeLayer(layer);
            }
        });
    };
    const getLayer = (layerKey: string): BaseLayer | undefined => {
        if (!map) return;
        const layer = map
            .getLayers()
            .getArray()
            .find((layer: BaseLayer) => layer.get("layerKey") === layerKey);
        return layer || undefined;
    };

    const addLayer = ({
        layerKey,
        geojson,
        additionalInfo,
        style,
        zIndex,
        zoomTo,
    }: AddLayerProps): void => {
        if (!map) return;

        let format = new OlGeoJSON();

        let features = format.readFeatures(geojson);

        let source = new VectorSource({
            features: features,
        });
        let layer = new VectorLayer({
            source: source,
            updateWhileAnimating: true,
            style: style ? style : defaultStyle,
        });
        layer.set("layerKey", layerKey);
        if (additionalInfo) {
            for (const [key, value] of Object.entries(additionalInfo)) {
                layer.set(key, value);
            }
        }
        if (zIndex) {
            layer.setZIndex(zIndex);
        }
        removeLayer({ layerKey });
        map.addLayer(layer);
        if (zoomTo) zoomToLayer({ layerKey: layerKey });
    };

    const setLayerVisibility = ({ layerKey, visible }: SetVisibleProps): void => {
        if (!map) return;
        map.getLayers()
            .getArray()
            .filter((layer: BaseLayer) => layer.get("layerKey") === layerKey)
            .forEach((layer) => {
                layer.setVisible(visible);
            });
    };

    const zoomToLayer = ({ layerKey, layerObject }: ZoomToProps): void => {
        if (layerKey) {
            map.getLayers()
                .getArray()
                .filter((layer: BaseLayer) => layer.get("layerKey") === layerKey)
                .forEach((layer) => {
                    if (layer instanceof VectorLayer) {
                        const currentZoom = map.getView().getZoom();
                        map.getView().fit(layer.getSource().getExtent(), {
                            size: map.getSize(),
                            maxZoom: currentZoom && currentZoom < 13 ? 13 : currentZoom,
                            duration: 300,
                        });
                    }
                });
        }
        if (layerObject) {
            const currentZoom = map.getView().getZoom();
            map.getView().fit(layerObject.getSource().getExtent(), {
                size: map.getSize(),
                maxZoom: currentZoom && currentZoom < 13 ? 13 : currentZoom,
                duration: 300,
            });
        }
    };
    const selectLayer = ({ layerKey }: SelectProps): void => {
        const layer = getLayer(layerKey);
        if (!layer) return;
        if (layer instanceof VectorLayer) {
            const source: VectorSource<any> = layer.getSource();
            const features = source.getFeatures();
            if (!features) return;
            select.getFeatures().clear();
            select.getFeatures().push(features[0]);
        }
    };
    return {
        map,
        addLayer,
        removeLayer,
        removeAllLayers,
        getLayer,
        setLayerVisibility,
        zoomToLayer,
        selectLayer,
    };
};

export default useMap;
