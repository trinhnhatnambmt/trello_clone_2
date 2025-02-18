import { Box, CircularProgress, Container, Typography } from "@mui/material";
import AppBar from "~/components/AppBar/AppBar";
import BoardBar from "./BoardBar/BoardBar";
import BoardContent from "./BoardContent/BoardContent";
import { useEffect, useState } from "react";
import {
    createNewCardAPI,
    createNewColumnAPI,
    deleteColumnDetailsAPI,
    fetchBoardDetailsAPI,
    updateBoardDetailsAPI,
    updateCardToDifferentColumnAPI,
    updateColumnDetailsAPI,
} from "~/apis";
import { isEmpty } from "lodash";
import { generatePlaceholderCard } from "~/utils/formatters";
import { mapOrder } from "~/utils/sort";
import { toast } from "react-toastify";

function Board() {
    const [board, setBoard] = useState(null);

    useEffect(() => {
        const boardId = "67ac616146ae7a46ed2c44ae";
        fetchBoardDetailsAPI(boardId).then((board) => {
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
            setBoard(board);
        });
    }, []);

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
        const newBoard = { ...board };
        newBoard.columns.push(createdColumn);
        newBoard.columnOrderIds.push(createdColumn._id);
        setBoard(newBoard);
    };

    const createNewCard = async (newCardData) => {
        const createdCard = await createNewCardAPI({
            ...newCardData,
            boardId: board._id,
        });

        //Update state board
        const newBoard = { ...board };

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
        setBoard(newBoard);
    };

    const moveColumns = (dndOrderedColumns) => {
        const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);
        const newBoard = { ...board };
        newBoard.columns = dndOrderedColumns;
        newBoard.columnOrderIds = dndOrderedColumnsIds;
        setBoard(newBoard);

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
        const newBoard = { ...board };
        const columnToUpdate = newBoard.columns.find(
            (column) => column._id === columnId
        );
        if (columnToUpdate) {
            columnToUpdate.cards = dndOrderedCards;
            columnToUpdate.cardOrderIds = dndOrderedCardIds;
        }
        setBoard(newBoard);

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
        setBoard(newBoard);

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
        setBoard(newBoard);

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
