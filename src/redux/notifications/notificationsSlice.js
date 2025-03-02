import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authorizedAxiosInstance from "~/utils/authorizeAxios";
import { API_ROOT } from "~/utils/constants";

const initialState = {
    currentNotifications: null,
};

export const fetchInvitationsAPI = createAsyncThunk(
    "notifications/fetchInvitationsAPI",
    async () => {
        const response = await authorizedAxiosInstance.get(
            `${API_ROOT}/v1/invitations`
        );
        return response.data;
    }
);
export const updateBoardInvitationAPI = createAsyncThunk(
    "notifications/updateBoardInvitationAPI",
    async ({ status, invitationId }) => {
        const response = await authorizedAxiosInstance.put(
            `${API_ROOT}/v1/invitations/board/${invitationId}`,
            { status }
        );
        return response.data;
    }
);

export const notificationsSlice = createSlice({
    name: "notifications",
    initialState,
    reducers: {
        clearCurrentNotifications: (state) => {
            state.currentNotifications = null;
        },
        updateCurrentNotifications: (state, action) => {
            state.currentNotifications = action.payload;
        },
        addNotification: (state, action) => {
            const incomingInvitation = action.payload;
            // unshift là thêm phần tử vào đầu mảng, ngược lại với push
            state.currentNotifications.unshift(incomingInvitation);
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchInvitationsAPI.fulfilled, (state, action) => {
            let incomingInvitations = action.payload;
            // Đoạn này đảo ngược lại mảng invitations nhận được, đơn giản là để hiện thị cái mới nhất lên đầu
            state.currentNotifications = Array.isArray(incomingInvitations)
                ? incomingInvitations.reverse()
                : [];
        });
        builder.addCase(updateBoardInvitationAPI.fulfilled, (state, action) => {
            let incomingInvitations = action.payload;
            // Cập nhật lại dữ liệu  boardInvitation (bên trong nó sẽ có Status mới sau khi update)
            const getInvitation = state.currentNotifications.find(
                (i) => i._id === incomingInvitations._id
            );
            getInvitation.boardInvitation = incomingInvitations.boardInvitation;
        });
    },
});

export const {
    clearCurrentNotifications,
    updateCurrentNotifications,
    addNotification,
} = notificationsSlice.actions;

export const selectCurrentNotifications = (state) => {
    return state.notifications.currentNotifications;
};

export const notificationsReducer = notificationsSlice.reducer;
