import { Navigate, Route, Routes } from "react-router-dom";
import Board from "./pages/Boards/_id";
import NotFound from "./pages/404/NotFound";
import Auth from "./pages/Auth/Auth";

function App() {
    return (
        <Routes>
            {/* Redirect Route */}
            <Route
                path="/"
                element={
                    <Navigate
                        to="/boards/67ac616146ae7a46ed2c44ae"
                        replace={true}
                    />
                }
            />

            {/* Board Details */}
            <Route path="/boards/:boardId" element={<Board />} />

            {/* Authentication */}
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />

            {/* 404 not found page */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
