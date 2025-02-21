import { Box, Button, TextField } from "@mui/material";
import Columns from "./Column/Column";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import {
    SortableContext,
    horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { createNewColumnAPI } from "~/apis";
import { generatePlaceholderCard } from "~/utils/formatters";
import { cloneDeep } from "lodash";
import {
    selectCurrentActiveBoard,
    updateCurrentActiveBoard,
} from "~/redux/activeBoard/activeBoardSlice";
import { useDispatch, useSelector } from "react-redux";

function ListColumns({ columns }) {
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
    const toggleOpenNewColumnForm = () =>
        setOpenNewColumnForm(!openNewColumnForm);

    const [newColumnTitle, setNewColumnTitle] = useState("");
    const dispatch = useDispatch();
    const board = useSelector(selectCurrentActiveBoard);

    const addNewColumn = async () => {
        if (!newColumnTitle) {
            toast.error("Please enter column title!!!");
            return;
        }

        // Taọ dữ liệu Column để gọi API
        const newColumnData = {
            title: newColumnTitle,
        };

        // Call API
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

        toggleOpenNewColumnForm();
        setNewColumnTitle("");
    };

    /**
     * Thằng SortableContext yêu cầu items là một mảng có dạng ["id-1", id-2] chứ ko phải kiểu [{id: id-1}, {id: id-2}]
     * Nếu không đúng thì vẫn chạy được thôi nhưng lại không có animation
     */
    return (
        <SortableContext
            items={columns?.map((c) => c._id)}
            strategy={horizontalListSortingStrategy}
        >
            <Box
                sx={{
                    bgcolor: "inherit",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    overflowX: "auto",
                    overflowY: "hidden",
                    "&::-webkit-scrollbar-track": { m: 2 },
                }}
            >
                {columns?.map((column) => (
                    <Columns key={column._id} column={column} />
                ))}

                {!openNewColumnForm ? (
                    <Box
                        sx={{
                            minWidth: "250px",
                            maxWidth: "250px",
                            mx: 2,
                            borderRadius: "6px",
                            height: "fit-content",
                            bgcolor: "#ffffff3d",
                        }}
                        onClick={toggleOpenNewColumnForm}
                    >
                        <Button
                            startIcon={<NoteAddIcon />}
                            sx={{
                                color: "#fff",
                                width: "100%",
                                justifyContent: "flex-start",
                                pl: 2.5,
                                py: 1,
                            }}
                        >
                            Add new column
                        </Button>
                    </Box>
                ) : (
                    <Box
                        sx={{
                            minWidth: "250px",
                            maxWidth: "250px",
                            mx: 2,
                            p: 1,
                            borderRadius: "6px",
                            height: "fit-content",
                            bgcolor: "#ffffff3d",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        <TextField
                            label="Enter column title..."
                            type="text"
                            size="small"
                            variant="outlined"
                            autoFocus
                            value={newColumnTitle}
                            onChange={(e) => setNewColumnTitle(e.target.value)}
                            sx={{
                                "& label": { color: "white" },
                                "& input": { color: "white" },
                                "& label.Mui-focused": { color: "white" },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": { borderColor: "white" },
                                    "&:hover fieldset": {
                                        borderColor: "white",
                                    },
                                    "&.Mui-focused fieldset": {
                                        borderColor: "white",
                                    },
                                },
                            }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <Button
                                className="interceptor-loading"
                                onClick={() => addNewColumn()}
                                variant="contained"
                                color="success"
                                size="small"
                                sx={{
                                    boxShadow: "none",
                                    bordEr: "0.5px solid",
                                    borderColor: (theme) =>
                                        theme.palette.success.main,
                                    "&:hover": {
                                        bgcolor: (theme) =>
                                            theme.palette.success.main,
                                    },
                                }}
                            >
                                Add Column
                            </Button>
                            <CloseIcon
                                fontSize="small"
                                sx={{
                                    color: "white",
                                    cursor: "pointer",
                                    "&:hover": {
                                        color: (theme) =>
                                            theme.palette.warning.light,
                                    },
                                }}
                                onClick={toggleOpenNewColumnForm}
                            />
                        </Box>
                    </Box>
                )}
            </Box>
        </SortableContext>
    );
}

export default ListColumns;
