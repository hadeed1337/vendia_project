import React, { useEffect, useState, useMemo, useContext } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import {Box, Button, darken, IconButton, Tooltip} from '@mui/material';
import { DataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import '../components/Main.css';

const Orgs = () => {

  const {client, orgs, fetchOrgs, addOrg, editOrg, deleteOrg, setContext, testCountByOrg} = useContext(DataContext);
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate();

  const blueBackgroundColor = '#929aab';
  const whiteBackgroundColor = '#bbc0ca';
  const whiteBackgroundColor2 = '#b1b6bf';

  
  // Fetches all the orgs
  useEffect(() => {
    setIsLoading(true);

    fetchOrgs()
      .then(() => setIsLoading(false))
      .catch((error) => {
        console.error("Error fetching orgs:", error);
        setIsLoading(false);
      });
  }, []);
  

  const openDeleteConfirmModal = (row) => { // Adds a confirmation before deleting a user
    if (window.confirm('Are you sure you want to delete this Org?')) {
      deleteOrg(row)};
  };

  const viewTests = async (OrgId) => {
    const getOrg = await client.entities.orgs.get(OrgId);
    localStorage.setItem('contextType', 'org');
    navigate("/Tests", {state: getOrg});
    
  }

  const columns = useMemo(() =>[ // Defining the columns for the table
    { accessorKey: 'OrgName', header: 'Org Name'},
    { header: 'Number of Tests',
      accessorKey: 'OrgName',
      Cell: ({ row }) =>  testCountByOrg[row.original.OrgName] || 0,
      muiTableHeadCellProps: { align: 'center' },
      muiTableBodyCellProps: { align: 'center' },
      enableEditing: false,
      createDisplayMode: 'none',
    },
  ], [testCountByOrg]);


  // Makes the actual table
  const table = useMaterialReactTable({

    columns, // columns defined above
    data: orgs, // data for each row grabbed from Orgs array
    getRowId: (row) => row._id, // sets the id for each row to the org's vendia id
    enableHiding: false,
    enableFullScreenToggle: false,
    enableDensityToggle: false,
    enableColumnActions: false,
    positionGlobalFilter: 'left',
    enableEditing: true,
    editDisplayMode: 'row',
    createDisplayMode: 'modal',


    onCreatingRowSave: async ({ table, values, }) => { // Hook for creating a new Org
      const OrgName = values.OrgName;
      
      if (!OrgName) { 
        alert('Org name is required.'); 
      } else {
        addOrg(values);
        table.setCreatingRow(null); // Exit creating mode
    }
    },

    onEditingRowSave: async ({table, row, values}) => { // Hook for editing an exisitng Org
      editOrg(row, values);
      table.setEditingRow(null); // Exit Editing mode
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

    //Adds edit, delete, and view buttons for each row
    renderRowActions: ({ row }) => (
      
      <Box sx={{ display: 'flex',
       
       }}>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="View Tests">
          <IconButton aria-label="view" onClick={() => viewTests(row.original._id)}>
            <VisibilityIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),

    // Adds a button for adding a new deivce on the top of the table
    renderTopToolbarCustomActions: ({ table }) => (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', p: '4px' }}>
            <Button
              color="primary"
              onClick={() => {table.setCreatingRow(true);}}
              variant="contained"
            >
              Add Org
            </Button>
          </Box>
        ),

    mrtTheme: (theme) => ({
            baseBackgroundColor: blueBackgroundColor,
            draggingBorderColor: theme.palette.secondary.main,
          }),
  });


  return (
    <>
      <Header />
        <h2 className='h2'>
           Orgs
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

export default Orgs;
