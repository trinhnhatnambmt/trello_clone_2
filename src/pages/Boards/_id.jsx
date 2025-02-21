import { Box, CircularProgress, Container, Typography } from "@mui/material";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { useEffect } from "react";
import {
    updateBoardDetailsAPI,
    updateCardToDifferentColumnAPI,
    updateColumnDetailsAPI,
} from "~/apis";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchBoardDetailsAPI,
    selectCurrentActiveBoard,
    updateCurrentActiveBoard,
} from "~/redux/activeBoard/activeBoardSlice";
import { cloneDeep } from "lodash";
import { useParams } from "react-router-dom";

function Board() {
    const dispatch = useDispatch();
    const board = useSelector(selectCurrentActiveBoard);
    const { boardId } = useParams();

    useEffect(() => {
        //Call API
        dispatch(fetchBoardDetailsAPI(boardId));
    }, [dispatch, boardId]);

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
                    moveColumns={moveColumns}
                    moveCardInTheSameColumn={moveCardInTheSameColumn}
                    moveCardToDifferentColumn={moveCardToDifferentColumn}
                />
            </Container>
        </>
    );
}

export default Board;
