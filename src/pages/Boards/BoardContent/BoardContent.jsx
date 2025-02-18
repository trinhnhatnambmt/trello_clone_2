import { Box } from "@mui/material";

import ListColumns from "./ListColumns/ListColumns";
import {
    closestCorners,
    defaultDropAnimationSideEffects,
    DndContext,
    DragOverlay,
    getFirstCollision,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "./ListColumns/Column/Column";
import Card from "./ListColumns/Column/ListCards/Card/Card";
import { cloneDeep, isEmpty } from "lodash";
import { generatePlaceholderCard } from "~/utils/formatters";

const ACTIVE_DRAG_ITEM_TYPE = {
    COLUMN: "ACTIVE_DRAG_ITEM_TYPE_COLUMN",
    CARD: "ACTIVE_DRAG_ITEM_TYPE_CARD",
};

function BoardContent({
    board,
    moveColumns,
    moveCardInTheSameColumn,
    moveCardToDifferentColumn,
}) {
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: {
            distance: 10,
        },
    });
    const sensors = useSensors(pointerSensor);

    const [orderedColumns, setOrderedColumns] = useState([]);

    //Cùng một thời điểm chỉ có một phần tử đang được kéo (Column hoặc Card)
    const [activeDragItemId, setActiveDragItemId] = useState(null);
    const [activeDragItemType, setActiveDragItemType] = useState(null);
    const [activeDragItemData, setActiveDragItemData] = useState(null);
    const [oldColumnWhenDraggingCard, setOldColumnWhenDraggingCard] =
        useState(null);

    // Điểm va chạm cuối cùng trước đó xử lí thuật toán phát hiện va chạm
    const lastOverId = useRef(null);

    useEffect(() => {
        setOrderedColumns(board?.columns);
    }, [board]);

    //Tìm một cái column theo CardId
    const findColumnByCardId = (cardId) => {
        // Đoạn này cần lưu ý, nên dùng c.cards thay vì c.cardOrderIds bởi vì ở bước handleDragover chúng ta sẽ làm
        //dữ liệu cho cards hoàn chỉnh trước rồi mới tạo ra cardOrderIds mới
        return orderedColumns.find((column) =>
            column.cards.map((card) => card._id)?.includes(cardId)
        );
    };

    // Function chung xử lí việc cập nhập lại state trong trường hợp di chuyển Card giữa các Column khác nhau
    const moveCardBetweenDifferentColumns = (
        overColumn,
        overCardId,
        active,
        over,
        activeColumn,
        activeDraggingCardId,
        activeDraggingCardData,
        triggerFrom
    ) => {
        setOrderedColumns((prevColumns) => {
            //Tìm vị trí (index) của cái overCard trong column đích (nơi mà cái activeCard sẽ đc thả)

            const overCardIndex = overColumn?.cards?.findIndex(
                (card) => card._id === overCardId
            );

            //Logic tính toán cardIndex mới (khó hiểu vcl)
            let newCardIndex;
            const isBelowOverItem =
                active.rect.current.translated &&
                active.rect.current.translated.top >
                    over.rect.top + over.rect.height;
            const modifier = isBelowOverItem ? 1 : 0;
            newCardIndex =
                overCardIndex >= 0
                    ? overCardIndex + modifier
                    : overColumn?.cards?.length + 1;

            // Clone mảng OrderedColumnsState cũ ra một cái mới để xử lí data rồi mới return - cập nhật lại OrderedColumnsState mới
            const nextColumns = cloneDeep(prevColumns);
            const nextActiveColumn = nextColumns.find(
                (column) => column._id === activeColumn._id
            );

            const nextOverColumn = nextColumns.find(
                (column) => column._id === overColumn._id
            );

            //Column cũ
            if (nextActiveColumn) {
                //Xóa card ở cái column active (cũng có thể hiểu là column cũ, cái lúc mà kéo card ra khỏi nó để sang một column khác )
                nextActiveColumn.cards = nextActiveColumn.cards.filter(
                    (card) => card._id !== activeDraggingCardId
                );

                //Thêm Placeholder Card nếu Column rỗng: Bị kéo hết Card đi, ko còn cái nào nữa
                if (isEmpty(nextActiveColumn.cards)) {
                    nextActiveColumn.cards = [
                        generatePlaceholderCard(nextActiveColumn),
                    ];
                }

                //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
                nextActiveColumn.cardOrderIds = nextActiveColumn.cards.map(
                    (card) => card._id
                );
            }

            //Column mới
            if (nextOverColumn) {
                //Kiểm tra xem card đang kéo nó có tồn tại ở overColumn chưa , nếu có thì xóa đi
                nextOverColumn.cards = nextOverColumn.cards.filter(
                    (card) => card._id !== activeDraggingCardId
                );

                //Phải cập nhật lại chuẩn dữ liệu columnId trong card sau khi kéo card giữa 2 column khác nhau
                const rebuild_activeDraggingCardData = {
                    ...activeDraggingCardData,
                    columnId: nextOverColumn._id,
                };

                //Tiếp theo là thêm cái card đang kéo vào overColumn theo vị trí index mới
                nextOverColumn.cards = nextOverColumn.cards.toSpliced(
                    newCardIndex,
                    0,
                    rebuild_activeDraggingCardData
                );

                //Xóa Placeholder Card đi nếu nó đang tồn tại
                nextOverColumn.cards = nextOverColumn.cards.filter(
                    (card) => !card.FE_PlaceholderCard
                );

                //Cập nhật lại mảng cardOrderIds cho chuẩn dữ liệu
                nextOverColumn.cardOrderIds = nextOverColumn.cards.map(
                    (card) => card._id
                );
            }

            //Nếu function này được gọi từ handleDragEnd nghĩa là đã kéo thả xong, lúc này mới xử lí gọi API 1 làn ở đây
            if (triggerFrom === "handleDragEnd") {
                moveCardToDifferentColumn(
                    activeDraggingCardId,
                    oldColumnWhenDraggingCard._id,
                    nextOverColumn._id,
                    nextColumns
                );
            }

            return nextColumns;
        });
    };

    //Trigger khi bắt đầu kéo 1 phần tử
    const handleDragStart = (event) => {
        // console.log("Handle drag start: ", event);
        setActiveDragItemId(event?.active?.id);
        setActiveDragItemType(
            event?.active?.data?.current?.columnId
                ? ACTIVE_DRAG_ITEM_TYPE.CARD
                : ACTIVE_DRAG_ITEM_TYPE.COLUMN
        );
        setActiveDragItemData(event?.active?.data?.current);

        //Nếu ta kéo card thì mới thực hiện hành động set giá trị oldColumn
        if (event?.active?.data?.current?.columnId) {
            setOldColumnWhenDraggingCard(findColumnByCardId(event?.active?.id));
        }
    };

    //Trigger trong quá trình kéo 1 phần tử
    const handleDragOver = (event) => {
        //Không làm gì nếu đang kéo Column
        if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) return;

        //Còn nếu kéo card thì chúng ta xử lí thêm để có thể kéo card giữa các column
        // console.log("Handle drag over: ", event);

        const { active, over } = event;

        //Kiểm tra nếu không tồn tại over và active (kéo ra ngoài linh tinh thì return luôn tránh lỗi)
        if (!over || !active) return;

        //activeDraggingCard: là cái card đang được kéo
        const {
            id: activeDraggingCardId,
            data: { current: activeDraggingCardData },
        } = active;

        //overCard: là cái card đang tương tác trên hoặc dưới so cái card được kéo
        const { id: overCardId } = over;

        //Tìm 2 cái columns theo cardId
        const activeColumn = findColumnByCardId(activeDraggingCardId);
        const overColumn = findColumnByCardId(overCardId);

        //Nếu không tồn tại một trong hai column thì không làm gì hết
        if (!activeColumn || !overColumn) return;

        //Xử lí logic ở đây là khi kéo card qua 2 column khác nhau còn nếu ở trong cùng column thì nó không làm gì
        //Vì đây đang đoạn xử lí lúc kéo (handleDragOver), còn xử lí lúc kéo xong xuôi thì nó lại là vấn đề khác ở handleDragEnd
        if (activeColumn._id !== overColumn._id) {
            moveCardBetweenDifferentColumns(
                overColumn,
                overCardId,
                active,
                over,
                activeColumn,
                activeDraggingCardId,
                activeDraggingCardData,
                "handleDragOver"
            );
        }
    };

    //Trigger khi kết thức hành động kéo một phần tử => hành động thả
    const handleDragEnd = (event) => {
        // console.log("Handle drag end: ", event);

        const { active, over } = event;
        //Kiểm tra nếu không tồn tại over và active (kéo ra ngoài linh tinh thì return luôn tránh lỗi)
        if (!over || !active) return;

        //Xử lí kéo thả Cards
        if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD) {
            const {
                id: activeDraggingCardId,
                data: { current: activeDraggingCardData },
            } = active;

            //overCard: là cái card đang tương tác trên hoặc dưới so cái card được kéo
            const { id: overCardId } = over;

            //Tìm 2 cái columns theo cardId
            const activeColumn = findColumnByCardId(activeDraggingCardId);
            const overColumn = findColumnByCardId(overCardId);

            //Nếu không tồn tại một trong hai column thì không làm gì hết
            if (!activeColumn || !overColumn) return;

            //Hành động kéo thả card giữa 2 column khác nhau
            //Phải dùng tới activeDragItemData.columnId hoặc oldColumnWhenDraggingCard._id(set vào state từ bước handleDragStart)
            //chứ không phải phải activeData trong scope handleDragEnd này bởi vì sau khi đi qua handleDragOver nó đã bị cập nhật state lại rồi
            if (oldColumnWhenDraggingCard._id !== overColumn._id) {
                moveCardBetweenDifferentColumns(
                    overColumn,
                    overCardId,
                    active,
                    over,
                    activeColumn,
                    activeDraggingCardId,
                    activeDraggingCardData,
                    "handleDragEnd"
                );
            } else {
                //Hành động kéo thả card trong cùng 1 cái column

                //Lấy vị trí cũ (từ thằng oldColumnWhenDraggingCard)
                const oldCardIndex =
                    oldColumnWhenDraggingCard?.cards?.findIndex(
                        (c) => c._id === activeDragItemId
                    );
                // Lấy vị trí mới từ thằng over
                const newCardIndex = overColumn?.cards?.findIndex(
                    (c) => c._id === overCardId
                );

                //Dùng arrayMove vì kéo card trong một Column thì tương tự kéo Column trong 1 cái boardContent
                const dndOrderedCards = arrayMove(
                    oldColumnWhenDraggingCard?.cards,
                    oldCardIndex,
                    newCardIndex
                );

                const dndOrderedCardIds = dndOrderedCards.map(
                    (card) => card._id
                );

                //Clone mảng OrderedColumnsState cũ ra một cái mới để xử lí data rồi return - cập nhật lại OrderedColumnState mới
                setOrderedColumns((prevColumns) => {
                    const nextColumns = cloneDeep(prevColumns);

                    //Tìm column chúng ta đang thả
                    const targetColumn = nextColumns.find(
                        (c) => c._id === overColumn._id
                    );

                    targetColumn.cards = dndOrderedCards;
                    targetColumn.cardOrderIds = dndOrderedCardIds;

                    //Trả về giá trị state mới chuẩn vị trí
                    return nextColumns;
                });

                moveCardInTheSameColumn(
                    dndOrderedCards,
                    dndOrderedCardIds,
                    oldColumnWhenDraggingCard._id
                );
            }
        }

        //Xử lí kéo thả Columns
        if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
            //Nếu vị trí sau khi kéo thả khác với vị trí ban đầu
            if (active.id !== over.id) {
                // Lấy vị trí cũ từ thắng active
                const oldColumnIndex = orderedColumns.findIndex(
                    (c) => c._id === active.id
                );
                // Lấy vị trí mới từ thằng over
                const newColumnIndex = orderedColumns.findIndex(
                    (c) => c._id === over.id
                );

                //Dùng arrayMove của thằng dnd-Kit để sắp xếp lại mảng Column ban đầu
                const dndOrderedColumns = arrayMove(
                    orderedColumns,
                    oldColumnIndex,
                    newColumnIndex
                );
                // const dndOrderedColumnsIds = dndOrderedColumns.map((c) => c._id);

                // console.log("dndOrderedColumns: ", dndOrderedColumns);
                // console.log("dndOrderedColumnsIds: ", dndOrderedColumnsIds);

                //Cập nhật lại state Column ban đầu sau khi đã kéo thả
                setOrderedColumns(dndOrderedColumns);

                moveColumns(dndOrderedColumns);
            }
        }

        //Những dữ liệu sau khi kéo thả xong thì phải đưa về giá trị null ban đầu
        setActiveDragItemId(null);
        setActiveDragItemType(null);
        setActiveDragItemData(null);
        setOldColumnWhenDraggingCard(null);
    };

    const customDropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: "0.5",
                },
            },
        }),
    };

    //Chúng ta sẽ custom lại chiến lược / thuật toán phát hiện va chạm để tối ưu cho việc kéo thả columns
    //args = arguments = Các Đối số, tham số
    const collisionDetectionStrategy = useCallback(
        (args) => {
            if (activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN) {
                return closestCorners({ ...args });
            }

            const pointerIntersections = pointerWithin(args);

            if (!pointerIntersections?.length) return;

            // const intersections =
            //     pointerIntersections?.length > 0
            //         ? pointerIntersections
            //         : rectIntersection(args);

            let overId = getFirstCollision(pointerIntersections, "id");
            if (overId) {
                const checkColumn = orderedColumns.find(
                    (column) => column._id === overId
                );
                if (checkColumn) {
                    overId = closestCorners({
                        ...args,
                        droppableContainers: args.droppableContainers.filter(
                            (container) =>
                                container.id !== overId &&
                                checkColumn?.cardOrderIds?.includes(
                                    container.id
                                )
                        ),
                    })[0]?.id;
                }

                lastOverId.current = overId;
                return [{ id: overId }];
            }
            return lastOverId.current ? [{ id: lastOverId.current }] : [];
        },

        [activeDragItemType]
    );

    return (
        <DndContext
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            //Thuật toán phát hiện va chạm
            //Nếu sử dụng closetCorners sẽ có bug flickering
            // collisionDetection={closestCorners}

            //Tự custom nâng cao thuật toán phát hiện va chạm
            collisionDetection={collisionDetectionStrategy}
            sensors={sensors}
        >
            <Box
                sx={{
                    width: "100%",
                    height: (theme) => theme.trello.boardContentHeight,
                    bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "#34495e" : "#1976d2",
                    p: "10px 0",
                }}
            >
                <ListColumns
                    columns={orderedColumns}
                />
                <DragOverlay dropAnimation={customDropAnimation}>
                    {!activeDragItemType && null}
                    {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.COLUMN && (
                        <Column column={activeDragItemData} />
                    )}
                    {activeDragItemType === ACTIVE_DRAG_ITEM_TYPE.CARD && (
                        <Card card={activeDragItemData} />
                    )}
                </DragOverlay>
            </Box>
        </DndContext>
    );
}

export default BoardContent;
