import { useEffect, useState } from "react";
import "./App.css";
import { getApiBaseUrl } from "./api";
import Home from "./pages/Home";
import ProfileDashboard from "./pages/ProfileDashboard";

function App() {
  const apiBaseUrl = getApiBaseUrl();
  const [view, setView] = useState("auth");
  const [selectedCarId, setSelectedCarId] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("luxdrive_user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      setView("home");
      setCheckingAuth(false);
      return;
    }

    fetch(`${apiBaseUrl}/api/auth/me/`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) {
          setCurrentUser(data.user);
          localStorage.setItem("luxdrive_user", JSON.stringify(data.user));
          setView("home");
        }
      })
      .finally(() => setCheckingAuth(false));
  }, [apiBaseUrl]);

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthMessage("");

    try {
      const endpoint = authMode === "login" ? "login" : "signup";
      const response = await fetch(`${apiBaseUrl}/api/auth/${endpoint}/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      setCurrentUser(data.user);
      localStorage.setItem("luxdrive_user", JSON.stringify(data.user));
      setView("home");
    } catch (error) {
      setAuthMessage(error.message);
    }
  };

  const logout = async () => {
    localStorage.removeItem("luxdrive_user");
    setCurrentUser(null);
    setView("auth");
    fetch(`${apiBaseUrl}/api/auth/logout/`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  };

  if (checkingAuth) {
    return <div className="auth-page">Loading Luxdrive...</div>;
  }

  if (view === "auth") {
    return (
      <div className="auth-page">
        <section className="auth-panel">
          <div className="auth-brand">
            <span>LUXDRIVE</span>
            <strong>Premium rentals </strong>
          </div>
          <h1>{authMode === "login" ? "Welcome back" : "Create account"}</h1>
          <p>
            Sign in to book cars, manage your profile, and add luxury vehicles to the fleet.
          </p>

          <form className="auth-form" onSubmit={submitAuth}>
            <label>
              Username
              <input
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                required
              />
            </label>
            {authMode === "signup" && (
              <label>
                Email
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                />
              </label>
            )}
            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </label>
            {authMessage && <p className="auth-message">{authMessage}</p>}
            <button type="submit" className="auth-submit">
              {authMode === "login" ? "Login" : "Sign up"}
            </button>
          </form>

          <button
            type="button"
            className="auth-switch"
            onClick={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setAuthMessage("");
            }}
          >
            {authMode === "login"
              ? "Need an account? Sign up"
              : "Already registered? Login"}
          </button>
        </section>
      </div>
    );
  }

  if (view === "dashboard") {
    return (
      <ProfileDashboard
        user={currentUser}
        onLogout={logout}
        preselectedCarId={selectedCarId}
        onBack={() => {
          setView("home");
          setSelectedCarId("");
        }}
      />
    );
  }

  return (
    <Home
      user={currentUser}
      onLogout={logout}
      onOpenDashboard={() => setView("dashboard")}
      onSelectCarForBooking={(car) => {
        setSelectedCarId(String(car.id));
        setView("dashboard");
      }}
    />
  );
}

export default App;
