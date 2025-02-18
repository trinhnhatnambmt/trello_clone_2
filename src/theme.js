import { createTheme } from "@mui/material/styles";

const APP_BAR_HEIGHT = "58px";
const BOARD_BAR_HEIGHT = "60px";
const BOARD_CONTENT_HEIGHT = `calc(100vh - ${APP_BAR_HEIGHT} - ${BOARD_BAR_HEIGHT})`;
const COLUMN_HEADER_HEIGHT = "50px";
const COLUMN_FOOTER_HEIGHT = "56px";

// Create a theme instance.
const theme = createTheme({
    trello: {
        appBarHeight: APP_BAR_HEIGHT,
        boardBarHeight: BOARD_BAR_HEIGHT,
        boardContentHeight: BOARD_CONTENT_HEIGHT,
        columnHeaderHeight: COLUMN_HEADER_HEIGHT,
        columnFooterHeight: COLUMN_FOOTER_HEIGHT,
    },
    colorSchemes: {
        dark: {},
        light: {},
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    "*::-webkit-scrollbar": {
                        width: "8px",
                        height: "8px",
                    },
                    "*::-webkit-scrollbar-thumb": {
                        backgroundColor: "#bdc3c7",
                        borderRadius: "8px",
                    },
                    "*::-webkit-scrollbar-track": {
                        margin: "18px",
                    },
                    "*::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#00b894",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderWidth: "0.5px",
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: ({ theme }) => ({
                    color: "white",
                    fontSize: "0.875rem",
                }),
            },
        },
        MuiTypography: {
            styleOverrides: {
                root: ({ theme }) => ({
                    "&.MuiTypography-body1": {
                        fontSize: "0.875rem",
                    },
                }),
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: ({ theme }) => ({
                    fontSize: "0.875rem",

                    "& fieldset": {
                        borderWidth: "0.5px !important",
                    },
                    "&:hover fieldset": {
                        borderWidth: "1px !important",
                    },
                    "&.Mui-focused fieldset": {
                        borderWidth: "1px !important",
                    },
                }),
            },
        },
    },
});

export default theme;
