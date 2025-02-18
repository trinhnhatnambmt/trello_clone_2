import { Box, CircularProgress, Container, Typography } from "@mui/material";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { useEffect } from "react";
import {
    createNewCardAPI,
    createNewColumnAPI,
    deleteColumnDetailsAPI,
    updateBoardDetailsAPI,
    updateCardToDifferentColumnAPI,
    updateColumnDetailsAPI,
} from "~/apis";
import { generatePlaceholderCard } from "~/utils/formatters";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBoardDetailsAPI,
    selectCurrentActiveBoard,
    updateCurrentActiveBoard,
} from "~/redux/activeBoard/activeBoardSlice";
import { cloneDeep } from "lodash";

function Board() {
    const dispatch = useDispatch();

    //Ko dùng State của component nữa mà chuyển sang dùng State của Redux
    // const [board, setBoard] = useState(null);
    const board = useSelector(selectCurrentActiveBoard);

    useEffect(() => {
        const boardId = "67ac616146ae7a46ed2c44ae";
        //Call API
        dispatch(fetchBoardDetailsAPI(boardId));
    }, [dispatch]);

    const createNewColumn = async (newColumnData) => {
        const createdColumn = await createNewColumnAPI({
            ...newColumnData,
            boardId: board._id,
        });

        createdColumn.cards = [generatePlaceholderCard(createdColumn)];
        createdColumn.cardOrderIds = [
            generatePlaceholderCard(createdColumn)._id,
        ];

        //Update state board
        /**
         * Đoạn này sẽ dính lỗi object is not extensible bởi dù đã copy/clone ra giá trị newBoard nhưng bản chất
         * của spread operator là Shallow Copy (copy nông), nên dính phải rules Immutability trong Redux toolkit không
         * dùng đc hàm PUSH (sửa giá trị mảng trực tiếp), cách đơn giản nhanh gọn nhất ở trong trưởng hợp này của chúng ta
         * là dùng tới Deep Copy toàn bộ cái Board cho dễ hiểu và code ngắn gọn.
         */
        // const newBoard = { ...board };
        const newBoard = cloneDeep(board);
        newBoard.columns.push(createdColumn);
        newBoard.columnOrderIds.push(createdColumn._id);

        /**
         * Ngoài ra còn cách nữa là vẫn có thể dùng array.concat thay cho push như docs của Redux Toolkit ở trên vì
         * push như đã nói nó sẽ thay đổi giá trị mảng trực tiếp, còn thằng concat thì nó merge - ghép mảng lại và
         * tạo ra một mảng mới để chúng ra gán lại giá trị nên không vấn đề gì.
         */
        // const newBoard = { ...board };
        // newBoard.columns = newBoard.columns.concat([createdColumn]);
        // newBoard.columnOrderIds = newBoard.columnOrderIds.concat([
        //     createdColumn._id,
        // ]);

        dispatch(updateCurrentActiveBoard(newBoard));
    };

    const createNewCard = async (newCardData) => {
        const createdCard = await createNewCardAPI({
            ...newCardData,
            boardId: board._id,
        });

        //Update state board
        // const newBoard = { ...board };
        const newBoard = cloneDeep(board);

        const columnToUpdate = newBoard.columns.find(
            (column) => column._id === createdCard.columnId
        );
        if (columnToUpdate) {
            // Nếu column rỗng: bản chất là đang chứa một cái Placeholder card
            if (columnToUpdate.cards.some((card) => card.FE_PlaceholderCard)) {
                columnToUpdate.cards = [createdCard];
                columnToUpdate.cardOrderIds = [createdCard._id];
            } else {
                columnToUpdate.cards.push(createdCard);
                columnToUpdate.cardOrderIds.push(createdCard._id);
            }
        }
        dispatch(updateCurrentActiveBoard(newBoard));
    };

    const moveColumns = (dndOrderedColumns) => {
        const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);

        /**
         * Trường hợp dùng Spread Operator này thì không sao bởi vì ở đây chúng ta không dùng push như ở trên
         * làm thây đổi trực tiếp kiểu mở rộng mảng, mà chỉ đang gán lại toàn bộ giá trị columns và columnOrderIds
         * bằng 2 mảng mới. Tương tự như cách làm concat ở trường hợp createNewColumn thôi :))
         */
        const newBoard = { ...board };
        newBoard.columns = dndOrderedColumns;
        newBoard.columnOrderIds = dndOrderedColumnsIds;
        dispatch(updateCurrentActiveBoard(newBoard));

        // Call API update boards
        updateBoardDetailsAPI(newBoard._id, {
            columnOrderIds: dndOrderedColumnsIds,
        });
    };

    const moveCardInTheSameColumn = (
        dndOrderedCards,
        dndOrderedCardIds,
        columnId
    ) => {
        // Update cho chuẩn dữ liệu state Board
        // const newBoard = { ...board };

        const newBoard = cloneDeep(board);
        const columnToUpdate = newBoard.columns.find(
            (column) => column._id === columnId
        );
        if (columnToUpdate) {
            columnToUpdate.cards = dndOrderedCards;
            columnToUpdate.cardOrderIds = dndOrderedCardIds;
        }
        dispatch(updateCurrentActiveBoard(newBoard));

        // Gọi API update Column
        updateColumnDetailsAPI(columnId, {
            cardOrderIds: dndOrderedCardIds,
        });
    };

    /**
     * Khi di chuyển card sang một Column khác:
     * B1: Cập nhật mảng cardOrderIds của Column ban đầu chứa nó (Hiểu bản chất là xóa cái _id của Card ra khỏi mảng)
     * B2: Cập nhật mảng cardOrderIds của Column tiếp theo (Hiểu bản chất là thêm _id của Card vào mảng)
     * B3: Cập nhật lại trường columnId mới của cái Card đã kéo
     * => Làm một API support riêng
     *
     */
    const moveCardToDifferentColumn = (
        currentCardId,
        prevColumnId,
        nextColumnId,
        dndOrderedColumns
    ) => {
        // Update cho chuẩn dữ liệu state Board
        const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
        const newBoard = { ...board };
        newBoard.columns = dndOrderedColumns;
        newBoard.columnOrderIds = dndOrderedColumnsIds;
        dispatch(updateCurrentActiveBoard(newBoard));

        //Goị API xử lí phía BE
        let prevCardOrderIds = dndOrderedColumns.find(
            (c) => c._id === prevColumnId
        )?.cardOrderIds;
        // Xử lý vấn đề khi kéo Card cuối cùng ra khỏi Column, Column rỗng sẽ có placeholder card, cần xóa nó đi trước khi gửi dữ liệu lên cho phía BE
        if (prevCardOrderIds[0].includes("placeholder-card")) {
            prevCardOrderIds = [];
        }

        updateCardToDifferentColumnAPI({
            currentCardId,
            prevColumnId,
            prevCardOrderIds: prevCardOrderIds,
            nextColumnId,
            nextCardOrderIds: dndOrderedColumns.find(
                (c) => c._id === nextColumnId
            )?.cardOrderIds,
        });
    };

    const deleteColumnDetails = (columnId) => {
        //Update chuẩn dữ liệu state Board
        const newBoard = { ...board };
        newBoard.columns = newBoard.columns.filter((c) => c._id !== columnId);
        newBoard.columnOrderIds = newBoard.columnOrderIds.filter(
            (_id) => _id !== columnId
        );
        dispatch(updateCurrentActiveBoard(newBoard));

        //Gọi API xử lí phía BE
        deleteColumnDetailsAPI(columnId).then((res) => {
            toast.success(res?.deleteResult);
        });
    };

    if (!board) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    width: "100vw",
                    height: "100vh",
                }}
            >
                <CircularProgress />
                <Typography>Loading Board...</Typography>
            </Box>
        );
    }

    return (
        <>
            <Container disableGutters maxWidth="false" sx={{ height: "100vh" }}>
                <AppBar />
                <BoardBar board={board} />
                <BoardContent
                    board={board}
                    createdNewColumn={createNewColumn}
                    createNewCard={createNewCard}
                    moveColumns={moveColumns}
                    moveCardInTheSameColumn={moveCardInTheSameColumn}
                    moveCardToDifferentColumn={moveCardToDifferentColumn}
                    deleteColumnDetails={deleteColumnDetails}
                />
            </Container>
        </>
    );
}

export default Board;
