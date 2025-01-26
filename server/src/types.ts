export enum PatientStatus {
    WAITING = 'WAITING',
    IN_APPOINTMENT = 'IN_APPOINTMENT',
    AWAITING_RESULTS = 'AWAITING_RESULTS',
    READY_FOR_DISCHARGE = 'READY_FOR_DISCHARGE',
    DISCHARGED = 'DISCHARGED'
}

export const PATIENT_STATUS_LABELS = {
    [PatientStatus.WAITING]: 'Waiting',
    [PatientStatus.IN_APPOINTMENT]: 'In Appointment',
    [PatientStatus.AWAITING_RESULTS]: 'Awaiting Results',
    [PatientStatus.READY_FOR_DISCHARGE]: 'Ready for Discharge',
    [PatientStatus.DISCHARGED]: 'Discharge'
};

export interface Patient {
    id: string;
    name: string;
    symptoms: string[];
    triageLevel: 1 | 2 | 3 | 4 | 5;
    registrationTime: Date;
    lastUpdated: Date;
    estimatedWaitTime: number; // in minutes
    status: PatientStatus;
}

export interface PatientUpdate {
    id: string;
    symptoms: string[];
}

export const PROVIDER_PASSWORD = "admin123"; // In a real app, this would be properly hashed and stored securely
