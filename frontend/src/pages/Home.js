import { useEffect, useRef, useState } from "react";
import { getApiBaseUrl } from "../api";
import "./home.css";

const carImageFallbacks = {
  "bmw m2": {
    exterior: "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M2_%282%29.jpg?width=1400",
    interior: "https://commons.wikimedia.org/wiki/Special:FilePath/2018_BMW_M2_Coup%C3%A9_Interior.jpg?width=1400",
  },
  "bmw m3": {
    exterior: "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M3.jpg?width=1400",
    interior: "https://commons.wikimedia.org/wiki/Special:FilePath/2018_BMW_M3_Interior.jpg?width=1400",
  },
  "bmw m5": {
    exterior: "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_M5_%28F90%29_IMG_4432.jpg?width=1400",
    interior: "https://commons.wikimedia.org/wiki/Special:FilePath/BMW_E60_M5_Interior.JPG?width=1400",
  },
  "mercedes-benz c-class": {
    exterior: "https://commons.wikimedia.org/wiki/Special:FilePath/Mercedes_C_Class.jpg?width=1400",
    interior: "https://commons.wikimedia.org/wiki/Special:FilePath/The_interior_of_Mercedes-Benz_C_200_AVANTGARDE_%28W206%29.jpg?width=1400",
  },
  "porsche 911": {
    exterior: "https://commons.wikimedia.org/wiki/Special:FilePath/Porsche_911_991.2_Carrera_GTS_red_%281%29.jpg?width=1400",
    interior: "https://commons.wikimedia.org/wiki/Special:FilePath/Porsche_911_Interior_%284488308573%29.jpg?width=1400",
  },
  default: {
    exterior: "https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg",
    interior: "https://images.pexels.com/photos/977003/pexels-photo-977003.jpeg",
  },
};

function getFallbackImages(car) {
  const key = `${car.brand || ""} ${car.model || ""}`.trim().toLowerCase();
  return carImageFallbacks[key] || carImageFallbacks.default;
}

function isUsableImageUrl(url) {
  if (!url) return false;
  const value = String(url).trim();
  return /^https?:\/\//i.test(value) && !value.includes("google.com/imgres");
}

function AIChatBot({ cars, onBook }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hi, I am the Luxdrive AI concierge. Ask about availability, prices, documents, or which car fits your drive.",
    },
  ]);

  const buildReply = (question) => {
    const text = question.toLowerCase();
    const mentionedCar = cars.find((car) =>
      `${car.brand} ${car.model}`.toLowerCase().split(" ").some((part) => part && text.includes(part))
    );

    if (text.includes("price") || text.includes("rent") || text.includes("cost")) {
      if (mentionedCar) {
        return `${mentionedCar.brand} ${mentionedCar.model} starts from ₹${mentionedCar.price_per_day}/day. I can help you create a booking from the fleet card.`;
      }
      const priceList = cars
        .map((car) => `${car.brand} ${car.model}: ₹${car.price_per_day}/day`)
        .join(", ");
      return priceList || "I am loading the fleet prices. Please try again in a moment.";
    }

    if (text.includes("document") || text.includes("licence") || text.includes("license")) {
      return "You need a government ID, valid driving licence, rental dates, and the security deposit for the selected vehicle class.";
    }

    if (text.includes("owner") || text.includes("list")) {
      return "Owners can add a car from Profile with registration, insurance, exterior/interior photos, daily rate, and pickup city.";
    }

    if (mentionedCar) {
      return `${mentionedCar.brand} ${mentionedCar.model} is in the signature collection at ₹${mentionedCar.price_per_day}/day. Use Book now on that card and I will pass it to your profile booking flow.`;
    }

    return "I can help with car choice, prices, documents, owner listing, and booking steps. Tell me the model or budget you have in mind.";
  };

  const sendMessage = (text = input) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: trimmed },
      { role: "bot", text: buildReply(trimmed) },
    ]);
    setInput("");
  };

  return (
    <div className={open ? "ai-chat open" : "ai-chat"}>
      {open && (
        <section className="ai-chat-panel" aria-label="AI chat bot">
          <div className="ai-chat-header">
            <div>
              <span>AI Concierge</span>
              <strong>Luxdrive assistant</strong>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close AI chat">
              ×
            </button>
          </div>
          <div className="ai-chat-messages">
            {messages.map((message, index) => (
              <p key={`${message.role}-${index}`} className={`ai-message ${message.role}`}>
                {message.text}
              </p>
            ))}
          </div>
          <div className="ai-chat-quick">
            <button type="button" onClick={() => sendMessage("Show prices")}>Prices</button>
            <button type="button" onClick={() => sendMessage("What documents are needed?")}>Docs</button>
            {cars[0] && (
              <button type="button" onClick={() => onBook(cars[0])}>Book {cars[0].model}</button>
            )}
          </div>
          <form
            className="ai-chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the AI concierge"
            />
            <button type="submit">Send</button>
          </form>
        </section>
      )}
      <button
        type="button"
        className="ai-chat-fab"
        onClick={() => setOpen(true)}
        aria-label="Open AI chat bot"
      >
        AI Chat
      </button>
    </div>
  );
}

