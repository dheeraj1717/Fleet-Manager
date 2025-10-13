"use client";
import axios from "axios";
import { useEffect, useState } from "react";

export type Client = {
    id: number;
    name: string;
    email: string;
    contactNo: string;
    company: string;
    address: string;
}

export const useClient = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchClients = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get('/api/client', {
                withCredentials: true
            });
            const data = res.data;
            console.log(data);
            setClients(data);
        } catch (error: any) {
            setError(error);
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, []);

    const addClient = async (data: Omit<Client, 'id'>) => {
        try {
            await axios.post('/api/client', data, {
                withCredentials: true
            });
            await fetchClients();
        } catch (error) {
            console.error('Error adding client:', error);
            throw error;
        }
    };

    const deleteClient = async (id: number) => {
        try {
            await axios.delete(`/api/client?id=${id}`, {
                withCredentials: true
            });
            await fetchClients();
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    };

    return { clients, loading, error, addClient, deleteClient, fetchClients };
}