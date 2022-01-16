import React, { useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { layerStore, LayerStoreType } from "../lib/recoil";
import useMap from "../lib/useMap";
import styles from "../styles/Home.module.css";

interface Props {
    id: string;
}
const LayerList = ({ id }: Props): JSX.Element => {
    const list = useRecoilValue(layerStore(id));

    return (
        <>
            {list.map((layer) => (
                <ListItem key={layer.uniqueId} layer={layer} mapId={id} />
            ))}
        </>
    );
};
export default LayerList;

interface ListItemProps {
    layer: LayerStoreType;
    mapId: string;
}
const ListItem = ({ layer, mapId }: ListItemProps) => {
    const [checked, setChecked] = useState<boolean>(true);
    const setList = useSetRecoilState(layerStore(mapId));
    const { setLayerVisibility, zoomToLayer, selectLayer, removeLayer } = useMap(mapId);

    const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        setChecked(event.target.checked);
        setLayerVisibility({ layerKey: layer.uniqueId, visible: event.target.checked });
    };
    const handleZoom = () => {
        zoomToLayer({ layerKey: layer.uniqueId });
    };
    const handleSelect = () => {
        selectLayer({ layerKey: layer.uniqueId });
    };
    const handleDelete = () => {
        removeLayer({ layerKey: layer.uniqueId });
        setList((prev) => prev.filter(({ uniqueId }) => uniqueId !== layer.uniqueId));
    };
    return (
        <div style={{ display: "flex", padding: "6px" }}>
            <input
                name="isGoing"
                type="checkbox"
                checked={checked}
                onChange={handleToggle}
                style={{ marginLeft: "6px", marginRight: "6px" }}
            />
            <div style={{ fontSize: 18, marginLeft: "6px", marginRight: "6px" }}>{layer.name}</div>
            <button className={styles.listItem} onClick={handleZoom}>
                Zoom to
            </button>
            <button className={styles.listItem} onClick={handleSelect}>
                Select
            </button>
            <button className={styles.listItem} onClick={handleDelete}>
                Delete
            </button>
        </div>
    );
};
