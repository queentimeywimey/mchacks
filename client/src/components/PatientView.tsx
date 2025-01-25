import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Stack,
    Text,
    useToast,
    VStack,
    Badge,
    Textarea,
} from '@chakra-ui/react';

import {
    StepsCompletedContent,
    StepsContent,
    StepsItem,
    StepsList,
    StepsNextTrigger,
    StepsPrevTrigger,
    StepsRoot,
  } from "./ui/steps"

import { useSocket } from '../contexts/SocketContext';
import { Patient, TRIAGE_LEVELS } from '../types';

export const PatientView: React.FC = () => {
    const { getPatient, updateSymptoms } = useSocket();
    const [patientId, setPatientId] = useState('');
    const [patient, setPatient] = useState<Patient | null>(null);
    const [newSymptoms, setNewSymptoms] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleLookup = async () => {
        setIsLoading(true);
        try {
            const result = await getPatient(patientId);
            if (result) {
                setPatient(result);
                setNewSymptoms(result.symptoms.join(', '));
            } else {
                toast({
                    title: 'Patient not found',
                    status: 'error',
                    duration: 3000,
                });
            }
        } catch (error) {
            toast({
                title: 'Error looking up patient',
                status: 'error',
                duration: 3000,
            });
        }
        setIsLoading(false);
    };

    const handleUpdateSymptoms = () => {
        if (!patient) return;

        updateSymptoms({
            id: patient.id,
            symptoms: newSymptoms.split(',').map(s => s.trim()),
        });

        toast({
            title: 'Symptoms updated successfully',
            status: 'success',
            duration: 3000,
        });
    };

    // Auto-refresh patient data every 30 seconds
    useEffect(() => {
        if (!patient) return;

        const interval = setInterval(async () => {
            const updated = await getPatient(patient.id);
            if (updated) {
                setPatient(updated);
            }
        }, 30000);

        return () => clearInterval(interval);
    }, [patient, getPatient]);

    if (!patient) {
        return (
            <Box p={4}>
                <VStack spacing={4} maxW="400px" mx="auto">
                    <Text fontSize="xl">Enter Your Patient ID</Text>
                    <FormControl>
                        <FormLabel>Patient ID</FormLabel>
                        <Input
                            value={patientId}
                            onChange={(e) => setPatientId(e.target.value)}
                            placeholder="Enter your patient ID"
                        />
                    </FormControl>
                    <Button
                        colorScheme="blue"
                        onClick={handleLookup}
                        isLoading={isLoading}
                    >
                        Look Up
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <Box p={4}>
            <Stack spacing={6} maxW="600px" mx="auto">
                <Box>
                    <Text fontSize="2xl" mb={2}>Welcome, {patient.name}</Text>
                    <Badge
                        colorScheme={
                            patient.triageLevel === 1
                                ? 'blue'
                                : patient.triageLevel === 2
                                ? 'red'
                                : patient.triageLevel === 3
                                ? 'yellow'
                                : patient.triageLevel === 4
                                ? 'green'
                                : 'gray'
                        }
                        fontSize="md"
                        p={2}
                    >
                        Triage Level: {patient.triageLevel} - {TRIAGE_LEVELS[patient.triageLevel]}
                    </Badge>
                </Box>

                <Box>
                    <Text fontSize="xl" mb={2}>Estimated Wait Time</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                        {patient.estimatedWaitTime} minutes
                    </Text>
                </Box>

                <Box>
                    <Text fontSize="xl" mb={4}>Update Your Symptoms</Text>
                    <FormControl>
                        <FormLabel>Current Symptoms</FormLabel>
                        <Textarea
                            value={newSymptoms}
                            onChange={(e) => setNewSymptoms(e.target.value)}
                            placeholder="Enter your symptoms, separated by commas"
                            rows={4}
                        />
                    </FormControl>
                    <Button
                        mt={4}
                        colorScheme="blue"
                        onClick={handleUpdateSymptoms}
                    >
                        Update Symptoms
                    </Button>
                </Box>

                <Box>
                    <Text fontSize="sm" color="gray.500">
                        Last Updated: {new Date(patient.lastUpdated).toLocaleString()}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        Patient ID: {patient.id}
                    </Text>
                </Box>
            </Stack>
        </Box>
    );
};
