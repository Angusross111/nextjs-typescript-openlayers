import { FeatureCollection, GeoJSON } from "geojson";
import Feature from "ol/Feature";
import OlGeoJSON from "ol/format/GeoJSON";
import { Geometry } from "ol/geom";
import { Circle as CircleStyle, Fill, Stroke, Style } from "ol/style";
import { isFeature, isFeatureCollection, isGeometryObject } from "./geojsonValidation";

export const createFeatures = ({
    layerKey,
    geojson,
    additionalInfo,
}: {
    layerKey: string;
    geojson: GeoJSON | GeoJSON[];
    additionalInfo?: { [key: string]: any };
}) => {
    if (Array.isArray(geojson)) {
        return geojson
            .map((geometry, index) => createFeature({ layerKey, index, geometry, additionalInfo }))
            .filter(Boolean) as Feature<Geometry>[];
    } else if (isFeatureCollection(geojson)) {
        return (geojson as FeatureCollection).features
            .map((geometry, index) => createFeature({ layerKey, index, geometry, additionalInfo }))
            .filter(Boolean) as Feature<Geometry>[];
    } else {
        return [createFeature({ layerKey, index: 0, geometry: geojson, additionalInfo })].filter(
            Boolean
        ) as Feature<Geometry>[];
    }
};

//If input is Geometry wrap with Feature before reading.
export const createFeature = ({
    layerKey,
    index,
    geometry,
    additionalInfo,
}: {
    layerKey: string;
    index: number;
    geometry: GeoJSON;
    additionalInfo?: { [key: string]: any };
}): Feature<Geometry> | undefined => {
    let format = new OlGeoJSON();
    let feature = undefined;

    if (isGeometryObject(geometry)) {
        feature = {
            type: "Feature",
            geometry,
        };
    } else if (isFeature(geometry)) {
        feature = geometry;
    }
    if (!feature) return;
    const olFeature = format.readFeature(feature);
    olFeature.set("layerKey", layerKey);
    olFeature.set("indexKey", index);
    if (additionalInfo) Object.entries(additionalInfo).map(([key, value]) => olFeature.set(key, value));
    return olFeature;
};

export const layerStyles: {
    [key: string]: {
        zIndex: number;
        style: Style | Style[];
        stagedStyle: Style;
    };
} = {
    geofence: {
        zIndex: 1,
        style: new Style({
            fill: new Fill({
                color: "rgba(153, 153, 153,0.6)",
            }),
            stroke: new Stroke({
                color: "#737373",
                width: 0.5,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                width: 2,
                color: "#b52700",
                lineDash: [1, 5],
            }),
        }),
    },

    operatingArea: {
        zIndex: 2,
        style: new Style({
            fill: new Fill({
                color: "rgba(30, 145, 212,0.1)",
            }),
            stroke: new Stroke({
                color: "#3399CC",
                width: 2,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#eb9234",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    greenArea: {
        zIndex: 3,
        style: new Style({
            fill: new Fill({
                color: "rgba(10, 179, 0,0.2)",
            }),
            stroke: new Stroke({
                color: "rgba(10, 179, 0,0.6)",
                width: 2,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#00a115",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    headland: {
        zIndex: 4,
        style: new Style({
            stroke: new Stroke({
                color: "rgba(178, 18, 181, 0.6)",
                width: 2,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#b207b5",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    planningObstacle: {
        zIndex: 5,
        style: new Style({
            fill: new Fill({
                color: "rgba(30, 145, 212,-5)",
            }),
            stroke: new Stroke({
                color: "#3399CC",
                width: 2,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#00a115",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    obstacle: {
        zIndex: 6,
        style: new Style({
            fill: new Fill({
                color: "rgba(255, 100, 92,0.7)",
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#eb7900",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    abLine: {
        zIndex: 7,
        style: new Style({
            stroke: new Stroke({
                color: "#f53d25",
                width: 3,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#ffdd00",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    tramlines: {
        zIndex: 1,
        style: new Style({
            stroke: new Stroke({
                color: "rgba(178, 18, 181, 0.6)",
                width: 2,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#b207b5",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    road: {
        zIndex: 8,
        style: [
            new Style({
                stroke: new Stroke({
                    color: "rgba(227, 164, 2,1)",
                    width: 4,
                }),
            }),
            new Style({
                stroke: new Stroke({
                    color: "rgba(253, 226, 147,1)",
                    width: 3,
                }),
            }),
        ],
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#00c0eb",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    workPath: {
        zIndex: 9,
        style: new Style({
            stroke: new Stroke({
                color: "#03a5fc",
                width: 1,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#03a5fc",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    combinedWorkPath: {
        zIndex: 9,
        style: new Style({
            stroke: new Stroke({
                color: "#0fa348",
                width: 3,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#14b8a5",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
    generic: {
        zIndex: 10,
        style: new Style({
            image: new CircleStyle({
                radius: 1,
                fill: new Fill({
                    color: "#a100ba",
                }),
            }),
            stroke: new Stroke({
                color: "#a100ba",
                width: 3,
            }),
        }),
        stagedStyle: new Style({
            stroke: new Stroke({
                color: "#a100ba",
                width: 2,
                lineDash: [0.1, 5],
            }),
        }),
    },
};