function CarShowcaseCard({ car, onBook }) {
  const [view, setView] = useState("exterior");
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const fallbacks = getFallbackImages(car);
  const exteriorSrc = isUsableImageUrl(car.image_exterior)
    ? car.image_exterior
    : isUsableImageUrl(car.image)
      ? car.image
      : fallbacks.exterior;
  const interiorSrc = isUsableImageUrl(car.image_interior) ? car.image_interior : fallbacks.interior;

  const handleMove = (e) => {
    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: my * -14, y: mx * 14 });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <article className="car-card">
      <div
        className="car-3d-stage"
        ref={stageRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div className="car-view-tabs">
          <button
            type="button"
            className={view === "exterior" ? "car-tab active" : "car-tab"}
            onClick={() => setView("exterior")}
          >
            Exterior
          </button>
          <button
            type="button"
            className={view === "interior" ? "car-tab active" : "car-tab"}
            onClick={() => setView("interior")}
          >
            Interior
          </button>
        </div>
        <div
          className="car-3d-inner"
          style={{
            transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          }}
        >
          <div className="car-image-wrap">
            <img
              src={view === "exterior" ? exteriorSrc : interiorSrc}
              alt={`${car.brand} ${car.model} ${view}`}
            />
            <div className="car-image-gradient" />
            <span className="car-tag">From ₹{car.price_per_day}/day</span>
          </div>
        </div>
      </div>
      <div className="car-content">
        <div>
          <h3>
            {car.brand} <span>{car.model}</span>
          </h3>
          <p className="car-meta">
            {car.year || "Latest model"} · {car.transmission || "Automatic"}
          </p>
        </div>
        <button className="car-cta" type="button" onClick={() => onBook(car)}>
          Book now
        </button>
      </div>
    </article>
  );
}

