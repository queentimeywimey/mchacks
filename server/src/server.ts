import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { Patient, PatientUpdate, PROVIDER_PASSWORD, TRIAGE_WAIT_TIMES } from './types';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// In-memory storage
const patients: Patient[] = [];
const betweenTime = 5;

// Update wait times for all patients
const updateWaitTimes = () => {
    for(var i = 0; i < patients.length; i++){
        patients[i].estimatedWaitTime = i * betweenTime;
    }
};

const updateQueue = (p: Patient) => {
    for(var i = 0; i < patients.length; i++){
        if (p.triageLevel < patients[i].triageLevel){
            patients.splice(i, 0, p);
            return;
        }
    }
    patients.push(p)
}

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
            estimatedWaitTime: -1
        };
        
        updateQueue(newPatient);
        updateWaitTimes();
        io.emit('patients-updated', patients);
        callback({ success: true, patientId: newPatient.id });
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

    // Remove patient (provider only)
    socket.on('remove-patient', (patientId: string) => {
        const index = patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            patients.splice(index, 1);
            updateWaitTimes();
            io.emit('patients-updated', patients);
        }
    });

    // Get patient info
    socket.on('get-patient', (patientId: string, callback: (patient: Patient | null) => void) => {
        const patient = patients.find(p => p.id === patientId);
        callback(patient || null);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
