import axios from "axios";
import { toast } from "react-toastify";
import { interceptorLoadingElements } from "./formatters";

// Khởi tạo một đối tượng Axios (authorizedAxiosInstance) mục đích để custom và cấu hình chung cho dự án
const authorizedAxiosInstance = axios.create();
//Thời gian tối đa của một request : để 10 phút
authorizedAxiosInstance.defaults.timeout = 1000 * 60 * 10;

// withCredentials: Sẽ cho phép axios tự động gửi cookie trong mỗi request lên BE (phục vụ việc chúng ta sẽ lưu JWT tokens (refresh & access) vào trong httpOnly Cookie của trình duyệt)
authorizedAxiosInstance.defaults.withCredentials = true;

/**
 * Cấu hình Interceptor (Bộ đánh chặn giữa mọi Request & Response)
 */

// Interceptor Request: Can thiệp vào giữa những cái request API
authorizedAxiosInstance.interceptors.request.use(
    (config) => {
        // Do something before request is sent
        // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatter chứa function)
        interceptorLoadingElements(true);
        return config;
    },
    (error) => {
        // Do something with request error
        return Promise.reject(error);
    }
);

// Interceptor Response: Can thiệp vào giữa những cái response nhận về
authorizedAxiosInstance.interceptors.response.use(
    (response) => {
        // Do something with response data
        // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatter chứa function)
        interceptorLoadingElements(false);
        return response;
    },
    (error) => {
        // Mọi mã http status code nằm ngoài khoảng 200 - 299 sẽ là error và rơi vào đây

        // Kỹ thuật chặn spam click (xem kỹ mô tả ở file formatter chứa function)
        interceptorLoadingElements(false);

        // Xử lí lỗi tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần: Clean Code)
        // console.log error ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới đây
        let errorMessage = error?.message;
        if (error?.response?.data?.message) {
            errorMessage = error?.response?.data?.message;
        }
        if (error?.response?.data?.status !== 410) {
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);
export default authorizedAxiosInstance;
