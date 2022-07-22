const geometryTypes = [
    "Point",
    "LineString",
    "Polygon",
    "MultiPoint",
    "MultiLineString",
    "MultiPolygon",
];

export function isObject(object: any) {
    return object === Object(object);
}

export function isGeometryObject(geometry: any) {
    if (!isObject(geometry)) {
        console.log("Not an object: ", geometry);
        return false;
    }
    if (!Object.hasOwn(geometry, "type")) {
        console.log("No member 'type'");
        return false;
    }

    if (!geometryTypes.includes(geometry.type)) {
        console.log("Not a valid geometry type");
        return false;
    }
    return true;
}

export function isFeature(feature: any) {
    if (!isObject(feature)) {
        console.log("Not an object: ", feature);
        return false;
    }
    if (!Object.hasOwn(feature, "type")) {
        console.log("No member 'type'");
        return false;
    }

    if (feature.type !== "Feature") {
        console.log("Not a feature");
        return false;
    }
    if (!Object.hasOwn(feature, "geometry")) {
        console.log("No member 'geometry'");
        return false;
    }

    if (!isGeometryObject(feature.geometry)) {
        console.log("Not a valid geometry");
        return false;
    }
    return true;
}

export function isFeatureCollection(featureCollection: any) {
    if (!isObject(featureCollection)) {
        console.log("Not an object: ", featureCollection);
        return false;
    }
    if (!Object.hasOwn(featureCollection, "type")) {
        console.log("No member 'type'");
        return false;
    }

    if (featureCollection.type !== "FeatureCollection") {
        console.log("Not a feature Collection type");
        return false;
    }

    if (!Object.hasOwn(featureCollection, "features")) {
        console.log("No member 'features'");
        return false;
    }
    if (!Array.isArray(featureCollection.features)) {
        console.log("'features' member not an Array");
        return false;
    }

    if (
        (featureCollection.features as any[]).some(
            (feature) => !isFeature(feature)
        )
    ) {
        console.log("One of the Features is not valid");
        return false;
    }
    return true;
}
