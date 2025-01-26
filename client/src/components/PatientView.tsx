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
    HStack,
    Progress
    Step,
    StepDescription,
    StepIcon,
    StepIndicator,
    StepNumber,
    StepSeparator,
    StepStatus,
    StepTitle,
    Stepper,
    useSteps,
} from '@chakra-ui/react';

import { useSocket } from '../contexts/SocketContext';
import { Patient, TRIAGE_LEVELS, PATIENT_STATUS_LABELS } from '../types';
const four_steps = [
    { title: 'Registration and Triage', description: 'Get registered into the management system and get assigned a triage.' },
    { title: 'The First Wait', description: 'Wait to be seen by a doctor.' },
    { title: 'Initial Assessment', description: 'Get examined by a doctor.' },
    { title: 'Treatment & Next Steps', description: 'A treatment plan is drawn up you are either treated and discharged, or admitted into hospital' },
  ]
const five_steps = [
    { title: 'Registration and Triage', description: 'Get registered into the management system and get assigned a triage.' },
    { title: 'The First Wait', description: 'Wait to be seen by a doctor.' },
    { title: 'Initial Assessment', description: 'Get examined by a doctor, who may order tests.' },
    { title: 'Investigation', description: 'Await lab results to arrive.' },
    { title: 'Review & Next Steps', description: 'Lab results are reviewed and you are either treated and discharged, or admitted into hospital' },
  ]


export const PatientView: React.FC = () => {
    const { getPatient, updateSymptoms } = useSocket();
    const [patientId, setPatientId] = useState('');
    const [patient, setPatient] = useState<Patient | null>(null);
    const [newSymptoms, setNewSymptoms] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();
    const { activeStep } = useSteps({
        index: 1,
        count: four_steps.length,
      })

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
                    <HStack spacing={4}>
                        <Progress hasStripe value={50} mb={2}
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
                    }/>
                    <Badge
                            colorScheme={
                                patient.triageLevel <= 2
                                    ? 'red'
                                    : patient.triageLevel === 3
                                    ? 'yellow'
                                    : 'green'
                            }
                            fontSize="md"
                            p={2}
                            textTransform="none"
                        >
                            Triage Level: {patient.triageLevel} - {TRIAGE_LEVELS[patient.triageLevel]}
                        </Badge>
                        <Badge
                            colorScheme="purple"
                            fontSize="md"
                            p={2}
                            textTransform="none"
                        >
                            Status: {PATIENT_STATUS_LABELS[patient.status]}
                        </Badge>
                    </HStack>
                </Box>

                <Box>
                    <Text fontSize="xl" mb={2}>Estimated Wait Time</Text>
                    <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                        {patient.estimatedWaitTime} minutes
                    </Text>
                </Box>

                <Box>
                <Stepper index={activeStep} orientation='vertical' height='400px' gap='0'>
                    {four_steps.map((step, index) => (
                        <Step key={index}>
                        <StepIndicator>
                            <StepStatus
                            complete={<StepIcon />}
                            incomplete={<StepNumber />}
                            active={<StepNumber />}
                            />
                        </StepIndicator>

                        <Box flexShrink='0'>
                            <StepTitle>{step.title}</StepTitle>
                            <StepDescription>{step.description}</StepDescription>
                        </Box>

                        <StepSeparator />
                        </Step>
                    ))}
                </Stepper>
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
                        Your Patient ID: {patient.id}
                    </Text>
                </Box>
            </Stack>
        </Box>
    );
};
