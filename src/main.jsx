import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import GlobalStyles from "@mui/material/GlobalStyles";
import { ToastContainer } from "react-toastify";
import { ConfirmProvider } from "material-ui-confirm";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";

// Cấu hình react-router-dom với Browser router
import { BrowserRouter } from "react-router-dom";

import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";

const persistor = persistStore(store);

// Kỹ thuật Inject Store: là kỹ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vi component
import { injectStore } from "./utils/authorizeAxios.js";
injectStore(store);

import { io } from "socket.io-client";
import { API_ROOT } from "./utils/constants.js";

export const socketIoInstance = io(API_ROOT);

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <PersistGate persistor={persistor}>
            <BrowserRouter basename="/">
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
                        <GlobalStyles
                            styles={{ a: { textDecoration: "none" } }}
                        />
                        <CssBaseline />
                        <App />
                        <ToastContainer />
                    </ConfirmProvider>
                </ThemeProvider>
            </BrowserRouter>
        </PersistGate>
    </Provider>
);
