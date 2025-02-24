import axios from "axios";
import { toast } from "react-toastify";
import { interceptorLoadingElements } from "./formatters";
import { logoutUserAPI } from "~/redux/user/userSlice";
import { refreshTokenAPI } from "~/apis";

/** Không thể import {store} from "~/redux/store" theo cách thông thường ở đây
 *  Giải pháp: Inject store: là kỹ thuật khi cần sử dụng biến redux store ở các file ngoài phạm vi component như file authorizeAxios hiện tại
 *  Hiểu đơn giản: khi ứng dụng bắt đầu chạy lên, code sẽ chạy vào main.jsx đầu tiên, từ bên đó chúng ta gọi hàm injectStore ngay lập tức để
 * gán biến mainStore vào biến axiosReduxStore cục bộ trong file này
 */

let axiosReduxStore;
export const injectStore = (mainStore) => {
    axiosReduxStore = mainStore;
};

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

// Khởi tạo một cái promise cho việc gọi api refresh_token
// Mục đích tạo Promise này để khi nào gọi api refresh_token xong xuôi thì mới retry lại nhiều api bị lỗi trước đó
let refreshTokenPromise = null;

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

        /** Quan trọng: Xử lí refresh Token tự động */
        // Trường hợp 1: Nếu như nhận mã 401 từ BE, thì gọi api đăng xuất luôn
        if (error?.response?.status === 401) {
            axiosReduxStore.dispatch(logoutUserAPI(false));
        }
        // Trưởng hợp 2: Nếu như nhận mã 410 từ BE, thì sẽ gọi lại api refresh token để làm mới lại accessToken
        // Đầu tiên lấy được các request API đang bị lỗi thông qua error.config
        const originalRequests = error.config;
        console.log("🚀 ~ originalRequests:", originalRequests);
        if (error?.response?.status === 410 && !originalRequests._retry) {
            // Gán thêm một giá trị _retry luôn = true trong khoảng thời gian chờ, đảm bảo việc refresh token này
            //chỉ luôn gọi 1 lần tại 1 thời điểm (nhìn lại điều kiện if ngay phía trên)
            originalRequests._retry = true;

            // Kiểm tra xem nếu chưa có refreshTokenPromise thì thực hiện gán việc gọi api refresh_token đồng thời gán vào cho cái refreshTokenPromise
            if (!refreshTokenPromise) {
                refreshTokenPromise = refreshTokenAPI()
                    .then((data) => {
                        // Đồng thời accessToken đã nằm trong httpOnly Cookie (xử lý từ phía BE)
                        return data?.accessToken;
                    })
                    .catch((_error) => {
                        // Nếu nhận bất kỳ lỗi nào khác từ API Refresh Token thì sẽ đăng xuất luôn
                        axiosReduxStore.dispatch(logoutUserAPI(false));
                        return Promise.reject(_error);
                    })
                    .finally(() => {
                        // Dù API có thành công hay lỗi thì vẫn luôn gán lại cái refreshTokenPromise về null như ban đầu
                        refreshTokenPromise = null;
                    });
            }

            // Cần return trường hợp refreshTokenPromise chạy thành công và xử lí thêm ở đây
            return refreshTokenPromise.then((accessToken) => {
                /**
                 * Bước 1: Đối với trường hợp nếu như dự án cần lưu accessToken vào localStorage hoặc đâu đó thì sẽ viết thêm code xử lí ở đây
                 * Hiện tại ở đây ko cần bước 1 này vì chúng ta đã đưa accessToken vào cookie (xử lí từ phía BE) sau khi api RefreshToken được gọi thành công
                 *
                 */

                // Bước 2: Bước quan trọng: Return lại axios instance của chúng ta kết hợp các originalRequest để gọi lại những api ban đầu bị lỗi
                return authorizedAxiosInstance(originalRequests);
            });
        }

        // Xử lí lỗi tập trung phần hiển thị thông báo lỗi trả về từ mọi API ở đây (viết code một lần: Clean Code)
        // console.log error ra là sẽ thấy cấu trúc data dẫn tới message lỗi như dưới đây
        let errorMessage = error?.message;
        if (error?.response?.data?.message) {
            errorMessage = error?.response?.data?.message;
        }
        if (error?.response?.status !== 410) {
            toast.error(errorMessage);
        }

        return Promise.reject(error);
    }
);
export default authorizedAxiosInstance;
