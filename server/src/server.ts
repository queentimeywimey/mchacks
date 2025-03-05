import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Patient, PatientUpdate, PROVIDER_PASSWORD, PatientStatus } from './types';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "https://mchacks-rho.vercel.app/",
        methods: ["GET", "POST"]
    }
});

const API_URL = process.env.REACT_APP_API_URL;
console.log(API_URL);
console.log("yahoo");

fetch(`${API_URL}/api/data`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error fetching data:', error));

app.use(cors({ origin: "https://mchacks-rho.vercel.app/" }));
app.use(express.json());

// In-memory storage
const patients: Patient[] = [];
var betweenTime = 5;

// Update wait times for all patients
const updateWaitTimes = () => {
    const waitingPatients = patients.filter(p => p.status === PatientStatus.WAITING);
    for(var i = 0; i < waitingPatients.length; i++){
        waitingPatients[i].estimatedWaitTime = i * betweenTime;
    }
};

const updateQueue = (p: Patient) => {
    if (p.status !== PatientStatus.WAITING) {
        patients.push(p);
        return;
    }

    for(var i = 0; i < patients.length; i++){
        if (patients[i].status !== PatientStatus.WAITING || p.triageLevel < patients[i].triageLevel){
            patients.splice(i, 0, p);
            return;
        }
    }
    patients.push(p);
};

// Socket.IO connection handling
io.on('connection', (socket: any) => {
    console.log('Client connected');

    // Provider authentication
    socket.on('provider-auth', (password: string, callback: (response: { success: boolean }) => void) => {
        const isAuthenticated = password === PROVIDER_PASSWORD;
        callback({ success: isAuthenticated });
    });

    // Add new patient (provider only)
    socket.on('add-patient', (data: { name: string; symptoms: string[]; triageLevel: 1 | 2 | 3 | 4 | 5 }, callback: (response: { success: boolean, patientId: string }) => void) => {
        const newPatient: Patient = {
            id: uuidv4(),
            name: data.name,
            symptoms: data.symptoms,
            triageLevel: data.triageLevel,
            registrationTime: new Date(),
            lastUpdated: new Date(),
            estimatedWaitTime: -1,
            status: PatientStatus.WAITING
        };
        
        updateQueue(newPatient);
        updateWaitTimes();
        io.emit('patients-updated', patients);
        callback({ success: true, patientId: newPatient.id });
    });

    // Update patient status
    socket.on('update-status', (data: { patientId: string, status: PatientStatus }) => {
        const patient = patients.find(p => p.id === data.patientId);
        if (patient) {
            const index = patients.findIndex(p => p.id === data.patientId);
            if (data.status === PatientStatus.DISCHARGED) {
                patients.splice(index, 1);
                updateWaitTimes();
                io.emit('patients-updated', patients);
            } else
            if (index !== -1) {
                patient.status = data.status;
                updateWaitTimes()
                patient.lastUpdated = new Date();
                io.emit('patients-updated', patients);
            }
        }
    });

    // Update patient triage level
    socket.on('update-triage-level', (data: { patientId: string, triageLevel: 1 | 2 | 3 | 4 | 5 }) => {
        const patient = patients.find(p => p.id === data.patientId);
        if (patient) {
            const index = patients.findIndex(p => p.id === data.patientId);
            if (index !== -1) {
                patients.splice(index, 1);
                patient.triageLevel = data.triageLevel;
                patient.lastUpdated = new Date();
                updateQueue(patient);
                updateWaitTimes();
                io.emit('patients-updated', patients);
            }
        }
    });

    // Update patient symptoms
    socket.on('update-symptoms', (data: PatientUpdate) => {
        const patient = patients.find(p => p.id === data.id);
        if (patient) {
            patient.symptoms = data.symptoms;
            patient.lastUpdated = new Date();
            io.emit('patients-updated', patients);
            io.emit('symptoms-updated', { patientId: data.id, symptoms: data.symptoms });
        }
    });


    // Get patient info
    socket.on('get-patient', (patientId: string, callback: (patient: Patient | null) => void) => {
        const patient = patients.find(p => p.id === patientId);
        callback(patient || null);
    });

    socket.on('update-wait-times', (input: string) => {
        const parsed = parseInt(input, 10);
        if (isNaN(parsed)) return;
        else {
            betweenTime = parsed;
            updateWaitTimes();
            io.emit('patients-updated', patients);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
