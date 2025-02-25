import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import authorizedAxiosInstance from "~/utils/authorizeAxios";
import { API_ROOT } from "~/utils/constants";

//Khởi tạo giá trị State của một Slice trong Redux
const initialState = {
    currentUser: null,
};

//Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
export const loginUserAPI = createAsyncThunk(
    "user/loginUserAPI",
    async (data) => {
        const response = await authorizedAxiosInstance.post(
            `${API_ROOT}/v1/users/login`,
            data
        );
        return response.data;
    }
);

// Logout user
export const logoutUserAPI = createAsyncThunk(
    "user/logoutUserAPI",
    async (showSuccessMessage = true) => {
        const response = await authorizedAxiosInstance.delete(
            `${API_ROOT}/v1/users/logout`
        );
        if (showSuccessMessage) {
            toast.success("Logged out successfully");
        }
        return response.data;
    }
);

// Update user
export const updateUserAPI = createAsyncThunk(
    "user/updateUserAPI",
    async (data) => {
        const response = await authorizedAxiosInstance.put(
            `${API_ROOT}/v1/users/update`,
            data
        );
        return response.data;
    }
);

//Khởi tạo một cái Slice trong kho lưu trữ Redux Store
export const userSlice = createSlice({
    name: "user",
    initialState,

    //Reducers: Nơi xử lí dữ liệu đồng bộ
    reducers: {},

    //extraReducers: Nơi xử lí dữ liệu bất đồng bộ
    extraReducers: (builder) => {
        builder.addCase(loginUserAPI.fulfilled, (state, action) => {
            //action.payload chính là cái response.data trả về ở phía trên
            const user = action.payload;

            state.currentUser = user;
        });
        builder.addCase(logoutUserAPI.fulfilled, (state) => {
            // API logout sau khi gọi thành công thì sẽ clear thông tin currentUser về null ở đây
            // Kết hợp ProtectedRoute đã làm ở App.js => code sẽ điều hướng chuẩn về trang login
            state.currentUser = null;
        });
        builder.addCase(updateUserAPI.fulfilled, (state, action) => {
            const user = action.payload;
            state.currentUser = user;
        });
    },
});

// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducers (chạy đồng bộ)
// export const {} = userSlice.actions;

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu trừ kho redux store ra để sử dụng
export const selectCurrentUser = (state) => {
    return state.user.currentUser;
};

export const userReducer = userSlice.reducer;
