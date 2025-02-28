import { createSlice } from "@reduxjs/toolkit";

//Khởi tạo giá trị State của một Slice trong Redux
const initialState = {
    currentActiveCard: null,
};

//Khởi tạo một cái Slice trong kho lưu trữ Redux Store
export const activeCardSlice = createSlice({
    name: "activeCard",
    initialState,

    //Reducers: Nơi xử lí dữ liệu đồng bộ
    reducers: {
        clearCurrentActiveCard: (state) => {
            state.currentActiveCard = null;
        },

        updateCurrentActiveCard: (state, action) => {
            // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có ý nghĩa hơn
            const fullCard = action.payload;

            // Xử lý dữ liệu nếu cần thiết
            //...

            // Update lại dữ liệu của cái currentActiveBoard
            state.currentActiveCard = fullCard;
        },
    },

    //extraReducers: Nơi xử lí dữ liệu bất đồng bộ
    extraReducers: (builder) => {},
});

export const { clearCurrentActiveCard, updateCurrentActiveCard } =
    activeCardSlice.actions;

export const selectCurrentActiveCard = (state) => {
    return state.activeCard.currentActiveCard;
};

export const activeCardReducer = activeCardSlice.reducer;
