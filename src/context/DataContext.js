import React, { createContext, useState, useCallback, useEffect } from 'react';
import { VendiaClient } from '../api/VendiaClient';

const {client} = VendiaClient(); // Create Vendia client

export const DataContext = createContext({ // Create context for data. Set defaults to empty arrays
  client: client,
  devices: [],
  tests: [],
  orgs: [],

  testEntity: [],
  testCountByDevice: {},
  testCountByOrg: {},
});

export const DataProvider = ({ children }) => { 
  const [devices, setDevices] = useState([]);
  const [tests, setTests] = useState([]);
  const [orgs, setOrgs] = useState([]);
  const storedTestEntity = JSON.parse(localStorage.getItem('testEntity')) || {}
  const [testEntity, setTestEntity] = useState(storedTestEntity);
  const [testCountByDevice, setTestCountByDevice] = useState({});
  const [testCountByOrg, setTestCountByOrg] = useState({});
  const userOrg = localStorage.getItem('userOrg') || '';
  const accountType = localStorage.getItem('accountType') || 'Standard';
  const contextType = localStorage.getItem('contextType') || 'device';

  useEffect(() => {
    localStorage.setItem('testEntity', JSON.stringify(testEntity));
  }, [testEntity]);
  

  // Hooks to fetch, update, add, and delete Devices
  const fetchDevices = async () => {
    try {
      const devicesData = await client.entities.device.list({ readMode: 'NODE_LEDGERED' });
      const fetchedDevices = devicesData?.items || [];
      setDevices(fetchedDevices);
  
      const newTestCountByDevice = {}; // Fetch tests for each device and update counts
      for (const device of fetchedDevices) {
        const testsData = await client.entities.test.list({
          filter: { Device: { eq: device.DeviceName } },
          readMode: 'NODE_LEDGERED'
        });
        newTestCountByDevice[device.DeviceName] = testsData?.items.length || 0;
      }
      setTestCountByDevice(newTestCountByDevice);
    } catch (error) {
      console.error("Error fetching Devices:", error);
    }
  };

  const updateDevices = (newData) => {
    setDevices(newData);
  };

  const addDevice = async (newDevice) => {
    try {
      await client.entities.device.add({DeviceName: newDevice.DeviceName});
      updateDevices(prevDevices => [...prevDevices, newDevice]);
    } catch (error) {
      console.error("Failed to add device:", error);
    }
  }

  const deleteDevice = async (device) => {
    const deviceID = device.original._id;
    const deviceName = device.original.DeviceName;
    try {
      const testsData = await client.entities.test.list({// Fetch the tests associated with the device
        filter: { Device: { eq: deviceName } },
        readMode: 'NODE_LEDGERED'
      });
  
      for (const test of testsData?.items || []) { // Delete each test associated with the device
        await client.entities.test.remove(test._id);
      }
  
      await client.entities.device.remove(deviceID); 
  
      updateDevices((prevDevices) => 
        prevDevices.filter((device) => device._id !== deviceID)
      );
    } catch (error) {
      console.error("Failed to delete device and associated tests:", error);
    }
  }


  // Hooks to fetch, update, add edit, and delete Tests
  const fetchTestEntity = useCallback(async (Id) => {
    if (!testEntity || testEntity._id !== Id) {
      try { 
        if (contextType === 'device') { 
          const entity = await client.entities.device.get(Id);
          setTestEntity(entity);
        } else if (contextType === 'org') {
          const entity = await client.entities.orgs.get(Id);
          setTestEntity(entity);
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
      }
    }
  }, [testEntity]);

  const updateTestCounts = useCallback(() => {
    const newTestCountByDevice = {};
    const newTestCountByOrg = {};

    tests.forEach(test => {
      newTestCountByDevice[test.deviceId] = (newTestCountByDevice[test.deviceId] || 0) + 1;
      newTestCountByOrg[test.orgId] = (newTestCountByOrg[test.orgId] || 0) + 1;
    });

    setTestCountByDevice(newTestCountByDevice);
    setTestCountByOrg(newTestCountByOrg);
  }, [tests]);

  const convertBooleanToCompletedString = (completedBool) => {
    if (completedBool === null) {
      return '';
    }
    return completedBool ? 'Completed' : 'Active';
  };

  const fetchTests = useCallback( async () => {
    try {

      if ((contextType === 'device' || contextType === 'org') && testEntity.length === 0 ) {
        console.warn("No device or org selected to fetch tests for");
        return;
      }
  
      let filter;
      if (contextType === 'device') {
        filter = { Device: { eq: testEntity.DeviceName } };
        if (userOrg !== '' && accountType === 'Standard') {
          filter.OrgAssignment = { eq: userOrg };
        }
      } else if (contextType === 'org') {
        filter = { OrgAssignment: { eq: testEntity.OrgName } };
      }

      const testsData = await client.entities.test.list({
        filter,
        readMode: 'NODE_LEDGERED'
      });

      const transformedTests = testsData?.items.map(test => ({
        ...test,
        Completed: convertBooleanToCompletedString(test.Completed),
      })) || [];
  
      setTests(transformedTests);
    } catch (error) {
      console.error("Error fetching Tests:", error);
    }
  }, [testEntity, contextType]);
  

  const updateTests = (newData) => {
    setTests(newData);
  }

  const addTest = async (device, newTest) => {
    try {
      await client.entities.test.add({ 
        Device: device.DeviceName,
        TestName: newTest.TestName,
        TestMethod: newTest.TestMethod,
        OrgAssignment: newTest.OrgAssignment,
        Notes: newTest.Notes,
        UpdatedBy: newTest.UpdatedBy,
        Completed: newTest.Completed,
      });
      updateTests(prevTests => [...prevTests, newTest]);
    } catch (error) {
      console.error("Failed to add test:", error);
    }
  }

  const editTest = async (testId, newData) => {
    try {
      await client.entities.test.update({ 
      _id: testId.original._id,
      TestName: newData.TestName,
      TestMethod: newData.TestMethod,
      OrgAssignment: newData.OrgAssignment,
      Notes: newData.Notes,
      UpdatedBy: newData.UpdatedBy,
      });
      updateTests(prevTests => prevTests.map(test => test._id === testId ? newData : test));
    } catch (error) {
      console.error("Failed to edit test:", error);
    }
  }

  const deleteTest = async (testId) => {
    try {
      await client.entities.test.remove(testId);
      updateTests(prevTests => prevTests.filter(test => test._id !== testId));
    } catch (error) {
      console.error("Failed to delete test:", error);
    }
  }


  // Hooks to fetch, update, add edit, and delete Orgs
  const fetchOrgs = async () => {
    try {
      const orgsData = await client.entities.orgs.list({ readMode: 'NODE_LEDGERED' });
      const fetchedOrgs = orgsData?.items || [];
      setOrgs(fetchedOrgs);

      const newTestCountByOrg = {};
  
      for (const org of fetchedOrgs) {
        const testsData = await client.entities.test.list({
          filter: { OrgAssignment: { eq: org.OrgName } },
          readMode: 'NODE_LEDGERED'
        });
        newTestCountByOrg[org.OrgName] = testsData?.items.length || 0;
      }
  
      setTestCountByOrg(newTestCountByOrg);
    } catch (error) {
      console.error("Error fetching Orgs:", error);
    }
  };

  const updateOrgs = (newData) => {
    setOrgs(newData);
  }

  const addOrg = async (newOrg) => {
    try {
      await client.entities.orgs.add({OrgName: newOrg.OrgName});
      updateOrgs(prevOrgs => [...prevOrgs, newOrg]);
    } catch (error) {
      console.error("Failed to add org:", error);
    }
  }

  const deleteOrg = async (org) => {
    const OrgID = org.original._id;
    const OrgName = org.original.OrgName;
    
    try {
      const testsData = await client.entities.test.list({// Fetch the tests associated with the device
        filter: { OrgAssignment: { eq: OrgName } },
        readMode: 'NODE_LEDGERED'
      });
  
      for (const test of testsData?.items || []) { // Delete each test associated with the device
        await client.entities.test.remove(test._id);
      }
  
      await client.entities.org.remove(OrgID); 
  
      updateDevices((prevDevices) => 
        prevDevices.filter((org) => org._id !== OrgID)
      );
    } catch (error) {
      console.error("Failed to delete org and associated tests:", error);
    }
  }



  return (
    <DataContext.Provider value={{ client, devices, tests, orgs,
                                  fetchDevices, fetchTests, fetchTestEntity, fetchOrgs,
                                  updateDevices, updateTests,updateOrgs,
                                  addDevice, addTest, addOrg, editTest,
                                  testCountByDevice, updateTestCounts, testCountByOrg,
                                  deleteDevice, deleteTest, deleteOrg }}>
      {children}
    </DataContext.Provider>
  );
};
