import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const LogOut = () => {
    const navigate = useNavigate();
    useEffect(() => {
        localStorage.removeItem("loggedIn");
        localStorage.removeItem("authToken");
        localStorage.removeItem("admin");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        navigate("/");
    }, [navigate]);
    return (
        <div>
            Logout page
        </div>
    );
};

export default LogOut;