import { useCallback, useEffect, useState } from "react";
import { getApiBaseUrl } from "../api";

function ProfileDashboard({ onBack, onLogout, user, preselectedCarId }) {
  const apiBaseUrl = getApiBaseUrl();
  const [cars, setCars] = useState([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [message, setMessage] = useState("");

  const [carForm, setCarForm] = useState({
    brand: "",
    model: "",
    price_per_day: "",
    image: "",
    image_exterior: "",
    image_interior: "",
    description: "",
  });

  const [bookingForm, setBookingForm] = useState({
    car: "",
    name: "",
    start_date: "",
    end_date: "",
  });

  const loadCars = useCallback(() => {
    setLoadingCars(true);
    fetch(`${apiBaseUrl}/api/cars/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load cars");
        }
        return res.json();
      })
      .then((data) => setCars(data))
      .catch(() => setMessage("Unable to load cars. Check backend server."))
      .finally(() => setLoadingCars(false));
  }, [apiBaseUrl]);

  useEffect(() => {
    loadCars();
  }, [loadCars]);

  useEffect(() => {
    if (preselectedCarId) {
      setBookingForm((current) => ({ ...current, car: preselectedCarId }));
    }
  }, [preselectedCarId]);

  const submitCar = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/cars/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand: carForm.brand,
          model: carForm.model,
          price_per_day: Number(carForm.price_per_day),
          image: carForm.image,
          description: carForm.description,
          image_exterior: carForm.image_exterior.trim() || null,
          image_interior: carForm.image_interior.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add car");
      }

      setCarForm({
        brand: "",
        model: "",
        price_per_day: "",
        image: "",
        image_exterior: "",
        image_interior: "",
        description: "",
      });
      setMessage("Car added successfully.");
      loadCars();
    } catch (error) {
      setMessage("Failed to add car. Please check all fields.");
    }
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...bookingForm,
          car: Number(bookingForm.car),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create booking");
      }

      setBookingForm({
        car: "",
        name: "",
        start_date: "",
        end_date: "",
      });
      setMessage("Booking created successfully.");
    } catch (error) {
      setMessage("Failed to create booking. Please check form values.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Profile Dashboard</h1>
          <p style={styles.userLine}>Signed in as {user?.username || "Luxdrive user"}</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.buttonSecondary} onClick={onBack}>
            Back to Home
          </button>
          <button style={styles.buttonSecondary} onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>

      {message && <p style={styles.message}>{message}</p>}

      <div style={styles.grid}>
        <form style={styles.card} onSubmit={submitCar}>
          <h2 style={styles.cardTitle}>Add Car</h2>
          <input
            style={styles.input}
            placeholder="Brand"
            value={carForm.brand}
            onChange={(e) => setCarForm({ ...carForm, brand: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Model"
            value={carForm.model}
            onChange={(e) => setCarForm({ ...carForm, model: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="number"
            placeholder="Price per day"
            value={carForm.price_per_day}
            onChange={(e) => setCarForm({ ...carForm, price_per_day: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Image URL (main / fallback)"
            value={carForm.image}
            onChange={(e) => setCarForm({ ...carForm, image: e.target.value })}
            required
          />
          <input
            style={styles.input}
            placeholder="Exterior photo URL (optional)"
            value={carForm.image_exterior}
            onChange={(e) => setCarForm({ ...carForm, image_exterior: e.target.value })}
          />
          <input
            style={styles.input}
            placeholder="Interior photo URL (optional)"
            value={carForm.image_interior}
            onChange={(e) => setCarForm({ ...carForm, image_interior: e.target.value })}
          />
          <textarea
            style={styles.textarea}
            placeholder="Description"
            value={carForm.description}
            onChange={(e) => setCarForm({ ...carForm, description: e.target.value })}
            required
          />
          <button style={styles.buttonPrimary} type="submit">
            Add Car
          </button>
        </form>

        <form style={styles.card} onSubmit={submitBooking}>
          <h2 style={styles.cardTitle}>Create Booking</h2>
          <select
            style={styles.input}
            value={bookingForm.car}
            onChange={(e) => setBookingForm({ ...bookingForm, car: e.target.value })}
            required
          >
            <option value="">Select Car</option>
            {cars.map((car) => (
              <option key={car.id} value={car.id}>
                {car.brand} {car.model}
              </option>
            ))}
          </select>
          <input
            style={styles.input}
            placeholder="Customer Name"
            value={bookingForm.name}
            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="date"
            value={bookingForm.start_date}
            onChange={(e) => setBookingForm({ ...bookingForm, start_date: e.target.value })}
            required
          />
          <input
            style={styles.input}
            type="date"
            value={bookingForm.end_date}
            onChange={(e) => setBookingForm({ ...bookingForm, end_date: e.target.value })}
            required
          />
          <button style={styles.buttonPrimary} type="submit" disabled={loadingCars}>
            Create Booking
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#06080e",
    color: "#f5f5f5",
    padding: "32px",
    fontFamily: "system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    gap: "16px",
    flexWrap: "wrap",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  userLine: {
    margin: "6px 0 0",
    color: "#9fb4e8",
    fontSize: "14px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#0e111b",
    border: "1px solid #ffffff14",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardTitle: {
    margin: "0 0 6px 0",
    fontSize: "16px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  input: {
    height: "40px",
    borderRadius: "8px",
    border: "1px solid #ffffff24",
    background: "#090c14",
    color: "#f5f5f5",
    padding: "0 10px",
  },
  textarea: {
    minHeight: "90px",
    borderRadius: "8px",
    border: "1px solid #ffffff24",
    background: "#090c14",
    color: "#f5f5f5",
    padding: "10px",
    resize: "vertical",
  },
  buttonPrimary: {
    height: "40px",
    borderRadius: "999px",
    border: "none",
    background: "#ffffff",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
  },
  buttonSecondary: {
    height: "38px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid #ffffff44",
    background: "transparent",
    color: "#f5f5f5",
    cursor: "pointer",
  },
  message: {
    margin: "0 0 14px 0",
    color: "#bcd0ff",
  },
};

export default ProfileDashboard;
