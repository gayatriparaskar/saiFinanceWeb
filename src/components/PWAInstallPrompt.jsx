import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  HStack, 
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    // Check if app is already installed
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      // Check for iOS
      if (window.navigator.standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // For iOS, show manual install instructions
      onOpen();
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Store dismissal in localStorage to avoid showing again immediately
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{
              position: 'fixed',
              bottom: '20px',
              left: '20px',
              right: '20px',
              zIndex: 1000
            }}
          >
            <Box
              bg="white"
              borderRadius="lg"
              boxShadow="2xl"
              p={4}
              border="1px solid"
              borderColor="gray.200"
            >
              <VStack spacing={3} align="stretch">
                <HStack spacing={3}>
                  <Box
                    w={12}
                    h={12}
                    bg="blue.500"
                    borderRadius="lg"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="xl" color="white">📱</Text>
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold" fontSize="md">
                      Install Sai Finance
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      Get quick access to your financial dashboard
                    </Text>
                  </VStack>
                </HStack>
                
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={handleInstallClick}
                    flex={1}
                  >
                    Install App
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDismiss}
                  >
                    Not Now
                  </Button>
                </HStack>
              </VStack>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Install Instructions Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Install Sai Finance on iOS</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                To install this app on your iOS device:
              </Text>
              
              <VStack spacing={3} align="stretch">
                <HStack spacing={3}>
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    1
                  </Box>
                  <Text fontSize="sm">
                    Tap the Share button at the bottom of your screen
                  </Text>
                </HStack>
                
                <HStack spacing={3}>
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    2
                  </Box>
                  <Text fontSize="sm">
                    Scroll down and tap "Add to Home Screen"
                  </Text>
                </HStack>
                
                <HStack spacing={3}>
                  <Box
                    w={8}
                    h={8}
                    bg="blue.500"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    3
                  </Box>
                  <Text fontSize="sm">
                    Tap "Add" to confirm installation
                  </Text>
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Got it!
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default PWAInstallPrompt;
