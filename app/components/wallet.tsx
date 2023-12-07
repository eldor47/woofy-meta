// pages/index.tsx
'use client'
import { WalletRounded } from '@mui/icons-material';
import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useEffect, useState } from 'react';


const Wallet = (props: any) => {

    const handleClick = (address) => {
        window.open("https://avax.hyperspace.xyz/wallet/avax/" + address, '_blank');
    }

    return (
        <Box display="flex" alignItems="center" flexDirection={"column"} sx={{ width: "100%" }}>
            <Typography textAlign={"center"} flex={1}>Wallet Distribution - More Stats Soon</Typography>
            <List>
                {props.wallets.map(a => {
                    return <ListItem key={a.address} disablePadding onClick={() => handleClick(a.address)}>
                        <ListItemButton>
                            <ListItemIcon>
                                <WalletRounded />
                            </ListItemIcon>
                            <ListItemText>
                                {a.address + ' - ' + ((100 * a.ids.length) / 5555).toFixed(2) + '%'} - <b>{a.ids.length + ' Woofys Owned'}</b>
                            </ListItemText>
                        </ListItemButton>
                    </ListItem>
                })}
            </List>
        </Box>
    );
};

export default Wallet;
