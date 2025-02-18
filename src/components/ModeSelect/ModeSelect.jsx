import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsBrightnessOutlinedIcon from "@mui/icons-material/SettingsBrightnessOutlined";
import { Box, useColorScheme } from "@mui/material";

function ModeSelect() {
    const { mode, setMode } = useColorScheme();
    const handleChange = (event) => {
        const selected = event.target.value;
        setMode(selected);
    };

    return (
        <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel id="demo-select-dark-light-mode">Mode</InputLabel>
            <Select
                labelId="demo-select-dark-light-mode"
                id="demo-select-mode"
                value={mode}
                label="Mode"
                onChange={handleChange}
                sx={{
                    color: "white",
                    ".MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "white",
                    },
                    ".MuiSvgIcon-root": { color: "white" },
                    ".MuiInputLabel-root": { color: "white" },
                }}
            >
                <MenuItem value="light">
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <LightModeIcon fontSize="small" />
                        Light
                    </Box>
                </MenuItem>
                <MenuItem value="dark">
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <DarkModeOutlinedIcon fontSize="small" />
                        Dark
                    </Box>
                </MenuItem>
                <MenuItem value="system">
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                    >
                        <SettingsBrightnessOutlinedIcon fontSize="small" />
                        System
                    </Box>
                </MenuItem>
            </Select>
        </FormControl>
    );
}

export default ModeSelect;
