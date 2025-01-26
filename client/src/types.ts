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
    [PatientStatus.DISCHARGED]: 'Discharge or Admit'
};

export interface Patient {
    id: string;
    name: string;
    symptoms: string[];
    triageLevel: 1 | 2 | 3 | 4 | 5;
    registrationTime: Date;
    lastUpdated: Date;
    estimatedWaitTime: number;
    status: PatientStatus;
}

export interface PatientUpdate {
    id: string;
    symptoms: string[];
}

export const TRIAGE_LEVELS = {
    1: "Immediate, life-threatening",
    2: "Emergent, high risk",
    3: "Urgent",
    4: "Less urgent",
    5: "Non-urgent"
} as const;

export type TriageLevel = keyof typeof TRIAGE_LEVELS;
