import React, {useState, useContext} from 'react'
import { Box, Button, CssBaseline, styled, Toolbar, Typography, 
  IconButton, List, Menu, MenuItem } from '@mui/material'
import python from './python.png'
import MuiDrawer from '@mui/material/Drawer'
import MuiAppBar from '@mui/material/AppBar'
import AccountCircle from '@mui/icons-material/AccountCircle'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import HomeIcon from '@mui/icons-material/Home'
import { Link as RouterLink } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const drawerWidth = 240


const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: 'hidden',
})

const closedMixin = (theme) => ({
  transition: theme.transitions.create('width', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: 'hidden',
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up('sm')]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
})

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  background: '#2E3B55',
  alignItems: 'center',
  justifyContent: 'flex-end',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}))

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  background: '#2E3B55',
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}))

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    ...(open && {
      ...openedMixin(theme),
      '& .MuiDrawer-paper': openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      '& .MuiDrawer-paper': closedMixin(theme),
    }),
  }),
)

export default function Header() {

  const { currentUser, signOutAndRefresh } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const openAcc = Boolean(anchorEl);
  const history = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOutAndRefresh();
      history('/Sign_in');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  
    return (
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar component="nav" position="fixed" >
  
        <Toolbar >

        <Typography
          align='left'
          variant="h5"
          style={{fontWeight: "bold"}}
          component="div"
          sx={{ flexGrow: 1 }}
        >
          <img src={python} width={30} height={30} alt='pythonLogo'/>
          {"   Monty Pythons"}
        </Typography>
             {currentUser && (
              <div>
                <IconButton
                  size="large"
                  edge="end"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={openAcc}
                  onClose={handleClose}
                >
                  <MenuItem disabled>{currentUser.email}</MenuItem>
                  <MenuItem onClick={handleClose}>Profile</MenuItem>
                  <MenuItem onClick={handleClose}>Settings</MenuItem>
                  <MenuItem onClick={handleSignOut}>Logout</MenuItem>
                </Menu>
              </div>
              )}
        </Toolbar>
  
        </AppBar>
        <Drawer variant="permanent" PaperProps={{ sx: {backgroundColor: '#778196'}}}>
  
          <DrawerHeader/>
          <List>
            <ListItemButton component={RouterLink} to='/Home'> 
              <ListItemIcon> 
                {<HomeIcon />} 
              </ListItemIcon> 
              <ListItemText primary={"Home"} /> 
            </ListItemButton> 
          </List>

          </Drawer>
      </Box>
    )
  }