import axios from "axios";
import { useEffect, useState } from "react";

export const useDriver = () => {
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchDrivers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/drivers', {
                withCredentials: true
            });
            const data = res.data;
            console.log(data);
            setDrivers(data);
        } catch (error: any) {
            setError(error);
            console.error('Error fetching drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers();
    }, []);

    const addDriver = async (data: any) => {
        try {
            await axios.post('/api/drivers', data,{
                withCredentials: true
            });
            await fetchDrivers();
        } catch (error: any) {
            console.error('Error adding driver:', error);
        }
    };

    return { drivers, loading, error, addDriver };
}