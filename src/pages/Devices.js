import React, { useEffect, useState, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, darken, IconButton, Tooltip } from '@mui/material';
import { DataContext } from '../context/DataContext';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../components/Main.css';

const Devices = () => {
  const {client, devices, fetchDevices, addDevice, deleteDevice,
         testCountByDevice, updateTestCounts, tests } = useContext(DataContext);
  const accountType = localStorage.getItem('accountType');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const blueBackgroundColor = '#929aab';
  const whiteBackgroundColor = '#bbc0ca';
  const whiteBackgroundColor2 = '#b1b6bf';

  
  // Fetches all the devices
  useEffect(() => {

    fetchDevices()
      .then(() => {
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching devices:", error);
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    updateTestCounts();
  }, [tests, updateTestCounts]);
  
  const openDeleteConfirmModal = (row) => { // Adds a confirmation before deleting a user
    if (window.confirm('Are you sure you want to delete this device?')) {
      deleteDevice(row);
    }
  };
  
  const viewTests = async (deviceId) => { // View tests of a device
    const getDevice = await client.entities.device.get(deviceId);
    localStorage.setItem('contextType', 'device');
    navigate("/Tests", {state: getDevice});
  };
 
  
  const columns = useMemo(() => [  // Defining the columns for the table
    { accessorKey: 'DeviceName', header: 'Device Name' },
    { header: 'Number of Tests',
      accessorKey: 'DeviceName',
      Cell: ({ row }) =>  testCountByDevice[row.original.DeviceName] || 0,
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'center' },
      enableEditing: false,
      createDisplayMode: 'none',
    },
  ], [testCountByDevice]);

  // Makes the actual table
  const table = useMaterialReactTable({
    columns, // columns defined above
    data: devices, // data for each row grabbed from devices array
    getRowId: (row) => row._id, // sets the id for each row to the device's vendia id
    enableHiding: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    positionGlobalFilter: 'left',
    enableEditing: true,
    createDisplayMode: 'modal',

    onCreatingRowSave: ({ table, values }) => { // Hook for adding a new device
      const DeviceName = values.DeviceName;

      if (!DeviceName) { 
        alert('Device name is required.'); 
      } else {
        addDevice( values);
        table.setCreatingRow(null); // Exit creating mode
    }
  },  

    muiTableBodyProps: { // Adds alternating row colors
      sx: {
        '& tr:nth-of-type(odd) > td': {
          backgroundColor: whiteBackgroundColor,
        },
        '& tr:nth-of-type(odd):hover > td': {
          backgroundColor: darken(whiteBackgroundColor, 0.2),
        },
        '& tr:nth-of-type(even) > td': {
          backgroundColor: whiteBackgroundColor2,
        },
        '& tr:nth-of-type(even):hover > td': {
          backgroundColor: darken(whiteBackgroundColor, 0.2),
        },
      },
    },

    // Adds edit, delete, and view buttons for each row
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex' }}>
        {accountType === 'Admin' && (
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="View Tests">
          <IconButton aria-label="view" onClick={() => viewTests(row.original._id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    // Adds a button for adding a new device on the top of the table
    renderTopToolbarCustomActions: ({ table }) => (
      accountType === 'Admin' && (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', p: '4px' }}>
        <Button
          color="primary"
          onClick={() => { table.setCreatingRow(true); }}
          variant="contained"
        >
          Add Device
        </Button>
      </Box>
      )
    ),

    mrtTheme: (theme) => ({
      baseBackgroundColor: blueBackgroundColor,
      draggingBorderColor: theme.palette.secondary.main,
    }),
  });

  return (
    <>
      <h2 className='topH2'>
        Devices
      </h2>
      <div style={{ width: '65%', overflow: 'auto' }}>
        {isLoading ? ( // Displays "Loading..." while the table is loading
          <div>Loading...</div>
        ) : (
          <MaterialReactTable table={table} />
        )}
      </div>
    </>
  );
};

export default Devices;
