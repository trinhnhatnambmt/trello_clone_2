import {
    Cloud,
    ContentCopy,
    ContentCut,
    ContentPaste,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Typography,
} from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function Starred() {
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
            <Button
                sx={{ color: "white" }}
                id="basic-button-starred"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                endIcon={<ExpandMoreIcon />}
            >
                Starred
            </Button>
            <Menu
                id="basic-menu-starred"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button-starred",
                }}
            >
                <MenuItem>
                    <ListItemIcon>
                        <ContentCut fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Cut</ListItemText>
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                    >
                        ⌘X
                    </Typography>
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <ContentCopy fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Copy</ListItemText>
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                    >
                        ⌘C
                    </Typography>
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <ContentPaste fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Paste</ListItemText>
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary" }}
                    >
                        ⌘V
                    </Typography>
                </MenuItem>
                <Divider />
                <MenuItem>
                    <ListItemIcon>
                        <Cloud fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Web Clipboard</ListItemText>
                </MenuItem>
            </Menu>
        </Box>
    );
}

export default Starred;
