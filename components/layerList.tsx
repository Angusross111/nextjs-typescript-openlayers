import { Geometry } from "geojson";
import React, { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { layerStore, LayerStoreType } from "../lib/recoil";
import { useMap } from "../lib/useMap";
import styles from "../styles/Home.module.css";

const LayerList = ({ id }: { id: string }): JSX.Element => {
    const [list, setList] = useRecoilState(layerStore(id));

    const { addLayer } = useMap(id);

    useEffect(() => {
        setList([{ uniqueId: "abc", name: "Test" }]);
        addLayer({
            layerKey: "abc",
            geojson: {
                type: "LineString",
                coordinates: [
                    [148.33746732, -23.80909807],
                    [148.34989253, -23.80015],
                ],
            },
            zoomTo: true,
        });
    }, []);

    const createNewLayer = () => {};
    return (
        <>
            {list.map((layer) => (
                <ListItem key={layer.uniqueId} layer={layer} mapId={id} />
            ))}
            <button className={styles.listItem} onClick={createNewLayer}>
                Add
            </button>
        </>
    );
};
export default LayerList;

interface ListItemProps {
    layer: LayerStoreType;
    mapId: string;
}
const ListItem = ({ layer, mapId }: ListItemProps) => {
    const [checked, setChecked] = useState(true);
    const [modifyActive, setModifyActive] = useState(false);
    const setList = useSetRecoilState(layerStore(mapId));
    const [displayGeom, setDisplayGeom] = useState<Geometry | undefined>();

    const [bufferDistance, setBufferDistance] = useState(6);

    const [bufferError, setBufferError] = useState(false);
    const {
        setLayerVisibility,
        zoomToLayer,
        selectLayer,
        removeLayer,
        modifyLayer,
        saveModify,
        getGeometry,
        cancelModify,
    } = useMap(mapId);

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        setLayerVisibility({
            layerKey: layer.uniqueId,
            visible: event.target.checked,
        });
    };
    const handleZoom = () => {
        zoomToLayer(layer.uniqueId);
    };
    const handleSelect = () => {
        selectLayer(layer.uniqueId);
    };
    const handleDelete = () => {
        removeLayer(layer.uniqueId);
        setList((prev) =>
            prev.filter(({ uniqueId }) => uniqueId !== layer.uniqueId)
        );
    };

    const handleModify = () => {
        setModifyActive(true);
        modifyLayer(layer.uniqueId);
    };
    const handleSave = () => {
        setModifyActive(false);
        saveModify(layer.uniqueId);
    };
    const handleGetGeometry = () => {
        setDisplayGeom(getGeometry({ layerKey: layer.uniqueId }));
    };

    const handleCancel = () => {
        cancelModify(layer.uniqueId);
        setModifyActive(false);
    };

    return (
        <div>
            <div style={{ display: "flex", padding: "6px" }}>
                <input
                    name="isGoing"
                    type="checkbox"
                    checked={checked}
                    onChange={handleToggle}
                    style={{ marginLeft: "6px", marginRight: "6px" }}
                />
                <div
                    style={{
                        fontSize: 18,
                        marginLeft: "6px",
                        marginRight: "6px",
                    }}
                >
                    {layer.name}
                </div>
                <button className={styles.listItem} onClick={handleZoom}>
                    Zoom to
                </button>
                <button className={styles.listItem} onClick={handleSelect}>
                    Select
                </button>
                <button className={styles.listItem} onClick={handleDelete}>
                    Delete
                </button>
                <button className={styles.listItem} onClick={handleGetGeometry}>
                    Get Geometry
                </button>

                <input
                    type="text"
                    name="buffer"
                    value={bufferDistance}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        if (
                            !/^[+-]?\d+(\.\d+)?$/.test(
                                event.currentTarget.value
                            )
                        ) {
                            setBufferError(true);
                        } else {
                            setBufferError(false);
                        }
                        setBufferDistance(
                            parseFloat(event.currentTarget.value)
                        );
                    }}
                />

                {modifyActive ? (
                    <button className={styles.listItem} onClick={handleSave}>
                        Save
                    </button>
                ) : (
                    <button className={styles.listItem} onClick={handleModify}>
                        Modify
                    </button>
                )}
                <button className={styles.listItem} onClick={handleCancel}>
                    Cancel
                </button>
            </div>
            <div>
                <pre className={styles.display}>
                    {JSON.stringify(displayGeom, null, 2)}
                </pre>
            </div>
        </div>
    );
};
