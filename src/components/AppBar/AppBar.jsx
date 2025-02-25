import {
    Badge,
    Box,
    Button,
    IconButton,
    InputAdornment,
    SvgIcon,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import ModeSelect from "../ModeSelect/ModeSelect";
import AppsIcon from "@mui/icons-material/Apps";
import TrelloIcon from "~/assets/trello.svg?react";
import WorkSpaces from "./Menus/WorkSpaces";
import Recent from "./Menus/Recent";
import Starred from "./Menus/Starred";
import Templates from "./Menus/Templates";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import Profile from "./Menus/Profile";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { Link } from "react-router-dom";
function AppBar() {
    const [searchValue, setSearchValue] = useState("");
    return (
        <Box
            px={2}
            sx={{
                width: "100%",
                height: (theme) => theme.trello.appBarHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                overflowX: "auto",
                bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "#2c3e50" : "#1565c0",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Link to="/boards">
                    <Tooltip title="Board List">
                        <AppsIcon
                            sx={{ color: "white", verticalAlign: "middle" }}
                        />
                    </Tooltip>
                </Link>
                <Link to="/">
                    <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                        <SvgIcon
                            component={TrelloIcon}
                            inheritViewBox
                            fontSize="small"
                            sx={{ color: "white" }}
                        />
                        <Typography
                            variant="span"
                            sx={{
                                fontSize: "1.2rem",
                                fontWeight: "bold",
                                color: "white",
                            }}
                        >
                            Trello
                        </Typography>
                    </Box>
                </Link>
                <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1 }}>
                    <WorkSpaces />
                    <Recent />
                    <Starred />
                    <Templates />
                    <Button
                        sx={{ color: "white", borderColor: "white" }}
                        variant="outlined"
                    >
                        Create
                    </Button>
                </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <TextField
                    id="outlined-search"
                    label="Search..."
                    placeholder="Search..."
                    type="text"
                    size="small"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    sx={{
                        minWidth: "120px",
                        maxWidth: "170px",
                        "& label": { color: "white" },
                        "& input": { color: "white" },
                        "& label.Mui-focused": { color: "white" },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "white" },
                            "&:hover fieldset": { borderColor: "white" },
                            "&.Mui-focused fieldset": { borderColor: "white" },
                        },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: "white" }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <CloseIcon
                                        sx={{
                                            color: searchValue
                                                ? "white"
                                                : "transparent",
                                            fontSize: "medium",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => setSearchValue("")}
                                    />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                <ModeSelect />
                <Tooltip title="Notification" sx={{ cursor: "pointer" }}>
                    <IconButton>
                        <Badge color="error" variant="dot">
                            <NotificationsNoneIcon sx={{ color: "white" }} />
                        </Badge>
                    </IconButton>
                </Tooltip>
                <Tooltip title="Notification" sx={{ cursor: "pointer" }}>
                    <IconButton>
                        <HelpOutlineIcon sx={{ color: "white" }} />
                    </IconButton>
                </Tooltip>
                <Profile />
            </Box>
        </Box>
    );
}

export default AppBar;
