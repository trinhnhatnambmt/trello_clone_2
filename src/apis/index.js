import { toast } from "react-toastify";
import authorizedAxiosInstance from "~/utils/authorizeAxios";
import { API_ROOT } from "~/utils/constants";

// Boards
// export const fetchBoardDetailsAPI = async (boardId) => {
//     const response = await axios.get(`${API_ROOT}/v1/boards/${boardId}`);
//     return response.data;
// };
export const updateBoardDetailsAPI = async (boardId, updateData) => {
    const response = await authorizedAxiosInstance.put(
        `${API_ROOT}/v1/boards/${boardId}`,
        updateData
    );
    return response.data;
};

export const fetchBoardsAPI = async (searchPath) => {
    const response = await authorizedAxiosInstance.get(
        `${API_ROOT}/v1/boards${searchPath}`
    );
    return response.data;
};

// Columns
export const createNewColumnAPI = async (newColumnData) => {
    const response = await authorizedAxiosInstance.post(
        `${API_ROOT}/v1/columns`,
        newColumnData
    );
    return response.data;
};

export const updateColumnDetailsAPI = async (columnId, updateData) => {
    const response = await authorizedAxiosInstance.put(
        `${API_ROOT}/v1/columns/${columnId}`,
        updateData
    );
    return response.data;
};

export const deleteColumnDetailsAPI = async (columnId) => {
    const response = await authorizedAxiosInstance.delete(
        `${API_ROOT}/v1/columns/${columnId}`
    );
    return response.data;
};

// Card
export const createNewCardAPI = async (newCardData) => {
    const response = await authorizedAxiosInstance.post(
        `${API_ROOT}/v1/cards`,
        newCardData
    );
    return response.data;
};

export const updateCardToDifferentColumnAPI = async (updateData) => {
    const response = await authorizedAxiosInstance.put(
        `${API_ROOT}/v1/boards/supports/moving_card`,
        updateData
    );
    return response.data;
};

// Users
export const registerUserAPI = async (data) => {
    const response = await authorizedAxiosInstance.post(
        `${API_ROOT}/v1/users/register`,
        data
    );
    toast.success(
        "Account created successfully! Please check and verify your account before logging in!"
    );
    return response.data;
};

export const verifyUserAPI = async (data) => {
    const response = await authorizedAxiosInstance.put(
        `${API_ROOT}/v1/users/verify`,
        data
    );
    toast.success(
        "Account verified successfully! Now you can login to enjoy our services! Have a good day!"
    );
    return response.data;
};

export const refreshTokenAPI = async () => {
    const response = await authorizedAxiosInstance.get(
        `${API_ROOT}/v1/users/refresh_token`
    );
    return response.data;
};
