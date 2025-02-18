import { Logout, PersonAdd, Settings } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Tooltip,
} from "@mui/material";
import { useState } from "react";

function Profile() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    return (
        <Box>
            <Tooltip title="Account settings">
                <IconButton
                    onClick={handleClick}
                    size="small"
                    sx={{}}
                    aria-controls={open ? "account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                >
                    <Avatar
                        sx={{ width: 30, height: 32 }}
                        src="https://unsplash.com/photos/a-person-holding-a-nintendo-wii-game-controller-SCfDL1HxuEs"
                    ></Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                id="basic-menu-recent"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button-recent",
                }}
            >
                <MenuItem>
                    <Avatar
                        sx={{ width: 30, height: 32, marginRight: "5px" }}
                    />{" "}
                    Profile
                </MenuItem>
                <MenuItem>
                    <Avatar
                        sx={{ width: 30, height: 32, marginRight: "5px" }}
                    />
                    My account
                </MenuItem>
                <Divider />
                <MenuItem>
                    <ListItemIcon>
                        <PersonAdd fontSize="small" />
                    </ListItemIcon>
                    Add another account
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default Profile;
