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
import { useConfirm } from "material-ui-confirm";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUserAPI, selectCurrentUser } from "~/redux/user/userSlice";

function Profile() {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const dispatch = useDispatch();
    const currentUser = useSelector(selectCurrentUser);
    const confirmLogout = useConfirm();
    const handleLogout = () => {
        confirmLogout({
            description: "Log out of your account?",
            confirmationText: "Confirm",
            cancellationText: "Cancel",
            buttonOrder: ["confirm", "cancel"],
        })
            .then(() => {
                dispatch(logoutUserAPI());
            })
            .catch(() => {});
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
                        src={currentUser?.avatar}
                    ></Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                id="basic-menu-recent"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button-recent",
                }}
            >
                <MenuItem
                    sx={{
                        "&:hover": { color: "success.light" },
                    }}
                >
                    <Avatar
                        sx={{ width: 30, height: 32, marginRight: "5px" }}
                        src={currentUser?.avatar}
                    />{" "}
                    Profile
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
                <MenuItem
                    onClick={handleLogout}
                    sx={{
                        "&:hover": {
                            color: "warning.dark",
                            "& .logout-icon": { color: "warning.dark" },
                        },
                    }}
                >
                    <ListItemIcon>
                        <Logout className="logout-icon" fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default Profile;
