import { ReactElement, useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { utmConfigState } from "../lib/recoil";
export default function UtmStuff({ id }: { id: string }): ReactElement {
    const [utmConfig, setUtmConfig] = useRecoilState(utmConfigState(id));
    return (
        <div>
            <input
                type="text"
                name="utm Zone"
                value={utmConfig.zone}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    setUtmConfig((prev) => ({
                        ...prev,
                        zone: event.target.value,
                    }))
                }
            />
            <select
                value={utmConfig.hemisphere}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                    setUtmConfig((prev) => ({
                        ...prev,
                        hemisphere: event.target.value as "south" | "north",
                    }))
                }
            >
                <option value="north">north</option>
                <option value="south">south</option>
            </select>
        </div>
    );
}
