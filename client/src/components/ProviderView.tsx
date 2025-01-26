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
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Center,
} from '@chakra-ui/react';
import { useSocket } from '../contexts/SocketContext';
import { TRIAGE_LEVELS, TriageLevel, PatientStatus, PATIENT_STATUS_LABELS } from '../types';

export const ProviderView: React.FC = () => {
    const {
        isProvider,
        authenticateProvider,
        addPatient,
        updateTriageLevel,
        updateStatus,
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
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin();
                }}>
                    <VStack spacing={4} maxW="400px" mx="auto">
                        <Text fontSize="xl">Provider Login</Text>
                        <FormControl>
                            <FormLabel>Password</FormLabel>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoFocus
                            />
                        </FormControl>
                        <Button type="submit" colorScheme="blue">
                            Login
                        </Button>
                    </VStack>
                </form>
            </Box>
        );
    }

    const renderPatientTable = (statusFilter: PatientStatus) => (
        <Table variant="simple">
            <Thead>
                <Tr>
                    <Th>Name</Th>
                    <Th>Triage Level</Th>
                    <Th>Symptoms</Th>
                    <Th>Wait Time</Th>
                    <Th>Status</Th>
                    <Th>Patient ID</Th>
                </Tr>
            </Thead>
            <Tbody>
                {patients
                    .filter(p => p.status === statusFilter)
                    .sort((a, b) => a.triageLevel - b.triageLevel)
                    .map((patient) => (
                        <Tr key={patient.id}>
                            <Td>{patient.name}</Td>
                            <Td>
                                <Select
                                    value={patient.triageLevel}
                                    onChange={(e) => updateTriageLevel(patient.id, Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                                    variant="filled"
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
                                    width="250px"
                                    borderRadius="md"
                                    fontWeight="medium"
                                    color = {patient.triageLevel === 1
                                                ? 'blue.800'
                                                : patient.triageLevel === 2
                                                ? 'red.800'
                                                : patient.triageLevel === 3
                                                ? 'yellow.800'
                                                : patient.triageLevel === 4
                                                ? 'green.800'
                                                : 'gray.800'}
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
                                <Select
                                    value={patient.status}
                                    onChange={(e) => updateStatus(patient.id, e.target.value as PatientStatus)}
                                    variant="filled"
                                    size="sm"
                                    width="200px"
                                >
                                    {Object.entries(PATIENT_STATUS_LABELS).map(([status, label]) => (
                                        <option key={status} value={status}>
                                            {label}
                                        </option>
                                    ))}
                                </Select>
                            </Td>
                            <Td>
                                {patient.id}
                            </Td>
                        </Tr>
                    ))}
            </Tbody>
        </Table>
    );

    return (
        <Box p={4} m={2}>
            <Box>
                <Grid
                    h='390px'
                    templateRows='repeat(20, 1fr)'
                    templateColumns='repeat(20, 1fr)'
                    gap={4}
                    >
                    <GridItem colSpan={11} rowSpan={18}>
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
                            </Box>
                        </Stack>
                    </GridItem>

                    <GridItem colSpan={9} rowSpan={7}>
                    
                            <Box>
                                <Center>
                                <Text fontSize="2xl" mb={3}>Report: Average Waiting Time</Text>
                                </Center>
                                <Center>
                                <Editable fontSize="2xl" defaultValue='x minutes' mb={3}>
                                <EditablePreview>
                                    bruh
                                </EditablePreview>
                                <EditableInput />
                                </Editable>
                                </Center>
                            </Box>
                       
                    </GridItem>

                    <GridItem colStart={12} colEnd={21}>
                      
                            <Box>
                            <Center>
                                <Text fontSize="2xl" mb={3}>Total Number of Patients</Text>
                                </Center>
                            <Center>
                                <Text fontSize="2xl" mb={3}>{patients.length}</Text>
                                </Center>
                            </Box>
                   
                    </GridItem>

                </Grid>
            </Box>                       

                <Box>
                    <Text fontSize="2xl" mb={4}>Current Patients</Text>
                    <Tabs>
                        <TabList>
                            <Tab>Waiting ({patients.filter(p => p.status === PatientStatus.WAITING).length})</Tab>
                            <Tab>In Appointment ({patients.filter(p => p.status === PatientStatus.IN_APPOINTMENT).length})</Tab>
                            <Tab>Awaiting Results ({patients.filter(p => p.status === PatientStatus.AWAITING_RESULTS).length})</Tab>
                            <Tab>Ready for Discharge ({patients.filter(p => p.status === PatientStatus.READY_FOR_DISCHARGE).length})</Tab>
                        </TabList>

                        <TabPanels>
                            <TabPanel>
                                {renderPatientTable(PatientStatus.WAITING)}
                            </TabPanel>
                            <TabPanel>
                                {renderPatientTable(PatientStatus.IN_APPOINTMENT)}
                            </TabPanel>
                            <TabPanel>
                                {renderPatientTable(PatientStatus.AWAITING_RESULTS)}
                            </TabPanel>
                            <TabPanel>
                                {renderPatientTable(PatientStatus.READY_FOR_DISCHARGE)}
                            </TabPanel>
                        </TabPanels>
                    </Tabs>
                </Box>
            </Stack>
            </Box>
    
    );
};
