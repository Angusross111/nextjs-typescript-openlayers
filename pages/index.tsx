import type { NextPage } from "next";
import { Suspense } from "react";
import Dropzone from "../components/dropzone";
import EditTab from "../components/editTab";
import LayerList from "../components/layerList";
import { MapDisplay } from "../components/mapDisplay";
import UtmStuff from "../components/utmStuff";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
    const mapID = "map1";
    return (
        <div className={styles.container}>
            <div className={styles.map1}>
                <Suspense fallback={`loading`}>
                    <MapDisplay mapID={mapID} />
                    <EditTab id={mapID} />
                    <Dropzone id={mapID} />
                    <UtmStuff id={mapID} />
                    <LayerList id={mapID} />
                </Suspense>
            </div>
        </div>
    );
};

export default Home;
