import React, { useState } from 'react';
import { ChakraProvider, Box, Button, Flex, Heading } from '@chakra-ui/react';
import { SocketProvider } from './contexts/SocketContext';
import { ProviderView } from './components/ProviderView';
import { PatientView } from './components/PatientView';

function App() {
  const [view, setView] = useState<'patient' | 'provider'>('patient');

  return (
    <ChakraProvider>
      <SocketProvider>
        <Box minH="100vh" bg="gray.50">
          <Box bg="blue.500" color="white" p={4} shadow="md">
            <Flex maxW="1200px" mx="auto" justify="space-between" align="center">
              <Heading size="lg">Hospital Waiting Room</Heading>
              <Flex gap={4}>
                <Button
                  colorScheme={view === 'patient' ? 'whiteAlpha' : 'blue'}
                  variant={view === 'patient' ? 'solid' : 'outline'}
                  onClick={() => setView('patient')}
                >
                  Patient View
                </Button>
                <Button
                  colorScheme={view === 'provider' ? 'whiteAlpha' : 'blue'}
                  variant={view === 'provider' ? 'solid' : 'outline'}
                  onClick={() => setView('provider')}
                >
                  Provider View
                </Button>
              </Flex>
            </Flex>
          </Box>

          <Box maxW="1200px" mx="auto" py={8}>
            {view === 'provider' ? <ProviderView /> : <PatientView />}
          </Box>
        </Box>
      </SocketProvider>
    </ChakraProvider>
  );
}

export default App;
