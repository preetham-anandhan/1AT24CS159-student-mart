import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setUser(data);
      } catch (error) {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="welcome-panel">
          <div className="brand-mark">S</div>
          <h1>Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="app-shell">
      <div className="welcome-panel">
        <div className="brand-mark">S</div>
        <div className="eyebrow">Student portal</div>
        <h1>Welcome</h1>
        <p className="intro">Hello, {user.name}!</p>
        <p className="intro">Email: {user.email}</p>

        <button className="secondary-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;