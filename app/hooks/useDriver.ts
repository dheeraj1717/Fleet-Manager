import axios from "axios";
import { useEffect, useState } from "react";

export type Driver = {
    id: number;
    name: string;
    address: string;
    contactNo: string;
    licenseNo: string;
    joiningDate: string;
}

export const useDriver = () => {
    const [drivers, setDrivers] = useState<Driver[]>([]);
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

    const addDriver = async (data: Driver) => {
        try {
            await axios.post('/api/drivers', data,{
                withCredentials: true
            });
            await fetchDrivers();
        } catch (error: any) {
            console.error('Error adding driver:', error);
        }
    };


    const deleteDriver = async (id: number) => {
        try {
            await axios.delete(`/api/drivers?id=${id}`, {
                withCredentials: true
            });
            await fetchDrivers();
        } catch (error: any) {
            console.error('Error deleting driver:', error);
        }
    }
    return { drivers, loading, error, addDriver, deleteDriver };
}