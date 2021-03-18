import React, { useCallback, useEffect, useState } from "react";
import { HistoryItem } from "./types";
import { prettify } from "./utils";

const DGQL_HISTORY_LOCAL_STORAGE_KEY = "dgql-history";

// @ts-ignore
export const Context = React.createContext<Context>({});
export interface Context {
    addHistoryItem: (t: HistoryItem) => void;
    history: HistoryItem[];
}

export function Provider(props: React.Props<any>) {
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        setHistory(
            JSON.parse(
                localStorage.getItem(DGQL_HISTORY_LOCAL_STORAGE_KEY) || "[]"
            ) as HistoryItem[]
        );
    }, []);

    const addHistoryItem = useCallback((historyItem: HistoryItem) => {
        historyItem.createdAt = new Date().toISOString();
        historyItem.dgql = prettify(historyItem.dgql);

        const realValue = JSON.parse(
            localStorage.getItem(DGQL_HISTORY_LOCAL_STORAGE_KEY) || "[]"
        ) as HistoryItem[];

        const newValue = [...realValue.slice(0, 9), historyItem];

        localStorage.setItem(
            DGQL_HISTORY_LOCAL_STORAGE_KEY,
            JSON.stringify(newValue)
        );

        setHistory(newValue);
    }, []);

    return (
        <Context.Provider value={{ addHistoryItem, history } as Context}>
            {props.children}
        </Context.Provider>
    );
}
