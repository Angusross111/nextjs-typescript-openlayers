import type { NextPage } from "next";
import { Suspense } from "react";
import ConnectSerial from "../components/connectSerial";
import { MapDisplay } from "../components/mapDisplay";
import styles from "../styles/Home.module.css";

const Record: NextPage = () => {
    const mapID = "map2";
    return (
        <div className={styles.container}>
            <div className={styles.map2}>
                <Suspense fallback={`loading`}>
                    <MapDisplay mapID={mapID} className={styles.mapComponent} />
                    <ConnectSerial />
                </Suspense>
            </div>
        </div>
    );
};

export default Record;
