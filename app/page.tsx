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
import { Accordion, AccordionDetails, AccordionSummary, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, ClickAwayListener, Pagination, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { fetchRevealStatus, fetchWallets } from './api/contract';
import useWindowSize from './hooks/windowSize'
import { ExpandMoreOutlined, ImageOutlined, ImageRounded, SearchOutlined, Visibility, VisibilityOff, VisibilityOffOutlined, VisibilityOutlined, WalletRounded } from '@mui/icons-material';
import Wallet from './components/wallet';
import Image from 'next/image'

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
  const [open, setOpen] = useState(false);
  const [metaShown, setMetaShown] = useState(false);
  const [walletShown, setWalletShown] = useState(false)
  const [mobileHyper, setMobileHyper] = useState(true);

  const showWalletView = () => {
    setWalletShown(true)
  }

  const toggleMeta = () => {
    setMetaShown(!metaShown)
  }

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
  const [selectedTraitValues, setSelectedTraitValues] = useState({
    "Pack": [],
    "Pack Leader": [],
    "Revealed": [],
    "Background": [],
    "Body": [],
    "Eyes": [],
    "Mouth": [],
    "Hat": [],
    "Top": [],
    "Background Detail": [],
    "Eyewear": [],
    "Accessory": []
  });
  const [selectedTraitCount, setSelectedTraitCount] = useState(null);
  const size = useWindowSize();
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

  const getTraitValues = (traitType:any) => {
    return Array.from(
      new Set(
        JSONData.flatMap((item) =>
          item.attributes
            .filter((attribute) => attribute.trait_type === traitType)
            .map((attribute) => attribute.value)
        ).sort()
      )
    ).map(a => { return { label: a, value: a } });
  }

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

  const handleTraitValueChange = (label:string, event: any) => {
    // const traitValues = event.map(a => a.label);
    // setSelectedTraitValue(traitValues);
    // setSelectedTraitCount('');
    let newSelectedTraitValues = selectedTraitValues;
    newSelectedTraitValues[label] = event.map(a => a.label)

    const traitCountJSON = selectedTraitCount ? JSONData.filter((item) =>
      item.attributes.length - 1 === parseInt(selectedTraitCount)
    ) : JSONData

    const filtered = traitCountJSON.filter((item) => {
      return Object.entries(newSelectedTraitValues).every(([traitType, selectedValues]) => {
        const attribute = item.attributes.find((attr) => attr.trait_type === traitType);
        if (!attribute) {
          return selectedValues.length === 0; // If the attribute doesn't exist, only allow if no specific values are selected
        }
        return (
          selectedValues.length === 0 || selectedValues.includes(attribute.value)
        );
      });
    });
    setSelectedTraitValues(newSelectedTraitValues)
    setFilteredData(filtered);
    setCurrentItems(filtered.slice(indexOfFirstItem, indexOfLastItem))
    setCurrentPage(1)

    // if (event.length > 0) {
    // }
    // } else {
    //   setFilteredData(JSONData);
    //   setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
    //   setCurrentPage(1)
    // }
  };

  const handleTraitCountChange = (event: any) => {
    if(!event) {
      setFilteredData(JSONData);
      setCurrentItems(JSONData.slice(indexOfFirstItem, indexOfLastItem))
      setSelectedTraitValues({
        "Pack": [],
        "Pack Leader": [],
        "Revealed": [],
        "Background": [],
        "Body": [],
        "Eyes": [],
        "Mouth": [],
        "Hat": [],
        "Top": [],
        "Background Detail": [],
        "Eyewear": [],
        "Accessory": []
      })
      setSelectedTraitCount(null);
      return
    }

    const traitValue = event.value;
    setSelectedTraitCount(traitValue);
    const filtered = JSONData.filter((item) =>
      item.attributes.length - 1 === traitValue
    );
    setFilteredData(filtered);
    setCurrentItems(filtered.slice(indexOfFirstItem, indexOfLastItem))
    setSelectedTraitValues({
      "Pack": [],
      "Pack Leader": [],
      "Revealed": [],
      "Background": [],
      "Body": [],
      "Eyes": [],
      "Mouth": [],
      "Hat": [],
      "Top": [],
      "Background Detail": [],
      "Eyewear": [],
      "Accessory": []
    })
  };

  const handleHyperClick = (item: any) => {
    if(!mobileHyper)
      return
    if (item.tokenId === 0) {
      window.open('https://avax.hyperspace.xyz/collection/avax/5ad14893-3f7e-4be2-9205-d2122591c9f2', '_blank');
    }
    window.open('https://avax.hyperspace.xyz/collection/avax/5ad14893-3f7e-4be2-9205-d2122591c9f2?tokenAddress=0xbacd77ac0c456798e05de15999cb212129d90b70_' + item.tokenId, '_blank');
  }
  
  const handleTouchAway = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    e.stopImmediatePropagation()
    e.stopPropagation()
    handleDrawerClose()
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

  useEffect(() => {
    if (size.width < 600) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  }, [size.width])

  const traitOptions = [
    { value: 5, label: '5' },
    { value: 6, label: '6' },
    { value: 7, label: '7' },
    { value: 8, label: '8' },
    { value: 9, label: '9' },
    { value: 10, label: '10' },
  ]

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex' }}>
        <AppBar position="fixed" open={open} style={{ display: (open && size.width < 600 ? 'none' : 'block') }}>
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
                Woofys Queried: {filteredData.length}
              </Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <ClickAwayListener
          touchEvent="onTouchEnd"
          mouseEvent={false}
          onClickAway={(e) => {open && handleTouchAway(e)}}
        >
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              scrollbarWidth: 'thin'
            }
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
          <List>
              <ListItem key={500} onClick={showWalletView} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <WalletRounded />
                  </ListItemIcon>
                  <ListItemText primary={"Wallet Viewer"} />
                </ListItemButton>
              </ListItem>
              <ListItem key={501} onClick={() => setWalletShown(false)} disablePadding>
                <ListItemButton>
                  <ListItemIcon>
                    <ImageRounded />
                  </ListItemIcon>
                  <ListItemText primary={"Woofy Viewer"} />
                </ListItemButton>
              </ListItem>
          </List>
          <Divider />
          <Accordion>
          <AccordionSummary
            expandIcon={<ExpandMoreOutlined />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography>Filters</Typography>
          </AccordionSummary>
          <AccordionDetails>
          <List style={{ padding: '2px', gap: '10px' }}>
            <Select
              key={100090}
              isClearable
              closeMenuOnSelect={false}
              onChange={handleTraitCountChange}
              options={traitOptions}
              styles={dropdownStyle}
              placeholder={'Trait Count'}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary25: 'darkgray',
                  primary: 'gray',
                },
              })}
            />
            {uniqueTraitTypes.map((a, index) => {
              return <div key={index}>
                <Select
                  closeMenuOnSelect={false}
                  isMulti
                  isClearable
                  placeholder={a.label}
                  onChange={(e) => handleTraitValueChange(a.label, e)}
                  options={getTraitValues(a.label)}
                  styles={dropdownStyle}
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      primary25: 'darkgray',
                      primary: 'gray',
                    },
                  })}
                />
              </div>
            })}
          </List>
          </AccordionDetails>
        </Accordion>
          <Divider />
        </Drawer>
        </ClickAwayListener>
        <Main open={open} style={{ padding: 0, paddingTop: '20px', paddingBottom: '20px', height: '100vh' }}>
          <DrawerHeader />
          {walletShown ? <Wallet wallets={wallets}></Wallet> : <></>}
          {loading ? <Loader></Loader> :
            <div style={{display: walletShown ? 'none' : 'inline'}}>
              <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'top', gap: '15px', paddingBottom: '100px' }}>
                {currentItems.map((item: any, index) => (
                  <div key={index}>
                    <Card sx={{ width: size.width < 600 ? 180 : 250 }}>
                      <CardActionArea onClick={() => handleHyperClick(item)}>
                        <CardMedia>
                          <div style={{ position: 'relative', width: '100%', height: size.width < 600 ? 180 : 250 }}>
                            <Image alt={item.name}
                            width={size.width < 600 ? 180 : 250}
                            height={size.width < 600 ? 180 : 250}
                            sizes="(max-width: 180px) 100vw, (max-width: 250px) 50vw, 33vw"
                            src={item.image}
                            priority={true}
                            />
                          </div>
                        </CardMedia>
                      </CardActionArea>
                      <CardContent>
                        <Typography gutterBottom component="div">
                          <b>{item.name}</b> - {item.revealed ? `ID: ${item.tokenId}` : 'Unrevealed'}
                        </Typography>
                      </CardContent>
                      <TableContainer hidden={metaShown} component={Paper} sx={{ overflow: 'auto', overflowX: 'hidden' }}>
                        <Table size="small" aria-label="a dense table">
                          <TableBody>
                            {item.attributes.map((attribute, attrIndex) => (
                              <TableRow
                                key={attrIndex}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                              >
                                <TableCell sx={{
                                  paddingLeft: '10px',
                                  paddingRight: '5px',
                                  paddingTop: '0px',
                                  paddingBottom: '0px',
                                  margin: '0',
                                  fontSize: size.width < 600 ? '12px' : '14px'
                                }}>
                                  {attribute.trait_type}
                                </TableCell>
                                <TableCell sx={{
                                  paddingLeft: '10px',
                                  paddingRight: '5px',
                                  paddingTop: '0px',
                                  paddingBottom: '0px',
                                  margin: '0',
                                  fontSize: size.width < 600 ? '12px' : '14px'
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
                  </div>
                ))}
              </div>
            </div>
          }
          <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0, display: ((open && size.width < 600) || walletShown ? 'none' : 'block') }}>
            {filteredData.length > ITEMS_PER_PAGE && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                flexDirection="row"
                width={open ? size.width - drawerWidth : "100%"}
                sx={{
                  gap: '5px',
                  marginLeft: open ? drawerWidth / 8 : 0,
                  marginTop: '5px',
                  marginBottom: '5px',
                  paddingRight: '10px'
                }}>
                <Button onClick={toggleMeta}>{metaShown ? <VisibilityOffOutlined color="secondary" /> : <VisibilityOutlined color="secondary" />}</Button>
                <Pagination
                  onChange={handleChangePage}
                  siblingCount={0}
                  count={Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
                  variant="outlined" shape="rounded"
                  size={size.width < 600 ? 'small' : 'medium'}
                />
                <Typography variant="caption" display="block" hidden={size.width < 600}>{ITEMS_PER_PAGE} per page</Typography>
              </Box>
            )}
          </AppBar>
        </Main>
      </Box>
    </ThemeProvider>
  );
};

export default Home;
