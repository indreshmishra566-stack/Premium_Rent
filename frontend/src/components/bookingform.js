
import axios from "axios";
import { useState } from "react";
import { getApiBaseUrl } from "../api";

function BookingForm({ carId }) {
  const apiBaseUrl = getApiBaseUrl();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = async () => {
    try {
      await axios.post(`${apiBaseUrl}/api/bookings/`, {
        car: carId,
        name: name,
        start_date: startDate,
        end_date: endDate
      });
      alert("Booking Confirmed!");
    } catch (err) {
      alert("Error booking");
    }
  };

  return (
    <div>
      <h3>Book This Car</h3>

      <input
        placeholder="Your Name"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="date"
        onChange={(e) => setStartDate(e.target.value)}
      />

      <input
        type="date"
        onChange={(e) => setEndDate(e.target.value)}
      />

      <button onClick={handleSubmit}>Book Now</button>
    </div>
  );
}

export default BookingForm;
