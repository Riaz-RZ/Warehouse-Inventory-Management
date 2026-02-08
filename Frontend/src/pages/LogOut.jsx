import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const LogOut = () => {
    const navigate = useNavigate();
    useEffect(() => {
        localStorage.removeItem("loggedIn");
        navigate("/");
    }, [navigate]);
    return (
        <div>
            Logout page
        </div>
    );
};

export default LogOut;