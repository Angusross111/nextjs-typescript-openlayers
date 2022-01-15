import { atom, selector } from "recoil";
import memoize from "memoizee";
import olMap from "ol/Map";
import View from "ol/View";
import OlLayerTile from "ol/layer/Tile";
import XYZ from "ol/source/XYZ";
import Select from "ol/interaction/Select";
export const mapLayersStore = memoize((id: string) =>
    atom<OlLayerTile<XYZ>[]>({
        key: `mapLayers-${id}`,
        default: [
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
        ],
        dangerouslyAllowMutability: true,
    })
);
export const olMapStore = memoize((id: string) =>
    atom<olMap>({
        key: `mapStore-${id}`,
        default: selector({
            key: `mapStoreLoader-${id}`,
            get: ({ get }) => {
                const select = get(mapSelect(id));
                const view = new View({
                    projection: "EPSG:4326",
                    center: [133, -29],
                    zoom: 4,
                });
                const layers = get(mapLayersStore(id));
                const map = new olMap({
                    layers: layers,
                    view: view,
                    controls: [],
                });
                map.addInteraction(select);
                return map;
            },
            dangerouslyAllowMutability: true,
        }),
        dangerouslyAllowMutability: true,
    })
);
export const mapSelect = memoize((id: string) =>
    atom({
        key: `mapSelect-${id}`,
        default: new Select({
            hitTolerance: 4,
        }),
        dangerouslyAllowMutability: true,
    })
);
