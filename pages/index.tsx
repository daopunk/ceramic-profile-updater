import { useState, useEffect } from 'react';
import { Text, Button, Input, Select } from '@chakra-ui/react';
import { FormControl, FormLabel } from '@chakra-ui/form-control';
import { Heading, VStack, HStack, Box, Flex, Spacer } from '@chakra-ui/layout';
import { EthereumAuthProvider } from '@ceramicnetwork/blockchain-utils-linking';
import { DIDDataStore } from '@glazed/did-datastore';
import { DIDSession } from '@glazed/did-session';
import aliases from './utils/datamodel';
import ceramic from './utils/dataclient';

/**
 * DIDDataStore = allows read & write ops to Ceramic, based on Data models
 * DIDSession = handles authentication flow
 */

export default function Index() {
  /** Todo: add button disabled to "Load" if not connected */
  const [name, Ceramic] = useState('');
  const [nationality, setNationality] = useState('');
  const [gender, setGender] = useState('');
  const [connect, setConnect] = useState('Connect');
  const [ceramicName, setCeramicName] = useState('');
  const [ceramicNationality, setCeramicNationality] = useState('');
  const [ceramicGender, setCeramicGender] = useState('');

  /**
   * schema: JSON schema data model
   * definitions: user-friendly model / description of specific schema
   * titles: individual data records based on parameters set within schema
   */
  const datastore = new DIDDataStore({ ceramic, model: aliases });

  const ethAuth = async (provider: any) => {
    const accounts = await provider.request({ method: 'eth_requestAccounts' });
    const authProvider = new EthereumAuthProvider(provider, accounts[0]);
    const session = new DIDSession({ authProvider });
    const did = await session.authorize();
    ceramic.did = did;
  };

  const auth = async () => {
    if (!window.ethereum) throw new Error('No Eth Injection');
    else await ethAuth(window.ethereum);
  };

  const getCeramicProfile = async () => {
    const profile = await datastore.get('BasicProfile');
    if (profile) {
      renderProfileData(profile);
      console.log(`Profile Rendered: ${profile}`);
    } else console.log('Profile Does Not Exist');
  };

  const renderProfileData = (profile: any) => {
    if (typeof profile.name !== null) setCeramicName(profile.name);
    if (typeof profile.nationality !== null)
      setCeramicNationality(profile.nationality);
    if (typeof profile.gender !== null) setCeramicGender(profile.gender);
  };

  const updateCeramicProfile = async () => {
    try {
      await datastore.merge('BasicProfile', { name, nationality, gender });
      console.log('Profile Updated');
    } catch (error) {
      console.log(`\nUpdate Error: ${error}`);
    }
  };

  const connectWallet = async (authFunc: Function, callback: Function) => {
    try {
      await authFunc();
      await callback();
      setConnect('Connected');
    } catch (error) {
      console.log(`\nConnection Error: ${error}`);
    }
  };

  const handleName = (e: React.ChangeEvent<HTMLInputElement>) => {
    Ceramic(e.target.value);
  };

  const handleNationality = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNationality(e.target.value);
  };

  const handleGender = (e: any) => {
    if (e.target.value == 'option1') setGender('Female');
    else if (e.target.value == 'option2') setGender('Male');
    else if (e.target.value == 'option3') setGender('Non-Binary');
    else setGender('Other');
  };

  return (
    <VStack w="100%" h="100vh">
      <Flex p="3" w="100%">
        <Heading size="lg">Ceramic Profile Updater</Heading>
        <Spacer />
        <Button onClick={() => connectWallet(auth, getCeramicProfile)}>
          {connect}
        </Button>
      </Flex>
      <HStack w="100%" px="5%" pt="20">
        <Box width="100%" h="100%" p="5">
          <Heading size="md">Profile Information</Heading>
          <hr />
          <Box pt="2">
            <Text fontWeight="bold" pb="2">
              Read from Ceramic Datamodel
            </Text>
            <Text pb="2" id="name">
              Name: {ceramicName}
            </Text>
            <Text pb="2" id="nationality">
              Nationality: {ceramicNationality}
            </Text>
            <Text pb="2" id="gender">
              Gender: {ceramicGender}
            </Text>
          </Box>
          <Button
            alignSelf="center"
            mx="auto"
            w="100%"
            type="submit"
            onClick={() => getCeramicProfile()}
          >
            Load
          </Button>
        </Box>
        <Box width="100%" h="100%" p="5">
          <Heading size="md">Update Profile</Heading>
          <hr />
          <FormControl pt="2">
            <HStack pb="2">
              <FormLabel w="30">Full Name:</FormLabel>
              <Spacer />
              <Input
                w="60"
                id="name"
                placeholder="Jane Doe"
                onChange={handleName}
              ></Input>
            </HStack>
            <HStack pb="2">
              <FormLabel w="30">Nationality:</FormLabel>
              <Spacer />
              <Input
                w="60"
                id="nationality"
                placeholder="Mexico"
                onChange={handleNationality}
              ></Input>
            </HStack>
            <HStack pb="2">
              <FormLabel w="30">Gender:</FormLabel>
              <Spacer />
              <Select
                w="60"
                placeholder="Select Gender"
                id="gender"
                onChange={handleGender}
              >
                <option value="option1">Female</option>
                <option value="option2">Male</option>
                <option value="option3">Non-Binary</option>
                <option value="option3">Other</option>
              </Select>
            </HStack>
            <Flex>
              <Button
                alignSelf="center"
                mx="auto"
                w="100%"
                type="submit"
                onClick={() => updateCeramicProfile()}
              >
                Submit
              </Button>
            </Flex>
          </FormControl>
        </Box>
      </HStack>
    </VStack>
  );
}
