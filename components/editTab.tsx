import { ReactElement } from "react";
import { useMap } from "../lib/useMap";
import styles from "../styles/Home.module.css";

export default function EditTab({ id }: { id: string }): ReactElement {
    const { undo, redo } = useMap(id);

    return (
        <div>
            <button className={styles.listItem} onClick={() => undo}>
                Undo
            </button>
            <button className={styles.listItem} onClick={() => redo}>
                Redo
            </button>
        </div>
    );
}
