import { ReactElement, useEffect, useState } from "react";
import { serialHandler } from "../lib/serialHandler";
export default function ConnectSerial({ prop }: { prop?: any }): ReactElement {
    const [connected, setConnected] = useState(false);
    const openSerialPort = async () => {
        await serialHandler.init();
        setConnected(true);
    };
    useEffect(() => {
        console.log("connected", connected);
        if (!connected) return;
        async function Read() {
            serialHandler.read();
        }
        Read();
    }, [connected]);
    return (
        <div>
            <button onClick={() => openSerialPort()}> Open Serial Port </button>
            <button onClick={() => serialHandler.disconnect()}>close </button>
        </div>
    );
}
