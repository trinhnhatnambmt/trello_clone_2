import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { ToastContainer } from "react-toastify";
import { ConfirmProvider } from "material-ui-confirm";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <ThemeProvider theme={theme}>
            <ConfirmProvider
                defaultOptions={{
                    allowClose: "false",
                    dialogProps: { maxWidth: "xs" },
                    cancellationButtonProps: { color: "inherit" },
                    confirmationButtonProps: {
                        color: "secondary",
                        variant: "outlined",
                    },
                }}
            >
                <CssBaseline />
                <App />
                <ToastContainer />
            </ConfirmProvider>
        </ThemeProvider>
    </Provider>
);
