import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authorizedAxiosInstance from "~/utils/authorizeAxios";
import { isEmpty } from "lodash";
import { API_ROOT } from "~/utils/constants";
import { generatePlaceholderCard } from "~/utils/formatters";
import { mapOrder } from "~/utils/sort";

//Khởi tạo giá trị State của một Slice trong Redux
const initialState = {
    currentActiveBoard: null,
};

//Các hành động gọi api (bất đồng bộ) và cập nhật dữ liệu vào Redux, dùng Middleware createAsyncThunk đi kèm với extraReducers
export const fetchBoardDetailsAPI = createAsyncThunk(
    "activeBoard/fetchBoardDetailsAPI",
    async (boardId) => {
        const response = await authorizedAxiosInstance.get(
            `${API_ROOT}/v1/boards/${boardId}`
        );
        return response.data;
    }
);

//Khởi tạo một cái Slice trong kho lưu trữ Redux Store
export const activeBoardSlice = createSlice({
    name: "activeBoard",
    initialState,

    //Reducers: Nơi xử lí dữ liệu đồng bộ
    reducers: {
        updateCurrentActiveBoard: (state, action) => {
            // action.payload là chuẩn đặt tên nhận dữ liệu vào reducer, ở đây chúng ta gán nó ra một biến có ý nghĩa hơn
            const board = action.payload;

            // Xử lý dữ liệu nếu cần thiết
            //...

            // Update lại dữ liệu của cái currentActiveBoard
            state.currentActiveBoard = board;
        },
        updateCardInBoard: (state, action) => {
            // Update  nested data
            // https://redux-toolkit.js.org/usage/immer-reducers#updating-nested-data
            const inComingCard = action.payload;

            // Tìm dần từ board => column => card
            const column = state.currentActiveBoard.columns.find(
                (i) => i._id === inComingCard.columnId
            );
            if (column) {
                const card = column.cards.find(
                    (i) => i._id === inComingCard._id
                );
                if (card) {
                    // card.title = inComingCard.title;

                    /**
                     * Giải thích đoạn dưới:
                     * Đơn giản là chúng ta xài  Object.keys để lấy toàn bộ các properties (keys) của incomingCard về một Array
                     * rồi forEach nó ra
                     * Sau đó tùy vào trường hợp cần thì kiểm tra thêm còn không thì cập nhật ngược lại giá trị vào card luôn như bên dưới
                     */
                    Object.keys(inComingCard).forEach((key) => {
                        card[key] = inComingCard[key];
                    });
                }
            }
        },
    },

    //extraReducers: Nơi xử lí dữ liệu bất đồng bộ
    extraReducers: (builder) => {
        builder.addCase(fetchBoardDetailsAPI.fulfilled, (state, action) => {
            //action.payload chính là cái response.data trả về ở phía trên
            let board = action.payload;

            // Thành trong cái board sẽ là gộp lại của 2 mảng owner và member
            board.FE_allUsers = board.owners.concat(board.members);

            // Xử lý dữ liệu nếu cần thiết
            // Sắp xếp thứ tự các Column luôn ở đây trước khi đưa dữ liệu xuống bên dưới các component con
            board.columns = mapOrder(
                board.columns,
                board.columnOrderIds,
                "_id"
            );

            board.columns.forEach((column) => {
                //Khi f5 trang web thì cần xử lí vấn đề kéo thả vào một column rỗng
                if (isEmpty(column.cards)) {
                    column.cards = [generatePlaceholderCard(column)];
                    column.cardOrderIds = [generatePlaceholderCard(column)._id];
                } else {
                    column.cards = mapOrder(
                        column.cards,
                        column.cardOrderIds,
                        "_id"
                    );
                }
            });

            // Update lại dữ liệu của cái currentActiveBoard
            state.currentActiveBoard = board;
        });
    },
});

// Actions: Là nơi dành cho các components bên dưới gọi bằng dispatch() tới nó để cập nhật lại dữ liệu thông qua reducers (chạy đồng bộ)
export const { updateCurrentActiveBoard, updateCardInBoard } =
    activeBoardSlice.actions;

// Selectors: Là nơi dành cho các components bên dưới gọi bằng hook useSelector() để lấy dữ liệu trừ kho redux store ra để sử dụng
export const selectCurrentActiveBoard = (state) => {
    return state.activeBoard.currentActiveBoard;
};

export const activeBoardReducer = activeBoardSlice.reducer;
