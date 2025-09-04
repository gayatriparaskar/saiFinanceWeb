import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { 
  Box, 
  Flex, 
  Text, 
  Button, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem,
  Avatar,
  Badge,
  HStack,
  VStack,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton
} from "@chakra-ui/react";
import { 
  IoMdLogOut
} from "react-icons/io";
import { 
  FiMenu,
  FiHome,
  FiUsers
} from "react-icons/fi";
import { motion } from "framer-motion";
import Logo from "../../../Images/Sai-finance-logo.png";

const OfficerNavbar = () => {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'accounter':
        return 'Accounter';
      case 'collection_officer':
        return 'Collection Officer';
      default:
        return 'Officer';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'manager':
        return 'blue';
      case 'accounter':
        return 'green';
      case 'collection_officer':
        return 'purple';
      default:
        return 'gray';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Box
        bg="white"
        shadow="sm"
        borderBottom="1px solid"
        borderColor="gray.200"
        px={{ base: 3, sm: 4, md: 6 }}
        py={{ base: 2, md: 4 }}
        position="sticky"
        top={0}
        zIndex={1000}
      >
        <Flex justify="space-between" align="center" minH={{ base: "50px", md: "60px" }}>
          {/* Logo and Title */}
          <HStack spacing={{ base: 2, sm: 3, md: 4 }} flex="1">
            <img
              src={Logo}
              alt="Sai Finance"
              style={{ 
                width: '32px', 
                height: '32px', 
                objectFit: 'contain'
              }}
            />
            <VStack align="start" spacing={0} display={{ base: "none", sm: "flex" }}>
              <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold" color="gray.800">
                Sai Finance
              </Text>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
                Collection Officer Dashboard
              </Text>
            </VStack>
            <Text 
              fontSize="sm" 
              fontWeight="bold" 
              color="gray.800"
              display={{ base: "block", sm: "none" }}
            >
              Sai Finance
            </Text>
          </HStack>

          {/* Desktop Navigation Menu */}
          <HStack 
            spacing={{ base: 2, md: 4, lg: 6 }} 
            display={{ base: "none", lg: "flex" }}
            flex="2"
            justify="center"
          >
            <Button
              variant="ghost"
              leftIcon={<FiHome />}
              onClick={() => navigate('/officer/dashboard')}
              colorScheme="blue"
              size={{ base: "sm", md: "md" }}
            >
              Dashboard
            </Button>
            
            {userRole === 'admin' && (
              <Button
                variant="ghost"
                leftIcon={<FiUsers />}
                onClick={() => navigate('/admin/officers')}
                colorScheme="blue"
                size={{ base: "sm", md: "md" }}
              >
                Officers
              </Button>
            )}
          </HStack>

          {/* User Menu and Mobile Button */}
          <HStack spacing={{ base: 2, sm: 3, md: 4 }} flex="1" justify="flex-end">
            {/* Role Badge - Hidden on very small screens */}
            <Badge
              colorScheme={getRoleColor(userRole)}
              fontSize={{ base: "xs", sm: "sm" }}
              px={{ base: 2, sm: 3 }}
              py={1}
              borderRadius="full"
              display={{ base: "none", sm: "flex" }}
            >
              {getRoleDisplayName(userRole)}
            </Badge>

            {/* User Profile Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size={{ base: "sm", md: "md" }}
                minW="auto"
              >
                <HStack spacing={2}>
                  <Avatar 
                    size={{ base: "xs", sm: "sm" }} 
                    name={user?.name}
                    src={user?.profile_image}
                  />
                  <VStack 
                    align="start" 
                    spacing={0}
                    display={{ base: "none", md: "flex" }}
                  >
                    <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                      {user?.name || 'Officer'}
                    </Text>
                    <Text fontSize="xs" color="gray.500" noOfLines={1}>
                      {user?.officer_code || 'N/A'}
                    </Text>
                  </VStack>
                  <Text 
                    fontSize="xs" 
                    fontWeight="semibold"
                    display={{ base: "block", md: "none" }}
                    noOfLines={1}
                    maxW="60px"
                  >
                    {user?.name?.split(' ')[0] || 'Officer'}
                  </Text>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem 
                  icon={<IoMdLogOut />} 
                  onClick={handleLogout}
                  color="red.500"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>

            {/* Mobile/Tablet Menu Button */}
            <IconButton
              display={{ base: "flex", lg: "none" }}
              variant="ghost"
              onClick={onOpen}
              icon={<FiMenu />}
              size={{ base: "sm", md: "md" }}
              aria-label="Open menu"
            />
          </HStack>
        </Flex>

        {/* Mobile/Tablet Drawer */}
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">
              <HStack spacing={3}>
                <img
                  src={Logo}
                  alt="Sai Finance"
                  style={{ width: '32px', height: '32px', objectFit: 'contain' }}
                />
                <VStack align="start" spacing={0}>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Sai Finance
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    Collection Officer Dashboard
                  </Text>
                </VStack>
              </HStack>
            </DrawerHeader>

            <DrawerBody p={0}>
              <VStack spacing={0} align="stretch">
                {/* User Info Section */}
                <Box p={4} bg="gray.50" borderBottom="1px" borderColor="gray.200">
                  <HStack spacing={3}>
                    <Avatar 
                      size="md" 
                      name={user?.name}
                      src={user?.profile_image}
                    />
                    <VStack align="start" spacing={1}>
                      <Text fontSize="md" fontWeight="semibold">
                        {user?.name || 'Officer'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {user?.officer_code || 'N/A'}
                      </Text>
                      <Badge
                        colorScheme={getRoleColor(userRole)}
                        fontSize="xs"
                        px={2}
                        py={1}
                        borderRadius="full"
                      >
                        {getRoleDisplayName(userRole)}
                      </Badge>
                    </VStack>
                  </HStack>
                </Box>

                {/* Navigation Menu */}
                <VStack spacing={0} align="stretch" p={2}>
                  <Button
                    variant="ghost"
                    leftIcon={<FiHome />}
                    onClick={() => {
                      navigate('/officer/dashboard');
                      onClose();
                    }}
                    w="full"
                    justifyContent="flex-start"
                    size="lg"
                    borderRadius="md"
                  >
                    Dashboard
                  </Button>
                  
                  {userRole === 'admin' && (
                    <Button
                      variant="ghost"
                      leftIcon={<FiUsers />}
                      onClick={() => {
                        navigate('/admin/officers');
                        onClose();
                      }}
                      w="full"
                      justifyContent="flex-start"
                      size="lg"
                      borderRadius="md"
                    >
                      Officers
                    </Button>
                  )}
                </VStack>

                {/* Logout Button */}
                <Box p={4} borderTop="1px" borderColor="gray.200">
                  <Button
                    variant="outline"
                    leftIcon={<IoMdLogOut />}
                    onClick={() => {
                      handleLogout();
                      onClose();
                    }}
                    w="full"
                    colorScheme="red"
                    size="lg"
                  >
                    Logout
                  </Button>
                </Box>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    </motion.div>
  );
};

export default OfficerNavbar;
