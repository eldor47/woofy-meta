// pages/index.tsx
'use client'
import { useEffect, useState } from 'react';
import Loader from './Loader';
import woofyMeta from "./api/woofymeta.json"
import styles from "./page.module.css"
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import Select, { StylesConfig } from 'react-select'
import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { fetchRevealStatus, fetchWallets } from './api/contract';
import { SearchOffOutlined, SearchOutlined } from '@mui/icons-material';


const drawerWidth = 300;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


const Home = () => {
  const [JSONData, setJSONData] = useState(woofyMeta)
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [wallets, setWallets] = useState([])
  const ITEMS_PER_PAGE = 50
  const theme = useTheme();
  const [open, setOpen] = useState(true);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    paginate(newPage);
  };

  const [selectedTraitType, setSelectedTraitType] = useState('');
  const [selectedTraitValue, setSelectedTraitValue] = useState('');
  const [selectedTraitCount, setSelectedTraitCount] = useState('');
  const [filteredData, setFilteredData] = useState(JSONData);
  const [currentItems, setCurrentItems] = useState(filteredData.slice(indexOfFirstItem, indexOfLastItem));

  let uniqueTraitTypes = Array.from(
    new Set(
      JSONData.flatMap((item) =>
        item.attributes.map((attribute) => attribute.trait_type)
      )
    )
  ).map(a => { return { label: a, value: a } })

  let uniqueTraitValues = Array.from(
    new Set(
      JSONData.flatMap((item) =>
        item.attributes
          .filter((attribute) => attribute.trait_type === selectedTraitType)
          .map((attribute) => attribute.value)
      ).sort()
    )
  ).map(a => { return { label: a, value: a } });

  useEffect(() => {
    setCurrentItems(filteredData.slice(indexOfFirstItem, indexOfLastItem))
  }, [currentPage])

  useEffect(() => {
    setLoading(true)
    fetchRevealStatus(JSONData).then(newJsonData => {
      setJSONData(newJsonData)
      setFilteredData(newJsonData)
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      uniqueTraitTypes = Array.from(
        new Set(
          newJsonData.flatMap((item: { attributes: any[]; }) =>
            item.attributes.map((attribute) => attribute.trait_type)
          )
        )
      );

      uniqueTraitValues = Array.from(
        new Set(
          newJsonData.flatMap((item: { attributes: any[]; }) =>
            item.attributes
              .filter((attribute) => attribute.trait_type === selectedTraitType)
              .map((attribute) => attribute.value)
          ).sort()
        )
      );
      setCurrentPage(1)
      setLoading(false)
    })

    fetchWallets().then((data) => {
      setWallets(data)
    })

  }, [])

  const handleTraitTypeChange = (event: any) => {
    const traitType = event ? event.label : '';
    setSelectedTraitType(traitType);
    setSelectedTraitValue('');
    setSelectedTraitCount('');

    if (traitType !== '') {
      const filtered = JSONData.filter((item) =>
        item.attributes.some((attr) => attr.trait_type === traitType)
      );
    } else {
      setFilteredData(JSONData);
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    }
  };

  const handleTraitValueChange = (event: any) => {
    const traitValues = event.map(a => a.label);
    setSelectedTraitValue(traitValues);
    setSelectedTraitCount('');

    if (traitValues) {
      const filtered = JSONData.filter((item) =>
        item.attributes.some(
          (attr) =>
            attr.trait_type === selectedTraitType && traitValues.includes(attr.value)
        )
      );
      setFilteredData(filtered);
      setCurrentItems(filtered.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    } else {
      setFilteredData(JSONData);
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    }
  };

  const handleTraitCountChange = (event: { target: { value: any; }; }) => {
    const traitValue = event.target.value;
    setSelectedTraitCount(traitValue);


    if (traitValue !== '') {
      let filtered = []
      if (selectedTraitValue !== '') {
        filtered = JSONData.filter((item) =>
          item.attributes.some(
            (attr) =>
              attr.trait_type === selectedTraitType && attr.value === selectedTraitValue
          )
        )

        filtered = filtered.filter((item) =>
          item.attributes.length - 1 === parseInt(traitValue)
        );
      }
      else {
        filtered = JSONData.filter((item) =>
          item.attributes.length - 1 === parseInt(traitValue)
        );
      }
      setFilteredData(filtered);
      setCurrentItems(filtered.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    } else {
      setFilteredData(JSONData);
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      setCurrentPage(1)
    }
  };

  const handleHyperClick = (item:any) => {
    if(item.tokenId === 0) {
      window.open('https://avax.hyperspace.xyz/collection/avax/5ad14893-3f7e-4be2-9205-d2122591c9f2','_blank');
    }
    window.open('https://avax.hyperspace.xyz/collection/avax/5ad14893-3f7e-4be2-9205-d2122591c9f2?tokenAddress=0xbacd77ac0c456798e05de15999cb212129d90b70_' + item.tokenId, '_blank');
  }


  const dropdownStyle = {
    option: provided => ({
      ...provided,
      color: 'black'
    }),
    control: provided => ({
      ...provided,
      color: 'black'
    }),
    singleValue: provided => ({
      ...provided,
      color: 'black'
    })
  }

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });


  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" open={open} style={{display: open && window.innerWidth < 600 ? 'none' : 'block'}}>
          <Toolbar hidden={open}>
              <Box display='flex' flexGrow={1} alignItems={'center'}>
                  {/* whatever is on the left side */}
                  <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    onClick={handleDrawerOpen}
                    edge="start"
                    sx={{ mr: 2, ...(open && { display: 'none' }) }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h6" noWrap component="div">
                    Woofy <SearchOutlined></SearchOutlined>
                  </Typography>
              </Box>
              {/* whatever is on the right side */}
              <Box display='flex' flexDirection='column'>
                <Typography variant="caption" display="block">
                  Reveal Status: {filteredData.filter((a: any) => a.revealed === true).length}/{filteredData.length} ({Math.ceil((filteredData.filter((a: any) => a.revealed === true).length / filteredData.length) * 100)}%)
                </Typography>
                <Typography variant="caption" display="block">
                  NFTS Queried: {filteredData.length}
                </Typography>
              </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List style={{ padding: '20px' }}>
            <Select
              onChange={handleTraitTypeChange}
              options={uniqueTraitTypes}
              styles={dropdownStyle}
              isClearable
              theme={(theme) => ({
                ...theme,
                borderRadius: 0,
                colors: {
                  ...theme.colors,
                  primary25: 'darkgray',
                  primary: 'gray',
                },
              })}
            />
            <Select
              closeMenuOnSelect={false}
              isMulti
              onChange={handleTraitValueChange}
              options={uniqueTraitValues}
              styles={dropdownStyle}
              theme={(theme) => ({
                ...theme,
                borderRadius: 0,
                colors: {
                  ...theme.colors,
                  primary25: 'darkgray',
                  primary: 'gray',
                },
              })}
            />
            {/* <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}> */}
            {/* <select
              id="traitType"
              value={selectedTraitType}
              onChange={handleTraitTypeChange}
              style={dropdownStyle}
              disabled={loading}
            >
              <option value="">Select a trait type</option>
              {uniqueTraitTypes.map((traitType, index) => (
                <option key={index} value={traitType}>
                  {traitType}
                </option>
              ))}
            </select>

            <select
              id="traitValue"
              value={selectedTraitValue}
              onChange={handleTraitValueChange}
              style={dropdownStyle}
              disabled={loading}
            >
              <option value="">Select a trait value</option>
              {uniqueTraitValues.map((traitValue, index) => (
                <option key={index} value={traitValue}>
                  {traitValue}
                </option>
              ))}
            </select>

            <select
              id="traitCount"
              value={selectedTraitCount}
              onChange={handleTraitCountChange}
              style={dropdownStyle}
              disabled={loading}
            >
              <option value=""># of Traits</option>
              <option value={5}>5</option>
              <option value={6}>6</option>
              <option value={7}>7</option>
              <option value={8}>8</option>
              <option value={9}>9</option>
              <option value={10}>10</option>
            </select> */}
            {/* </div> */}
          </List>
          <Divider />
          <List>
            {['All mail', 'Trash', 'Spam'].map((text, index) => (
              <ListItem key={text} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Main open={open} style={{padding: 0, paddingTop: '20px', paddingBottom: '20px', height: '100vh'}}>
          <DrawerHeader />
          {loading ? <Loader></Loader> :
            <div>
              <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'top', gap: '15px', marginBottom: '50px' }}>
                {currentItems.map((item:any, index) => (
                  <div key={index}>
                    <Card sx={{ width: window.innerWidth < 600 ? 180 : 250 }}>
                      <CardActionArea onClick={() => handleHyperClick(item)}>
                        <CardMedia
                          component="img"
                          height={window.innerWidth < 600 ? 180 : 250}
                          image={item.image}
                          alt={item.name}
                        />
                      </CardActionArea>
                      <CardContent>
                          <Typography gutterBottom component="div">
                          <b>{item.name}</b> - {item.revealed ? `ID: ${item.tokenId}` : 'Unrevealed'}
                          </Typography>
                        </CardContent>
                        <TableContainer component={Paper} sx={{height: '200px', overflow: 'auto', overflowX: 'hidden'}}>
                          <Table size="small" aria-label="a dense table">
                            <TableBody>
                              {item.attributes.map((attribute, attrIndex) => (
                                <TableRow
                                  key={attrIndex}
                                  sx={{ '&:last-child td, &:last-child th': { border: 0 }}}
                                >
                                  <TableCell sx={{
                                      paddingLeft: '10px',
                                      paddingRight: '5px',
                                      paddingTop: '0px',
                                      paddingBottom: '0px',
                                      margin: '0',
                                      fontSize: window.innerWidth < 600 ? '12px' : '14px' 
                                    }}>
                                    {attribute.trait_type}
                                  </TableCell>
                                  <TableCell sx={{
                                      paddingLeft: '10px',
                                      paddingRight: '5px',
                                      paddingTop: '0px',
                                      paddingBottom: '0px',
                                      margin: '0', 
                                      fontSize: window.innerWidth < 600 ? '12px' : '14px' 
                                    }}>
                                  {attribute.value}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      {/* <CardActions>
                        <Button size="small" color="primary">
                          Download
                        </Button>
                      </CardActions> */}
                    </Card>
                    {/* <div>
                      <h2 style={{ textAlign: 'center' }}>{item.name}</h2>
                      <img className={styles.loadIn} src={item.image} alt={item.name} />
                      <ul style={{ listStyleType: 'none' }}>
                        {item.attributes.map((attribute, attrIndex) => (
                          <li key={attrIndex} style={{ fontSize: window.innerWidth < 600 ? '12px' : '14px' }}>
                            <strong>{attribute.trait_type}:</strong> {attribute.value}
                          </li>
                        ))}
                      </ul>
                    </div> */}
                  </div>
                ))}
              </div>
            </div>
          }
          <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0, display: open && window.innerWidth < 600 ? 'none' : 'block' }}>
            <div>
              {filteredData.length > ITEMS_PER_PAGE && (
                <Box style={
                  {
                    display: 'flex', justifyContent: 'center',
                    gap: '5px',
                    marginLeft: open ? drawerWidth / 2 : 0,
                    marginTop: '10px',
                    marginBottom: '10px',
                    flexWrap: 'wrap'
                  }}>
                  <Pagination onChange={handleChangePage} count={Math.ceil(filteredData.length / ITEMS_PER_PAGE)} variant="outlined" shape="rounded" />
                  
                </Box>
              )}
            </div>
          </AppBar>
        </Main>
      </Box>
    </ThemeProvider>
  );
};

export default Home;
