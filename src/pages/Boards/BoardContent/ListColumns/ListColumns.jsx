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

function ListColumns({
    columns,
    createdNewColumn,
    createNewCard,
    deleteColumnDetails,
}) {
    const [openNewColumnForm, setOpenNewColumnForm] = useState(false);
    const toggleOpenNewColumnForm = () =>
        setOpenNewColumnForm(!openNewColumnForm);

    const [newColumnTitle, setNewColumnTitle] = useState("");
    const addNewColumn = async () => {
        if (!newColumnTitle) {
            toast.error("Please enter column title!!!");
            return;
        }

        // Taọ dữ liệu Column để gọi API
        const newColumnData = {
            title: newColumnTitle,
        };

        await createdNewColumn(newColumnData);

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
                    <Columns
                        key={column._id}
                        column={column}
                        createNewCard={createNewCard}
                        deleteColumnDetails={deleteColumnDetails}
                    />
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
