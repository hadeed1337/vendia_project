import React, {useEffect, useState, useMemo, useContext } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Box, Button, darken, IconButton, Tooltip } from '@mui/material';
import { DataContext } from '../context/DataContext';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import '../components/Main.css';

const Tests = () => {

  const {tests, fetchTests, orgs, fetchOrgs, fetchTestEntity, addTest, editTest, deleteTest} = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(true)
  const accountType = localStorage.getItem('accountType');
  const location = useLocation();
  const contextEntity = location.state;
  const contextType = localStorage.getItem('contextType');

  const blueBackgroundColor = '#929aab';
  const whiteBackgroundColor = '#bbc0ca';
  const whiteBackgroundColor2 = '#b1b6bf';


  // Fetches all the tests
  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);

        try {
            await fetchOrgs(); // Fetch organizations
            if (contextEntity && contextEntity._id) {
                await fetchTestEntity(contextEntity._id);

            }

            await fetchTests();
        } catch (error) {
            console.error("Error in fetching data:", error);
        }
        setIsLoading(false);
    };

    fetchData();
}, [contextEntity, contextType, fetchTestEntity, fetchTests]);

  const convertCompletedToBoolean = (completedString) => {
    return completedString === 'Completed';
  };



  const openDeleteConfirmModal = (row) => { // Adds a confirmation before deleting a user
    if (window.confirm('Are you sure you want to delete this test?')) {
      deleteTest(row.original._id)};
  };
  
  const columns = useMemo(() => { // Defining the columns for the table

    // Common columns for both device and org, first half
    const commonColumnsFirst = [
      { accessorKey: 'TestName', header: 'Test Name', required: true },
      { accessorKey: 'TestMethod', header: 'Test Method' },
    ];

    // Conditional column if org
    const deviceColumn = { accessorKey: 'Device', header: 'Device Name' };

    // Conditional column if device and admin user
    const adminOrgColumn = {
      accessorKey: 'OrgAssignment',
      header: 'Org',
      editVariant: 'select',
      editSelectOptions: orgs.map(org => org.OrgName),
      required: true,
    };

    // Conditional column if device and standard user
    const standardOrgColumn = {
      accessorKey: 'OrgAssignment',
      header: 'Org',
      enableEditing: false,
    };

    // Common columns for both device and org, second half
    const commonColumnsLast = [
      { accessorKey: 'Notes', header: 'Notes' },
      { accessorKey: 'UpdatedBy', header: 'Updated By' },
      { accessorKey: 'Completed', header: 'Completed', 
        editVariant: 'select',
        editSelectOptions: [
          { value: 'Active', label: 'Active' },
          { value: 'Completed', label: 'Completed' },
        ],},
    ];

    if (contextType === 'org') {
      return [...commonColumnsFirst, deviceColumn, ...commonColumnsLast];
    } else if (contextType === 'device') {
      const orgColumn = accountType === 'Admin' ? adminOrgColumn : standardOrgColumn;
      return [...commonColumnsFirst, orgColumn, ...commonColumnsLast];
    }
  }, [orgs, contextType, accountType]);


  // Maps the tests from the tests array to the table
  const data = useMemo(() => {
    return tests?.map((item) => {
      const commonData = {
        _id: item._id,
        TestName: item.TestName,
        TestMethod: item.TestMethod,
        OrgAssignment: item.OrgAssignment,
        Notes: item.Notes,
        UpdatedBy: item.UpdatedBy,
        Completed: item.Completed,
      };
  
      if (contextType === 'device' && item.Device === contextEntity.DeviceName) {
        commonData.Device = item.Device;
        return commonData;
      } else if (contextType === 'org' && item.OrgAssignment === contextEntity.OrgName) {
        commonData.Device = item.Device;
        return commonData;
      }
  
      return null;
    }).filter(item => item !== null);
  }, [tests, contextType, contextEntity]);
    

  // Makes the actual table
  const table = useMaterialReactTable({
    columns, // columns defined above
    data, // data defined above
    getRowId: (row) => row._id, // sets the id for each row to the test's vendia id
    enableHiding: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    positionGlobalFilter: 'left',
    enableEditing: true,
    editDisplayMode: 'row',
    createDisplayMode: 'modal',

  
    onCreatingRowSave: ({ table, values}) => { // Hook for creating a new Test
      const { TestName, OrgAssignment, Completed } = values;

      if (!TestName || !OrgAssignment) { // Makes sure Test Name and Org Assignment are filled out
        alert('Test Name and Org Assignment are required.'); 
      } else {
        const completedBool = convertCompletedToBoolean(Completed); // Convert the Completed dropdown value to boolean
        const newValues = { ...values, Completed: completedBool };

        addTest(contextEntity, newValues);
        table.setCreatingRow(null); // Exit creating mode
      }
    },

    onEditingRowSave: async ({table, values, row}) => { // Hook for editing an exisitng device
      const { TestName, Completed } = values;

      if (!TestName ) { // Makes sure Test Name isnt empty
        alert('Test Name is required.'); 
      } else {

        const completedBool = convertCompletedToBoolean(Completed); // Convert the Completed dropdown value to boolean
        const newValues = { ...values, Completed: completedBool };

        editTest(row, newValues)  
        table.setEditingRow(null); // Exit Editing mode
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

     //Adds edit, delete buttons for each row
     renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex' }}>
        {accountType === 'Admin' && (
          <Tooltip title="Delete">
            <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    // Adds a button for adding a new test on the top of the table
    renderTopToolbarCustomActions: ({ table }) => (
       accountType === 'Admin' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', p: '4px' }}>
            <Button
              color="primary"
              onClick={() => {table.setCreatingRow(true);}}
              variant="contained"
            >
              Add Test
            </Button>
          </Box>
       )
        ),

    mrtTheme: (theme) => ({
            baseBackgroundColor: blueBackgroundColor,
            draggingBorderColor: theme.palette.secondary.main,
          }),
  });

  return(
      <>
      <Header />
      <h2 className='topH2'>
        Tests 
      </h2>
      <div className=''>
      {contextType === 'device' ? (
        <>Device: {contextEntity && contextEntity.DeviceName ? contextEntity.DeviceName : "None"}</>
      ) : (
        <>Org: {contextEntity && contextEntity.OrgName ? contextEntity.OrgName : "None"}</>
      )}
    </div>


      
      <div>
        {isLoading ? (
            <div>Loading...</div>
        ) : (
            <MaterialReactTable table={table} />
        )}
      </div>

      
      </>
  ) 
  }

export default Tests;

