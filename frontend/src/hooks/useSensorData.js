import { useState, useEffect } from 'react';
import { getLatest } from '../api/sensor';
export function useSensorData() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        getLatest().then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
    }, []);
    return { data, loading };
}
