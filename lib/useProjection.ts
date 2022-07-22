import { Feature, Geometry } from "geojson";
import proj4 from "proj4";
import { feature as turfFeature } from "@turf/helpers";
export function useProjection({
    zone,
    hemisphere,
}: {
    zone: string;
    hemisphere: "south" | "north";
}) {
    let projString = `+proj=utm +zone=${zone} +ellps=WGS84`;
    if (hemisphere === "south") {
        projString = projString.concat(" +south");
    }
    const projection = proj4(projString);

    const projectFeature = (feature: Feature) => {
        return turfFeature(projectGeometry(feature.geometry));
    };
    const unProjectFeature = (feature: Feature) => {
        return turfFeature(unprojectGeometry(feature.geometry));
    };
    const projectGeometry = (geometry: Geometry) => {
        if (geometry.type === "GeometryCollection") return;
        return {
            type: geometry.type,
            coordinates: projectCoords(geometry.coordinates),
        };
    };
    const unprojectGeometry = (geometry: Geometry) => {
        if (geometry.type === "GeometryCollection") return;
        return {
            type: geometry.type,
            coordinates: unprojectCoords(geometry.coordinates),
        };
    };
    const projectCoords = (coords: any) => {
        if (typeof coords[0] !== "object") return projection.forward(coords);
        return coords.map(function (coord: any) {
            return projectCoords(coord);
        });
    };
    const unprojectCoords = (coords: any) => {
        if (typeof coords[0] !== "object") {
            const inv = projection.inverse(coords);
            return inv;
        }
        return coords.map(function (coord: any) {
            return unprojectCoords(coord);
        });
    };

    return {
        projectFeature,
        unProjectFeature,
        projectGeometry,
        unprojectGeometry,
    };
}
