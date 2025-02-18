import { Avatar, AvatarGroup, Box, Button, Chip, Tooltip } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import FilterListIcon from "@mui/icons-material/FilterList";
import { AddToDrive, AutoAwesome } from "@mui/icons-material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { capitalizeFirstLetter } from "~/utils/formatters";

const MERN_STYLES = {
    color: "white",
    bgcolor: "transparent",
    border: "none",
    paddingX: "5px",
    borderRadius: "4px",
    ".MuiSvgIcon-root": {
        color: "white",
    },
    "&:hover": {
        bgcolor: "primary.50",
    },
};

function BoardBar({ board }) {
    return (
        <Box
            px={2}
            sx={{
                width: "100%",
                height: (theme) => theme.trello.boardBarHeight,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                overflowX: "auto",
                bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Tooltip title={board?.description}>
                    <Chip
                        sx={MERN_STYLES}
                        label={board?.title}
                        icon={<DashboardIcon />}
                        clickable
                    />
                </Tooltip>
                <Chip
                    sx={MERN_STYLES}
                    label={capitalizeFirstLetter(board?.type)}
                    icon={<VpnLockIcon />}
                    clickable
                />
                <Chip
                    sx={MERN_STYLES}
                    label="Add to Google Drive"
                    icon={<AddToDrive />}
                    clickable
                />
                <Chip
                    sx={MERN_STYLES}
                    label="Automation"
                    icon={<AutoAwesome />}
                    clickable
                />
                <Chip
                    sx={MERN_STYLES}
                    label="Filter"
                    icon={<FilterListIcon />}
                    clickable
                />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<PersonAddIcon />}
                    sx={{ color: "white", borderColor: "#fff" }}
                >
                    Invite
                </Button>

                <AvatarGroup
                    max={4}
                    sx={{
                        "& .MuiAvatar-root": {
                            width: 34,
                            height: 34,
                            fontSize: 16,
                        },
                    }}
                >
                    <Tooltip title="Avatar">
                        <Avatar
                            alt="Remy Sharp"
                            src="/static/images/avatar/1.jpg"
                        />
                    </Tooltip>{" "}
                    <Tooltip title="Avatar">
                        <Avatar
                            alt="Remy Sharp"
                            src="/static/images/avatar/1.jpg"
                        />
                    </Tooltip>{" "}
                    <Tooltip title="Avatar">
                        <Avatar
                            alt="Remy Sharp"
                            src="/static/images/avatar/1.jpg"
                        />
                    </Tooltip>{" "}
                    <Tooltip title="Avatar">
                        <Avatar
                            alt="Remy Sharp"
                            src="/static/images/avatar/1.jpg"
                        />
                    </Tooltip>{" "}
                    <Tooltip title="Avatar">
                        <Avatar
                            alt="Remy Sharp"
                            src="/static/images/avatar/1.jpg"
                        />
                    </Tooltip>
                </AvatarGroup>
            </Box>
        </Box>
    );
}

export default BoardBar;
