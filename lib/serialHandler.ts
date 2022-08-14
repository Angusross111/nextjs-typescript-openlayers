class SerialHandler {
    reader: ReadableStreamDefaultReader;
    writer: WritableStreamDefaultWriter;
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    port: any;

    /**
     * Triggers the menu where the user will pick a device (it requires an user interaction to be triggered).
     * Opens the port selected by the user in the UI using a defined `baudRate`; this example uses a hard-coded value of 9600.
     * After opening the port, a `writer` and a `reader` are set; they will be used by the `write` and `read` methods respectively.
     */
    async init() {
        if ("serial" in navigator) {
            try {
                const port = await (navigator as any).serial.requestPort();
                await port.open({ baudRate: 115200 });
                this.port = port;
            } catch (err) {
                console.error(
                    "There was an error opening the serial port:",
                    err
                );
            }
        } else {
            console.error(
                "Web serial doesn't seem to be enabled in your browser. Check https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API#browser_compatibility for more info."
            );
        }
    }

    /**
     * Gets data from the `reader`, decodes it and returns it inside a promise.
     * @returns A promise containing either the message from the `reader` or an error.
     */
    async read() {
        while (this.port.readable) {
            this.reader = this.port.readable.getReader();
            while (true) {
                let value, done;
                try {
                    ({ value, done } = await this.reader.read());
                } catch (error) {
                    // Handle |error|...
                    this.reader.releaseLock();
                    break;
                }
                if (done) {
                    // |reader| has been canceled.
                    this.reader.releaseLock();
                    break;
                }
                console.log(this.decoder.decode(value));
            }
            this.reader.releaseLock();
        }
        await this.port.close();
    }

    async disconnect() {
        await this.reader.cancel();
        await this.port.close();
    }
}

export const serialHandler = new SerialHandler();