function Home({ onOpenDashboard, onSelectCarForBooking, user, onLogout }) {
  const [cars, setCars] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const apiBaseUrl = getApiBaseUrl();
  const contactEmail = "amreeshmishramishra@gmail.com";

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const bookCar = (car) => {
    if (onSelectCarForBooking) {
      onSelectCarForBooking(car);
    } else {
      onOpenDashboard();
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setFetchError("");

    fetch(`${apiBaseUrl}/api/cars/`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setCars(data))
      .catch((error) => {
        console.error(error);
        setFetchError("Unable to load cars right now. Check backend server.");
      })
      .finally(() => setIsLoading(false));
  }, [apiBaseUrl]);

  return (
    <div className="luxury-page">
      <header className="luxury-nav">
        <div className="luxury-logo-wrap">
          <div className="luxury-logo">LUXDRIVE</div>
          <span className="luxury-brand-tag">amareesh01</span>
        </div>
        <nav className="luxury-nav-links">
          <button className="nav-link" onClick={() => scrollToSection("models-section")}>
            Models
          </button>
          <button className="nav-link" onClick={() => scrollToSection("experience-section")}>
            Experience
          </button>
          <button className="nav-link" onClick={() => scrollToSection("owner-info-section")}>
            Owners
          </button>
          <button className="nav-link" onClick={() => scrollToSection("rental-info-section")}>
            Rentals
          </button>
          <button className="nav-link" onClick={() => scrollToSection("contact-section")}>
            Contact
          </button>
          <button type="button" className="nav-link nav-link-ai" onClick={() => scrollToSection("contact-section")}>
            AI Chat
          </button>
        </nav>
        <button className="nav-cta" onClick={() => scrollToSection("models-section")}>
          Book now
        </button>
        <button className="nav-cta" onClick={onOpenDashboard}>
          {user?.username || "Profile"}
        </button>
        <button className="nav-cta nav-logout" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main className="luxury-main">
        <section className="hero" id="hero-section">
          <div className="hero-overlay" />
          <div className="hero-content">
            <p className="hero-kicker">PREMIUM CAR RENTALS </p>
            <h1 className="hero-title">
              Drive the future
              <span> of luxury.</span>
            </h1>
            <p className="hero-subtitle">
              Curated performance machines with exterior & interior previews, delivered with
              concierge service. Select your dream car and we handle the rest.
            </p>
            <div className="hero-actions">
              <button className="hero-primary" onClick={() => scrollToSection("models-section")}>
                Explore fleet
              </button>
              <button className="hero-secondary" onClick={() => scrollToSection("contact-section")}>
                AI concierge
              </button>
            </div>
          </div>
        </section>

        <section className="experience-section" id="experience-section">
          <div className="experience-copy">
            <p>Luxury experience</p>
            <h2>From model preview to handover, the drive stays premium.</h2>
          </div>
          <div className="experience-grid">
            <article>
              <span>01</span>
              <h3>Exterior and interior preview</h3>
              <p>Every fleet card has separate tabs so renters can inspect cabin and body style before booking.</p>
            </article>
            <article>
              <span>02</span>
              <h3>Concierge booking flow</h3>
              <p>Choose a car, tap Book now, and the dashboard opens with that model already selected.</p>
            </article>
            <article>
              <span>03</span>
              <h3>AI rental support</h3>
              <p>The AI chat answers pricing, document, owner listing, and booking questions on the same page.</p>
            </article>
          </div>
        </section>

        <section className="cars-section" id="models-section">
          <div className="cars-header">
            <h2>Signature collection</h2>
            <p>
              Hand‑picked luxury cars. Use Exterior / Interior tabs and move your pointer over the
              photo for a light 3D tilt. Add separate photo URLs in the dashboard for each view.
            </p>
          </div>

          <div className="cars-grid">
            {isLoading && <p>Loading cars...</p>}
            {!isLoading && fetchError && <p>{fetchError}</p>}
            {!isLoading && !fetchError && cars.length === 0 && (
              <p>No cars available yet. Add cars from the Django admin/API.</p>
            )}
            {cars.map((car) => (
              <div key={car.id} className="car-card-link">
                <CarShowcaseCard car={car} onBook={bookCar} />
              </div>
            ))}
          </div>
        </section>

        <section className="info-split-section" id="owner-info-section">
          <div className="info-split-header">
            <h2>Owner information</h2>
            <p>For people who want to list a vehicle and earn from rentals.</p>
          </div>
          <div className="info-split-grid">
            <div className="info-split-card">
              <h3>What we need from owners</h3>
              <ul className="info-list">
                <li>Valid registration, insurance, and ID for verification</li>
                <li>Exterior and interior photos (clear URLs in dashboard)</li>
                <li>Preferred daily rate and availability windows</li>
                <li>Pickup / handover location in your city</li>
              </ul>
            </div>
            <div className="info-split-card">
              <h3>How listing works</h3>
              <ul className="info-list">
                <li>Add your car from Profile → includes main, exterior, and interior images</li>
                <li>We coordinate renter screening and booking requests</li>
                <li>You stay in control of calendar and vehicle condition checks</li>
              </ul>
              <button
                type="button"
                className="info-split-cta"
                onClick={onOpenDashboard}
              >
                Add car in profile
              </button>
            </div>
          </div>
        </section>

        <section className="info-split-section info-split-alt" id="rental-info-section">
          <div className="info-split-header">
            <h2>Rental information</h2>
            <p>For renters: documents, booking flow, and what to expect.</p>
          </div>
          <div className="info-split-grid">
            <div className="info-split-card">
              <h3>Before you drive</h3>
              <ul className="info-list">
                <li>Government ID and valid driving licence</li>
                <li>Security deposit as per vehicle class (confirmed on booking)</li>
                <li>Rental window: start and end dates agreed in advance</li>
                <li>Delivery or pickup options shared after confirmation</li>
              </ul>
            </div>
            <div className="info-split-card">
              <h3>During the rental</h3>
              <ul className="info-list">
                <li>Inspect exterior & interior at pickup; report existing marks</li>
                <li>Return with agreed fuel level and on time to avoid extra charges</li>
                <li>Reach the AI concierge or email for roadside or extension requests</li>
              </ul>
              <button type="button" className="info-split-cta" onClick={() => scrollToSection("contact-section")}>
                Ask about rentals
              </button>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact-section">
          <div className="contact-header">
            <h2>Contact & Rental Support</h2>
            <p>
              Reach our team for quick bookings, owner onboarding, and rental assistance 
            </p>
          </div>

          <div className="contact-grid">
            <article className="contact-card">
              <h3>Book a Car</h3>
              <p>
                Need urgent booking help? Our rental concierge helps you choose the right car,
                confirms availability, and shares pricing in minutes.
              </p>
              <button
                type="button"
                className="contact-cta"
                onClick={() => scrollToSection("models-section")}
              >
                Choose a car
              </button>
            </article>

            <article className="contact-card">
              <h3>For Car Owners</h3>
              <p>
                Own a premium car? Partner with us to list your vehicle, get verified renters, and
                earn from trusted short-term rentals.
              </p>
              <button
                type="button"
                className="contact-cta"
                onClick={onOpenDashboard}
              >
                List your car
              </button>
            </article>

            <article className="contact-card">
              <h3>AI concierge</h3>
              <p>
                Use the AI chat for instant rental questions, price checks, document requirements,
                and owner listing help. For direct support, email the Luxdrive team.
              </p>
              <div className="contact-info contact-info-after-list">
                <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
              </div>
            </article>
          </div>
        </section>
      </main>

      <AIChatBot cars={cars} onBook={bookCar} />
    </div>
  );
}

export default Home;
