import Collection from "ol/Collection";
import { platformModifierKeyOnly } from "ol/events/condition";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import DragBox from "ol/interaction/DragBox";
import Modify from "ol/interaction/Modify";
import Select from "ol/interaction/Select";
import OlLayerTile from "ol/layer/Tile";
import olMap from "ol/Map";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import View from "ol/View";
import { atomFamily, selectorFamily } from "recoil";
export const mapLayersStore = atomFamily<OlLayerTile<XYZ>[], string>({
    key: "mapLayers",
    default: (id) => [
        new OlLayerTile({
            source: new XYZ({
                url: "https://mt0.google.com/vt/lyrs=s&hl=en&x={x}&y={y}&z={z}",
            }),
        }),
        new OlLayerTile({
            source: new XYZ({
                url: "https://mt0.google.com/vt/lyrs=p&hl=en&x={x}&y={y}&z={z}",
            }),
        }),
    ],
    dangerouslyAllowMutability: true,
});

export const olMapStore = atomFamily<olMap, string>({
    key: "mapStore",
    default: selectorFamily({
        key: "mapStoreLoader",
        get:
            (id) =>
            async ({ get }) => {
                const select = get(mapSelect(id));
                const modify = get(mapModify(id));
                const dragBox = get(mapDragBox(id));

                const mapView = localStorage.getItem(`mapView-${id}`)
                    ? JSON.parse(
                          localStorage.getItem(`mapView-${id}`) as string
                      )
                    : { center: [133, -29], zoom: 5 };
                const view = new View({
                    projection: "EPSG:4326",
                    center: mapView.center,
                    zoom: mapView.zoom,
                });
                const layers = get(mapLayersStore(id));
                layers[0].setVisible(false);
                const map = new olMap({
                    layers: layers,
                    view: view,
                    controls: [],
                });
                map.addInteraction(dragBox);
                map.addInteraction(select);
                map.addInteraction(modify);

                return map;
            },
        dangerouslyAllowMutability: true,
    }),
    dangerouslyAllowMutability: true,
});

export const mapSelect = atomFamily({
    key: "mapSelect",
    default: (id) =>
        new Select({
            hitTolerance: 4,
        }),
    dangerouslyAllowMutability: true,
});

export const mapDragBox = atomFamily({
    key: "mapDragBox",
    default: (id) =>
        new DragBox({
            condition: platformModifierKeyOnly,
        }),
    dangerouslyAllowMutability: true,
});
export interface LayerStoreType {
    uniqueId: string;
    name: string;
}

export const layerStore = atomFamily<LayerStoreType[], string>({
    key: "layerStore2",
    default: [],
});

export const modifySourceState = atomFamily<VectorSource<Geometry>, string>({
    key: "modifySourceState",
    default: new VectorSource({}),
    dangerouslyAllowMutability: true,
});

export const mapModify = selectorFamily({
    key: "mapModify",
    get:
        (mapid) =>
        ({ get }) => {
            const modifySrc = get(modifySourceState(mapid as string));
            const modify = new Modify({
                source: modifySrc,
            });
            return modify;
        },
    dangerouslyAllowMutability: true,
});

export const lastZoomState = atomFamily<string | null, string>({
    key: "lastZoomState",
    default: null,
});

export const utmConfigState = atomFamily<
    { zone: string; hemisphere: "south" | "north" },
    string
>({
    key: "utmConfigState",
    default: { zone: "55", hemisphere: "south" },
});

export const undoStackState = atomFamily<
    { [key: string]: Collection<Feature<Geometry>> },
    string
>({
    key: "undoStackState",
    default: {},
    dangerouslyAllowMutability: true,
});
export const redoStackState = atomFamily<
    { [key: string]: Collection<Feature<Geometry>> },
    string
>({
    key: "redoStackState",
    default: {},
    dangerouslyAllowMutability: true,
});

export const mapSelectedLayerKey = atomFamily<string | undefined, string>({
    key: "mapSelectedLayerKey",
    default: undefined,
});

export const lastModifiedLayerKey = atomFamily<string | undefined, string>({
    key: "lastModifiedLayerKey",
    default: undefined,
});

export const activeModifyLayerKey = atomFamily<string | undefined, string>({
    key: "activeModifyLayerKey",
    default: undefined,
});

export const lastModifiedGeometry = atomFamily<string | undefined, string>({
    key: "lastModifiedGeometry",
    default: undefined,
});
