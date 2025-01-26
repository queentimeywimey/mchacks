import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Patient, PatientUpdate, PatientStatus } from '../types';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    isProvider: boolean;
    setIsProvider: (value: boolean) => void;
    authenticateProvider: (password: string) => Promise<boolean>;
    addPatient: (name: string, symptoms: string[], triageLevel: 1 | 2 | 3 | 4 | 5) => Promise<string>;
    updateSymptoms: (update: PatientUpdate) => void;
    updateTriageLevel: (patientId: string, triageLevel: 1 | 2 | 3 | 4 | 5) => void;
    updateStatus: (patientId: string, status: PatientStatus) => void;
    getPatient: (patientId: string) => Promise<Patient | null>;
    patients: Patient[];
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isProvider, setIsProvider] = useState(false);
    const [patients, setPatients] = useState<Patient[]>([]);


    useEffect(() => {
        const newSocket = io('http://localhost:3001');

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to server');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from server');
        });

        newSocket.on('patients-updated', (updatedPatients: Patient[]) => {
            setPatients(updatedPatients);
        });

        setSocket(newSocket);

        return () => {
            newSocket.close();
        };
    }, []);

    const authenticateProvider = async (password: string): Promise<boolean> => {
        if (!socket) return false;
        
        return new Promise((resolve) => {
            socket.emit('provider-auth', password, (response: { success: boolean }) => {
                setIsProvider(response.success);
                resolve(response.success);
            });
        });
    };

    const addPatient = async (
        name: string,
        symptoms: string[],
        triageLevel: 1 | 2 | 3 | 4 | 5
    ): Promise<string> => {
        if (!socket) throw new Error('Not connected');

        return new Promise((resolve) => {
            socket.emit(
                'add-patient',
                { name, symptoms, triageLevel },
                (response: { success: boolean; patientId: string }) => {
                    if (response.success) {
                        resolve(response.patientId);
                    }
                }
            );
        });
    };

    const updateSymptoms = (update: PatientUpdate) => {
        if (!socket) return;
        socket.emit('update-symptoms', update);
    };

    const getPatient = async (patientId: string): Promise<Patient | null> => {
        if (!socket) return null;

        return new Promise((resolve) => {
            socket.emit('get-patient', patientId, (patient: Patient | null) => {
                resolve(patient);
            });
        });
    };

    const updateTriageLevel = (patientId: string, triageLevel: 1 | 2 | 3 | 4 | 5) => {
        if (!socket) return;
        socket.emit('update-triage-level', { patientId, triageLevel });
    };

    const updateStatus = (patientId: string, status: PatientStatus) => {
        if (!socket) return;
        socket.emit('update-status', { patientId, status });
    };

    const value = {
        socket,
        isConnected,
        isProvider,
        setIsProvider,
        authenticateProvider,
        addPatient,
        updateSymptoms,
        updateTriageLevel,
        updateStatus,
        getPatient,
        patients
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
