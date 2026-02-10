// if loggedIn", "true" in localStorage, then user is authenticated
// otherwise, user is not authenticated
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const useCheckAuth = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            navigate("/");
        }
    }, [navigate]);
}

export default useCheckAuth;