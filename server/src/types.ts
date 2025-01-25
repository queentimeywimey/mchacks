export interface Patient {
    id: string;
    name: string;
    symptoms: string[];
    triageLevel: 1 | 2 | 3 | 4 | 5;
    registrationTime: Date;
    lastUpdated: Date;
    estimatedWaitTime: number; // in minutes
}

export interface PatientUpdate {
    id: string;
    symptoms: string[];
}

export const PROVIDER_PASSWORD = "admin123"; // In a real app, this would be properly hashed and stored securely

export const TRIAGE_WAIT_TIMES = {
    1: 0,      // Immediate
    2: 10,     // Emergent
    3: 30,     // Urgent
    4: 60,     // Less Urgent
    5: 120     // Non-Urgent
};
