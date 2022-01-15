import React, { Suspense } from "react";
import type { NextPage } from "next";
import styles from "../styles/Home.module.css";

import dynamic from "next/dynamic";

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
            </div>
            <div className={styles.map2}>
                <Suspense fallback={`loading`}>
                    <DynamicLazyComponent id="map2" />
                </Suspense>
            </div>
        </div>
    );
};

export default Home;
