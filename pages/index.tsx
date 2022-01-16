import React, { Suspense } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

import dynamic from "next/dynamic";
import LayerList from "../components/layerList";

const DynamicLazyComponent = dynamic(() => import("../components/mapComponent"), {
    suspense: true,
});

const Home: NextPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.map1}>
                <Suspense fallback={`loading`}>
                    <DynamicLazyComponent id="map1" />
                </Suspense>
                <LayerList id={"map1"} />
            </div>
            <div className={styles.map2}>
                <Suspense fallback={`loading`}>
                    <DynamicLazyComponent id="map2" />
                </Suspense>
                <LayerList id={"map2"} />
            </div>
        </div>
    );
};

export default Home;
