import axios from "axios";
import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyA5LwzL7VPQsQE_mN3o1Taz428pqv3Wrg4",
  authDomain: "driver-safety-project.firebaseapp.com",
  projectId: "driver-safety-project",
  storageBucket: "driver-safety-project.appspot.com",
  messagingSenderId: "533781438883",
  appId: "1:533781438883:web:2984221e96b2999b70fa16",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/* ================= BACKEND URL ================= */

const API_URL =
  "https://chennakki-tharun95-drowsiness-detection.hf.space/detect";

/* ================= UI COMPONENTS ================= */

const GlassCard = ({ children, className }) => (
  <div
    className={`bg-black bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 p-8 transition-all duration-500 ${className}`}
  >
    {children}
  </div>
);

const Header = ({ user, setPage }) => {
  const handleLogout = () => {
    signOut(auth);
    setPage("home");
  };

  return (
    <header className="absolute top-0 left-0 right-0 p-4 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div
          className="text-2xl font-bold text-white cursor-pointer"
          onClick={() => setPage(user ? "dashboard" : "home")}
        >
          SafeDrive AI
        </div>

        {user ? (
          <button
            onClick={handleLogout}
            className="px-4 py-2 font-bold text-white bg-red-600 rounded-md"
          >
            Logout
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setPage("login")}
              className="px-4 py-2 font-bold text-white bg-teal-600 rounded-md"
            >
              Login
            </button>
            <button
              onClick={() => setPage("register")}
              className="px-4 py-2 font-bold text-gray-900 bg-gray-300 rounded-md"
            >
              Register
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

/* ================= AUTH PAGE ================= */

const AuthPage = ({ mode, setPage }) => {
  const isLogin = mode === "login";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const userCred = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password
        );

        await setDoc(doc(db, "users", userCred.user.uid), {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          email: form.email,
        });

        alert("Registration successful!");
        setPage("login");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <GlassCard className="w-full max-w-md">
      <h2 className="text-2xl font-bold text-center text-white">
        {isLogin ? "Login" : "Register"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {!isLogin && (
          <>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
            />
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-300"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3 font-bold text-white bg-teal-600 rounded-md"
        >
          {isLogin ? "Login" : "Register"}
        </button>

        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </GlassCard>
  );
};

/* ================= DRIVING PAGE ================= */

const DrivingPage = ({ setPage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const beepRef = useRef(null);

  const [isDrowsy, setIsDrowsy] = useState(false);
  const [sleepCount, setSleepCount] = useState(0);
  const prevDrowsy = useRef(false);

  const detect = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    const image = canvas.toDataURL("image/jpeg").split(",")[1];

    try {
      const res = await axios.post(API_URL, { image });

      const { detections = [], is_drowsy, trigger_alarm } = res.data;

      if (is_drowsy && !prevDrowsy.current) {
        setSleepCount((prev) => prev + 1);
      }

      prevDrowsy.current = is_drowsy;
      setIsDrowsy(is_drowsy);

      if (trigger_alarm && beepRef.current) {
        beepRef.current.play().catch(() => {});
      }

      const displayCanvas = canvasRef.current;
      const displayCtx = displayCanvas.getContext("2d");

      displayCanvas.width = video.videoWidth;
      displayCanvas.height = video.videoHeight;

      displayCtx.clearRect(
        0,
        0,
        displayCanvas.width,
        displayCanvas.height
      );

      detections.forEach((det) => {
        const [x1, y1, x2, y2] = det.box;
        displayCtx.strokeStyle = is_drowsy ? "red" : "green";
        displayCtx.lineWidth = 3;
        displayCtx.strokeRect(x1, y1, x2 - x1, y2 - y1);
      });
    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => (videoRef.current.srcObject = stream))
      .catch(() => alert("Allow camera access"));
  }, []);

  useEffect(() => {
    const interval = setInterval(detect, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="w-full max-w-4xl">
      <h2 className="text-2xl mb-4 text-white">Live Driving Monitor</h2>

      <div className="mb-4 text-white">
        😴 Sleep Count: {sleepCount}
      </div>

      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute w-full h-full"
        />
        <canvas
          ref={canvasRef}
          className="absolute w-full h-full"
        />
      </div>

      {isDrowsy && (
        <div className="mt-4 text-red-500 font-bold">
          🚨 DROWSINESS DETECTED 🚨
        </div>
      )}

      <audio
        ref={beepRef}
        src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
      />
    </GlassCard>
  );
};

/* ================= MAIN APP ================= */

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) setPage("dashboard");
    });
    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Header user={user} setPage={setPage} />

      <div className="mt-20">
        {page === "login" && <AuthPage mode="login" setPage={setPage} />}
        {page === "register" && (
          <AuthPage mode="register" setPage={setPage} />
        )}
        {page === "dashboard" && (
          <button
            onClick={() => setPage("driving")}
            className="px-8 py-4 bg-green-500 rounded-md text-white"
          >
            START DRIVING
          </button>
        )}
        {page === "driving" && (
          <DrivingPage setPage={setPage} />
        )}
      </div>
    </div>
  );
}
