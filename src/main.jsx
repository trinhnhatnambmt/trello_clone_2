import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
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

createRoot(document.getElementById("root")).render(
    <BrowserRouter basename="/">
        <Provider store={store}>
            <PersistGate persistor={persistor}>
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
            </PersistGate>
        </Provider>
    </BrowserRouter>
);
