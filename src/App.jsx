import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Board from "./pages/Boards/_id";
import NotFound from "./pages/404/NotFound";
import Auth from "./pages/Auth/Auth";
import AccountVerification from "./pages/Auth/AccountVerification";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "./redux/user/userSlice";

const ProtectedRoute = ({ user }) => {
    if (!user) {
        return <Navigate to="/login" replace={true} />;
    }
    return <Outlet />;
};

function App() {
    const currentUser = useSelector(selectCurrentUser);

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

            {/* Protected Routes (Hiểu đơn giản trong dự án của chúng ta là các route chỉ cho truy cập sau khi đã login) */}
            <Route element={<ProtectedRoute user={currentUser} />}>
                {/* Board Details */}
                {/* <Outlet/> của react-router-dom sẽ chạy vào các child route trong này */}
                <Route path="/boards/:boardId" element={<Board />} />
            </Route>

            {/* Authentication */}
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            <Route
                path="/account/verification"
                element={<AccountVerification />}
            />

            {/* 404 not found page */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
