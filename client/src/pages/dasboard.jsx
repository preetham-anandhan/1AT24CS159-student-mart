import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const apiUrl = "http://localhost:5000/api";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requestProfile(token) {
  const response = await fetch(`${apiUrl}/profile`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  return { response, data };
}

function Dashboard() {
  const [user, setUser] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const navigate = useNavigate();

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setLoadError("");

    try {
      const { response, data } = await requestProfile(token);

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Could not load your profile.");
      }

      setUser(data);
      setProfileForm({ name: data.name, email: data.email });
    } catch (error) {
      setLoadError(error.message || "Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    requestProfile(token)
      .then(({ response, data }) => {
        if (!active) {
          return;
        }
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        if (!response.ok) {
          throw new Error(data.message || "Could not load your profile.");
        }

        setUser(data);
        setProfileForm({ name: data.name, email: data.email });
      })
      .catch((error) => {
        if (active) {
          setLoadError(error.message || "Could not connect to the server.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [navigate]);

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((previous) => ({ ...previous, [name]: value }));
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    setProfileError("");
    setProfileMessage("");

    const name = profileForm.name.trim();
    const email = profileForm.email.trim();
    if (!name || !email) {
      setProfileError("Name and email are required.");
      return;
    }
    if (!emailPattern.test(email)) {
      setProfileError("Please enter a valid email address.");
      return;
    }

    setSavingProfile(true);
    try {
      const response = await fetch(`${apiUrl}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ name, email })
      });
      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Could not update your profile.");
      }

      setUser(data.user);
      setProfileForm({ name: data.user.name, email: data.user.email });
      setProfileMessage(data.message);
    } catch (error) {
      setProfileError(error.message || "Could not connect to the server.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError("Enter your current and new passwords.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError("Your new password must be at least 6 characters.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("The new passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch(`${apiUrl}/profile/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
        return;
      }
      if (!response.ok) {
        throw new Error(data.message || "Could not change your password.");
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordMessage(data.message);
    } catch (error) {
      setPasswordError(error.message || "Could not connect to the server.");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="welcome-panel">
          <div className="brand-mark">S</div>
          <h1>Loading your profile...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-shell">
        <main className="welcome-panel">
          <div className="brand-mark">S</div>
          <div className="eyebrow">Student portal</div>
          <h1>Profile unavailable</h1>
          <p className="error-message">{loadError}</p>
          <button className="submit-button" onClick={loadProfile}>
            Try again
          </button>
          <button className="secondary-button" onClick={handleLogout}>
            Back to login
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell profile-shell">
      <main className="profile-page">
        <header className="profile-header">
          <div className="profile-brand">
            <div className="brand-mark">S</div>
            <span>Student portal</span>
          </div>
          <button className="secondary-button logout-button" onClick={handleLogout}>
            Log out
          </button>
        </header>

        <section className="profile-intro">
          <div className="eyebrow">Your account</div>
          <h1>Welcome, {user.name}</h1>
          <p className="intro">View and manage your profile details below.</p>
        </section>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="eyebrow">Personal information</div>
            <h2>My profile</h2>
            <p className="card-intro">Update the name and email address on your account.</p>

            <form onSubmit={handleProfileSubmit} noValidate>
              <label>
                Full name
                <input
                  type="text"
                  name="name"
                  value={profileForm.name}
                  onChange={handleProfileChange}
                  autoComplete="name"
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  autoComplete="email"
                />
              </label>
              {profileError && <p className="error-message">{profileError}</p>}
              {profileMessage && <p className="success-message">{profileMessage}</p>}
              <button className="submit-button" type="submit" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save profile"}
              </button>
            </form>
          </section>

          <section className="profile-card">
            <div className="eyebrow">Account security</div>
            <h2>Change password</h2>
            <p className="card-intro">Confirm your current password before choosing a new one.</p>

            <form onSubmit={handlePasswordSubmit} noValidate>
              <label>
                Current password
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                />
              </label>
              <label>
                New password
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  minLength={6}
                />
              </label>
              <label>
                Confirm new password
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  minLength={6}
                />
              </label>
              {passwordError && <p className="error-message">{passwordError}</p>}
              {passwordMessage && <p className="success-message">{passwordMessage}</p>}
              <button className="submit-button" type="submit" disabled={changingPassword}>
                {changingPassword ? "Updating..." : "Update password"}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
