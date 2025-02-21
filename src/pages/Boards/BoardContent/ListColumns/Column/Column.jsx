import { Box, Button, TextField, Tooltip, Typography } from "@mui/material";
import {
    Cloud,
    ContentCopy,
    ContentCut,
    ContentPaste,
} from "@mui/icons-material";
import {
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
} from "@mui/material";
import { useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AddCardIcon from "@mui/icons-material/AddCard";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ListCards from "./ListCards/ListCards";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import { useConfirm } from "material-ui-confirm";
import { createNewCardAPI, deleteColumnDetailsAPI } from "~/apis";
import { cloneDeep } from "lodash";
import {
    selectCurrentActiveBoard,
    updateCurrentActiveBoard,
} from "~/redux/activeBoard/activeBoardSlice";
import { useDispatch, useSelector } from "react-redux";

function Column({ column }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: column._id, data: { ...column } });

    const dndKitColumnStyles = {
        //Nếu sử dụng CSS.Transform như doc thì sẽ bị lỗi stretch
        transform: CSS.Translate.toString(transform),
        transition,
        //Chiều cao phải luôn max 100% vì nếu không sẽ lỗi lúc kéo column ngắn qua một cái column dài
        //thì phải kéo ở khu vực giữa rất là khó chịu. Lưu ý lúc này kết hợp với {...listeners} nằm ở
        //Box chứ không phải ở div ngoài cùng để tránh trường hợp kéo vào vùng xanh
        height: "100%",
        opacity: isDragging ? 0.5 : undefined,
    };

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const orderedCards = column?.cards;

    const [openNewCardForm, setOpenNewCardForm] = useState(false);
    const toggleOpenNewCardForm = () => setOpenNewCardForm(!openNewCardForm);

    const [newCardTitle, setNewCardTitle] = useState("");

    const dispatch = useDispatch();
    const board = useSelector(selectCurrentActiveBoard);

    const addNewCard = async () => {
        if (!newCardTitle) {
            toast.error("Please enter card title!!!");
            return;
        }

        const newCardData = {
            title: newCardTitle,
            columnId: column._id,
        };

        //Call API
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

        toggleOpenNewCardForm();
        setNewCardTitle("");
    };

    const confirmDeleteColumn = useConfirm();
    const handleDeleteColumn = () => {
        confirmDeleteColumn({
            description: "Are you sure to delete this column!",
            confirmationText: "Confirm",
            cancellationText: "Cancel",
            buttonOrder: ["confirm", "cancel"],
        })
            .then(() => {
                //Update chuẩn dữ liệu state Board
                const newBoard = { ...board };
                newBoard.columns = newBoard.columns.filter(
                    (c) => c._id !== column._id
                );
                newBoard.columnOrderIds = newBoard.columnOrderIds.filter(
                    (_id) => _id !== column._id
                );
                dispatch(updateCurrentActiveBoard(newBoard));

                //Gọi API xử lí phía BE
                deleteColumnDetailsAPI(column._id).then((res) => {
                    toast.success(res?.deleteResult);
                });
            })
            .catch(() => {});
    };

    return (
        //Phải bọc div ở ngoài vì vấn đề chiều cao của column khi kéo thả sẽ có bug kiểu flickering
        <div ref={setNodeRef} style={dndKitColumnStyles} {...attributes}>
            <Box
                {...listeners}
                sx={{
                    minWidth: "300px",
                    maxWidth: "300px",
                    bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#333643" : "#ebecf0",
                    borderRadius: "6px",
                    ml: 2,
                    height: "fit-content",
                    maxHeight: (theme) =>
                        `calc(${
                            theme.trello.boardContentHeight
                        } - ${theme.spacing(5)})`,
                }}
            >
                {/* Box header */}
                <Box
                    sx={{
                        height: (theme) => theme.trello.columnHeaderHeight,
                        p: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "1rem",
                        }}
                    >
                        {column?.title}
                    </Typography>
                    <Box>
                        <Tooltip title="More options">
                            <ExpandMoreIcon
                                sx={{
                                    color: "text.primary",
                                    cursor: "pointer",
                                }}
                                id="basic-column-dropdown"
                                aria-controls={open ? "basic-menu" : undefined}
                                aria-haspopup="true"
                                aria-expanded={open ? "true" : undefined}
                                onClick={handleClick}
                            />
                        </Tooltip>
                        <Menu
                            id="basic-menu-menu-column-dropdown"
                            anchorEl={anchorEl}
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                            MenuListProps={{
                                "aria-labelledby": "basic-column-dropdown",
                            }}
                        >
                            <MenuItem
                                onClick={toggleOpenNewCardForm}
                                sx={{
                                    "&:hover": {
                                        color: "success.light",
                                        "& .add-card-icon": {
                                            color: "success.light",
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <AddCardIcon
                                        className="add-card-icon"
                                        fontSize="small"
                                    />
                                </ListItemIcon>
                                <ListItemText>Add new card</ListItemText>
                            </MenuItem>

                            <MenuItem>
                                <ListItemIcon>
                                    <ContentCut fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Cut</ListItemText>
                            </MenuItem>

                            <MenuItem>
                                <ListItemIcon>
                                    <ContentCopy fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Copy</ListItemText>
                            </MenuItem>

                            <MenuItem>
                                <ListItemIcon>
                                    <ContentPaste fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Paste</ListItemText>
                            </MenuItem>

                            <Divider />
                            <MenuItem>
                                <ListItemIcon>
                                    <Cloud fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Archive this column</ListItemText>
                            </MenuItem>
                            <MenuItem
                                onClick={handleDeleteColumn}
                                sx={{
                                    "&:hover": {
                                        color: "warning.dark",
                                        "& .delete-forever-icon": {
                                            color: "warning.dark",
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>
                                    <DeleteForeverIcon
                                        fontSize="small"
                                        className="delete-forever-icon"
                                    />
                                </ListItemIcon>
                                <ListItemText>Delete this column</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>

                {/* Box list card */}
                <ListCards cards={orderedCards} />

                {/* Box footer */}
                <Box
                    sx={{
                        height: (theme) => theme.trello.columnFooterHeight,
                        p: 2,
                    }}
                >
                    {!openNewCardForm ? (
                        <Box
                            sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button
                                startIcon={<AddCardIcon />}
                                onClick={toggleOpenNewCardForm}
                            >
                                Add new card
                            </Button>
                            <Tooltip title="Drag to move">
                                <DragHandleIcon />
                            </Tooltip>
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                height: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <TextField
                                label="Enter card title..."
                                type="text"
                                size="small"
                                variant="outlined"
                                autoFocus
                                data-no-dnd="true"
                                value={newCardTitle}
                                onChange={(e) =>
                                    setNewCardTitle(e.target.value)
                                }
                                sx={{
                                    "& label": { color: "text.primary" },
                                    "& input": {
                                        color: (theme) =>
                                            theme.palette.primary.main,
                                        bgcolor: (theme) =>
                                            theme.palette.mode === "dark"
                                                ? "#333643"
                                                : "white",
                                    },
                                    "& label.Mui-focused": {
                                        color: (theme) =>
                                            theme.palette.primary.main,
                                    },
                                    "& .MuiOutlinedInput-root": {
                                        "& fieldset": {
                                            borderColor: (theme) =>
                                                theme.palette.primary.main,
                                        },
                                        "&:hover fieldset": {
                                            borderColor: (theme) =>
                                                theme.palette.primary.main,
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: (theme) =>
                                                theme.palette.primary.main,
                                        },
                                    },
                                    "& .MuiOutlinedInput-input": {
                                        borderRadius: 1,
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
                                    onClick={() => addNewCard()}
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
                                    Add
                                </Button>
                                <CloseIcon
                                    fontSize="small"
                                    sx={{
                                        color: (theme) =>
                                            theme.palette.warning.light,
                                        cursor: "pointer",
                                    }}
                                    onClick={toggleOpenNewCardForm}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>
            </Box>
        </div>
    );
}

export default Column;
