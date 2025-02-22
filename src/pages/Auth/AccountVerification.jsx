import { useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { verifyUserAPI } from "~/apis";
import PageLoadingSpinner from "~/components/Loading/PageLoadingSpinner";

function AccountVerification() {
    // Lấy giá trị email và token từ URL
    let [searchParams] = useSearchParams();
    // const email = searchParams.get("email");
    // const token = searchParams.get("token");
    const { email, token } = Object.fromEntries([...searchParams]);

    //Tạo một biến state để biết được là đã verify tài khoản thành công hay chưa
    const [verified, setVerified] = useState(false);

    // Gọi API để verify tài khoản
    useEffect(() => {
        if (email && token) {
            verifyUserAPI({ email, token }).then(() => setVerified(true));
        }
    }, [email, token]);

    // Nếu url có vấn đề, không tồn tại 1 trong 2 giá trị email hoặc token thì đá ra trang 404 luôn
    if (!email || !token) {
        return <Navigate to="/404" />;
    }

    // Nếu chưa verify xong thì hiện loading
    if (!verified) {
        return <PageLoadingSpinner caption="Verifying your account..." />;
    }

    // CUối cùng nếu không gặp vấn đề gì + với verify thành công thì điều hướng về trang login cùng giá trị verifiedEmail

    return <Navigate to={`/login?verifiedEmail=${email}`} />;
}

export default AccountVerification;
