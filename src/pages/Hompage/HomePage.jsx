import React, { useEffect, useState } from "react";
import {
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import axios from "../../axios";
import UserLogo from "../../Images/60111.jpg";
import bgImage from "../../Images/homepagebg.jpg";
import dayjs from "dayjs";

const HomePage = () => {
  const toast = useToast();

  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [collected_officer_code, setPin] = useState("");
  const [profile, setProfile] = useState([]);
  const [addPenaltyFlag, setPenalty] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("/users/profile");
        setProfile(response?.data?.result);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchProfile();
  }, []);

  const openAmountModal = () => {
    setIsAmountModalOpen(true);
  };

  const openPenaltyModal = () => {
    setIsPenaltyModalOpen(true);
  };

  const handleAmountSubmit = async (e) => {
    e.preventDefault();
    setIsAmountModalOpen(false);
    setIsPenaltyModalOpen(false);

    let obj = { amount, collected_officer_code };

    try {
      const response = await axios.post("/dailyCollections", obj);
      if (response.data) {
        toast({
          title: "Success! Amount Added successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Something Went Wrong!",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handlePenaltySubmit = async (e) => {
    e.preventDefault();
    setIsAmountModalOpen(false);
    setIsPenaltyModalOpen(false);

    const obj = { collected_officer_code, addPenaltyFlag };

    try {
      const response = await axios.post("/dailyCollections", obj);
      if (response.data) {
        toast({
          title: "Success! Penalty Added successfully",
          status: "success",
          duration: 4000,
          isClosable: true,
          position: "top",
        });
        window.location.reload();
      }
    } catch (error) {
      toast({
        title: "Something Went Wrong!",
        status: "error",
        duration: 4000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
      }}
      className="h-screen opacity-90 flex flex-col items-center justify-center space-y-6"
    >
      {/* Main Card Section */}

      <div
  style={{
    backgroundImage: `url(${bgImage})`,
    backgroundSize: "cover",
  }}
  className="h-screen opacity-90 flex flex-col items-center justify-center space-y-2"
>
  {/* Main Card Section */}
  <div className="bg-white/30 h-auto md:h-[70%] w-11/12 md:w-3/4 lg:w-1/2 mt-24 rounded-xl shadow-lg border border-gray-200 p-6">
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col items-center justify-center w-full h-full">
        
        <img
          src={UserLogo}
          alt="user"
          className="w-4/12 h-6/12 md:w-4/12 md:h-4/12 rounded-full m-auto"
        />
        <p className="mt-6 font-bold text-xl m-auto text-center">
          {profile?.full_name}
        </p>
      </div>

      <div className="border-gray-300 border-spacing-2">
        <div className="text-xl space-y-2 p-6">
          <p className="flex justify-between text-start ">
            <strong>Date:</strong> <span className="font-semibold">{dayjs(profile?.created_on).format("D MMM, YYYY h:mm A")}</span>
          </p>
          <p className="flex justify-between text-start ">
            <strong>Mobile:</strong> <span className="font-semibold">{profile?.phone_number}</span>
          </p>
          <p className="flex justify-between text-start ">
            <strong>Loan:</strong> <span className="font-semibold">₹{profile?.active_loan_id?.loan_amount}</span> 
          </p>
          <p className="flex justify-between text-start ">
            <strong>EMI:</strong> <span className="font-semibold">₹{profile?.active_loan_id?.emi_day}</span> 
          </p>
          <p className="flex justify-between text-start ">
            <strong>Total Paid:</strong> <span className="font-semibold"> ₹{profile?.active_loan_id?.total_amount}</span>
          </p>
          <p className="flex justify-between text-start ">
            <strong>Total Due:</strong> <span className="font-semibold">₹{profile?.active_loan_id?.total_due_amount}</span> 
          </p>
          <p className="flex justify-between text-start ">
            <strong>Penalty:</strong> <span className="font-semibold"> ₹{profile?.active_loan_id?.total_penalty_amount}</span>
          </p>
        </div>
      </div>
    </div>
    
    {/* Action Buttons */}
    <div className="flex flex-col sm:flex-row justify-center sm:justify-around mx-auto w-full gap-4">
      {/* Add Amount Button */}
      <button
        onClick={openAmountModal}
        className="bg-green-500 text-white py-5 w-full sm:w-[45%] text-xl rounded-lg"
      >
        Add Amount
      </button>

      {/* Add Penalty Button */}
      <button
        onClick={openPenaltyModal}
        className="bg-red-500 text-white py-5 w-full sm:w-[45%] text-xl rounded-lg"
      >
        Add Penalty
      </button>
    </div>
  </div>
</div>


      {/* Modal for Amount Details */}
      <Modal
        isOpen={isAmountModalOpen}
        onClose={() => setIsAmountModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent margin="auto" w={{ base: "90%", sm: "50%" }}>
          <ModalHeader>Add Amount Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="amount" isRequired>
              <FormLabel>Amount</FormLabel>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter Amount"
              />
            </FormControl>
            <FormControl id="pin" isRequired>
              <FormLabel>Officer PIN</FormLabel>
              <Input
                type="text"
                value={collected_officer_code}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Officer PIN"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter display={"flex"} gap={"10px"}>
            <Button
              onClick={() => setIsAmountModalOpen(false)}
              colorScheme="red"
            >
              Cancel
            </Button>
            <Button onClick={handleAmountSubmit} colorScheme="green">
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal for Penalty Details */}
      <Modal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent margin="auto" w={{ base: "90%", sm: "50%" }}>
          <ModalHeader>Add Penalty Details </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="pin" isRequired>
              <FormLabel>Officer PIN</FormLabel>
              <Input
                type="text"
                value={collected_officer_code}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter Officer PIN"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter display={"flex"} gap={"10px"}>
            <Button
              onClick={() => setIsPenaltyModalOpen(false)}
              colorScheme="red"
            >
              Cancel
            </Button>
            <Button onClick={handlePenaltySubmit} colorScheme="green">
              OK
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default HomePage;
