import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Select,
    Stack,
    Text,
    useToast,
    VStack,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Grid,
    GridItem,
    Editable,
    EditableInput,
    EditableTextarea,
    EditablePreview,
} from '@chakra-ui/react';
import { useSocket } from '../contexts/SocketContext';
import { TRIAGE_LEVELS, TriageLevel } from '../types';

export const ProviderView: React.FC = () => {
    const {
        isProvider,
        authenticateProvider,
        addPatient,
        removePatient,
        updateTriageLevel,
        patients
    } = useSocket();

    const [password, setPassword] = useState('');
    const [newPatient, setNewPatient] = useState({
        name: '',
        symptoms: '',
        triageLevel: '3' as unknown as TriageLevel,
    });

    const toast = useToast();

    const handleLogin = async () => {
        const success = await authenticateProvider(password);
        if (!success) {
            toast({
                title: 'Authentication failed',
                status: 'error',
                duration: 3000,
            });
        }
    };

    const handleAddPatient = async () => {
        try {
            await addPatient(
                newPatient.name,
                newPatient.symptoms.split(',').map(s => s.trim()),
                Number(newPatient.triageLevel) as 1 | 2 | 3 | 4 | 5
            );
            setNewPatient({
                name: '',
                symptoms: '',
                triageLevel: '3' as unknown as TriageLevel,
            });
            toast({
                title: 'Patient added successfully',
                status: 'success',
                duration: 3000,
            });
        } catch (error) {
            toast({
                title: 'Error adding patient',
                status: 'error',
                duration: 3000,
            });
        }
    };

    if (!isProvider) {
        return (
            <Box p={4}>
                <VStack spacing={4} maxW="400px" mx="auto">
                    <Text fontSize="xl">Provider Login</Text>
                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </FormControl>
                    <Button colorScheme="blue" onClick={handleLogin}>
                        Login
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <Box p={4} m={2}>
            <Box>
            <Grid
                h='390px'
                templateRows='repeat(2, 1fr)'
                templateColumns='repeat(20, 1fr)'
                gap={4}
                >
                <GridItem colStart={1} colEnd={12} >
                    <Stack spacing={6}>
                        <Box>
                            <Text fontSize="2xl" mb={3}>Add New Patient</Text>
                            <Stack spacing={4} maxW="600px" m={2}>
                                <FormControl>
                                    <FormLabel>Patient Name</FormLabel>
                                    <Input
                                        value={newPatient.name}
                                        onChange={(e) =>
                                            setNewPatient({ ...newPatient, name: e.target.value })
                                        }
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Symptoms (comma-separated)</FormLabel>
                                    <Input
                                        value={newPatient.symptoms}
                                        onChange={(e) =>
                                            setNewPatient({ ...newPatient, symptoms: e.target.value })
                                        }
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Triage Level</FormLabel>
                                    <Select
                                        value={newPatient.triageLevel}
                                        onChange={(e) =>
                                            setNewPatient({
                                                ...newPatient,
                                                triageLevel: e.target.value as unknown as TriageLevel,
                                            })
                                        }
                                    >
                                        {Object.entries(TRIAGE_LEVELS).map(([level, description]) => (
                                            <option key={level} value={level}>
                                                {level} - {description}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button colorScheme="blue" onClick={handleAddPatient}>
                                    Add Patient
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </GridItem>


                <GridItem colStart={12} colEnd={21}>
                    <Stack spacing={6}>
                        <Box>
                            <Text fontSize="2xl" mb={3}>Report Average Waiting Time</Text>
                            <Editable defaultValue='hi' mb={3}>
                            <EditablePreview />
                            <EditableInput />
                            </Editable>
                        </Box>
                    </Stack>
                </GridItem>



                </Grid>
            </Box>
                
                <Box>
                    <Text fontSize="2xl" mb={4}>Current Patients</Text>
                    <Table variant="simple">
                        <Thead>
                            <Tr>
                                <Th>Name</Th>
                                <Th>Triage Level</Th>
                                <Th>Symptoms</Th>
                                <Th>Wait Time</Th>
                                <Th>Actions</Th>
                                <Th>ID</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {patients
                                .sort((a, b) => a.triageLevel - b.triageLevel)
                                .map((patient) => (
                                    <Tr key={patient.id}>
                                        <Td>{patient.name}</Td>
                                        <Td>
                                            <Select
                                                value={patient.triageLevel}
                                                onChange={(e) => updateTriageLevel(patient.id, Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                                                variant="filled"
                                                colorScheme = {patient.triageLevel === 1
                                                                    ? 'blue.100'
                                                                    : patient.triageLevel === 2
                                                                    ? 'red.100'
                                                                    : patient.triageLevel === 3
                                                                    ? 'yellow.100'
                                                                    : patient.triageLevel === 4
                                                                    ? 'green.100'
                                                                    : 'gray.100'}
                                                bg={
                                                    patient.triageLevel === 1
                                                        ? 'blue.100'
                                                        : patient.triageLevel === 2
                                                        ? 'red.100'
                                                        : patient.triageLevel === 3
                                                        ? 'yellow.100'
                                                        : patient.triageLevel === 4
                                                        ? 'green.100'
                                                        : 'gray.100'
                                                }
                                                _hover={{
                                                    bg: patient.triageLevel === 1
                                                        ? 'blue.200'
                                                        : patient.triageLevel === 2
                                                        ? 'red.200'
                                                        : patient.triageLevel === 3
                                                        ? 'yellow.200'
                                                        : patient.triageLevel === 4
                                                        ? 'green.200'
                                                        : 'gray.200'
                                                }}
                                                size="sm"
                                                width="275px"
                                                borderRadius="md"
                                                fontWeight="bold"
                                                color = {patient.triageLevel === 1
                                                            ? 'blue.900'
                                                            : patient.triageLevel === 2
                                                            ? 'red.900'
                                                            : patient.triageLevel === 3
                                                            ? 'yellow.900'
                                                            : patient.triageLevel === 4
                                                            ? 'green.900'
                                                            : 'gray.900'}
                                            >
                                                {Object.entries(TRIAGE_LEVELS).map(([level, description]) => (
                                                    <option key={level} value={level}>
                                                        {level} - {description}
                                                    </option>
                                                ))}
                                            </Select>
                                        </Td>
                                        <Td>{patient.symptoms.join(', ')}</Td>
                                        <Td>{patient.estimatedWaitTime} mins</Td>
                                        <Td>
                                            <Button
                                                colorScheme="red"
                                                size="sm"
                                                onClick={() => removePatient(patient.id)}
                                            >
                                                Remove
                                            </Button>
                                        </Td>
                                        <Td>{patient.id}</Td>
                                    </Tr>
                                ))}
                        </Tbody>
                    </Table>
                </Box>
        </Box>
    );
};
