import axios from 'axios';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyA5LwzL7VPQsQE_mN3o1Taz428pqv3Wrg4",
  authDomain: "driver-safety-project.firebaseapp.com",
  projectId: "driver-safety-project",
  storageBucket: "driver-safety-project.appspot.com",
  messagingSenderId: "533781438883",
  appId: "1:533781438883:web:2984221e96b2999b70fa16"
};

// --- BACKEND API URL ---
const API_URL = "https://chennakki-tharun95-drowsiness-detection.hf.space/detect";

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- GLASS CARD COMPONENT ---
const GlassCard = ({ children, className }) => (
  <div className={`bg-black bg-opacity-50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700 p-8 transition-all duration-500 ${className}`}>
    {children}
  </div>
);

// --- HEADER COMPONENT ---
const Header = ({ user, setPage }) => {
  const handleLogout = () => {
    signOut(auth);
    setPage('home');
  };

  return (
    <header className="absolute top-0 left-0 right-0 p-4 z-20">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white cursor-pointer" onClick={() => setPage(user ? 'dashboard' : 'home')}>
          SafeDrive AI
        </div>
        <nav className="flex items-center gap-4">
          <button onClick={() => setPage('about')} className="text-white hover:text-teal-300 transition-colors">Developers</button>
          {user ? (
            <button onClick={handleLogout} className="px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors">Logout</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setPage('login')} className="px-4 py-2 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-colors">Login</button>
              <button onClick={() => setPage('register')} className="px-4 py-2 font-bold text-gray-900 bg-gray-300 rounded-md hover:bg-white transition-colors">Register</button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

// --- HOME PAGE ---
const HomePage = ({ setPage }) => (
  <div className="text-center text-white animate-fade-in">
    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
      Driver Drowsiness Detection System Using Deep Learning Technique YOLO
    </h1>
    <button onClick={() => setPage('login')} className="px-8 py-3 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition-transform hover:scale-105">
      Login to Get Started
    </button>
  </div>
);

// --- ABOUT PAGE ---
const AboutPage = () => (
  <GlassCard className="w-full max-w-5xl animate-fade-in">
    <div className="text-center">
      <h2 className="text-4xl font-bold text-center text-teal-300 mb-8">Project Supervision</h2>
      <div className="flex flex-col md:flex-row justify-center items-center gap-12">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 mb-4 bg-blue-500 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg border-2 border-blue-300">J</div>
          <p className="text-xl font-semibold">DR. D. JAYANARAYANA REDDY</p>
          <p className="text-md text-gray-400">PROJECT GUIDE, GPREC</p>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 mb-4 bg-purple-500 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg border-2 border-purple-300">P</div>
          <p className="text-xl font-semibold">P.N.V.S. PAVAN KUMAR</p>
          <p className="text-md text-gray-400">PROJECT INCHARGE, GPREC</p>
        </div>
      </div>
    </div>
  </GlassCard>
);

// --- AUTH PAGE ---
const AuthPage = ({ mode, setPage }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    gender: '',
    address: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isLogin = mode === 'login';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, form.email, form.password);
      } else {
        const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password);
        const uid = userCred.user.uid;

        await setDoc(doc(db, 'users', uid), {
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          dob: form.dob,
          gender: form.gender,
          address: form.address,
          email: form.email
        });

        alert('Registration successful! Please log in.');
        setPage('login');
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <GlassCard className="w-full max-w-md animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">{isLogin ? 'SIGN IN' : 'Create an Account'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 bg-gray-700 text-white rounded-md" />

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2 text-sm text-gray-300">
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button type="submit" disabled={loading} className="w-full px-4 py-3 font-bold text-white bg-teal-600 rounded-md">
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>

        {error && <p className="text-sm text-center text-red-400">{error}</p>}
      </form>
    </GlassCard>
  );
};

// --- DRIVING PAGE ---
const DrivingPage = ({ setPage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const beepAudioRef = useRef(null);

  const [isDrowsy, setIsDrowsy] = useState(false);
  const [sleepCount, setSleepCount] = useState(0);
  const prevDrowsyRef = useRef(false);

  const detectDrowsiness = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    const imageBase64 = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const response = await axios.post(API_URL, { image: imageBase64 });
      const { is_drowsy = false, trigger_alarm } = response.data;

      if (is_drowsy && !prevDrowsyRef.current) {
        setSleepCount(prev => prev + 1);
      }

      prevDrowsyRef.current = is_drowsy;
      setIsDrowsy(is_drowsy);

      if (trigger_alarm && beepAudioRef.current) {
        beepAudioRef.current.currentTime = 0;
        beepAudioRef.current.play().catch(() => {});
      }

    } catch (err) {
      console.error("Backend error:", err);
    }
  };

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(detectDrowsiness, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="w-full max-w-4xl animate-fade-in">
      <h2 className="text-3xl font-bold text-white mb-4">Live Driving Monitor</h2>

      <div className="mb-4 text-white text-center">
        😴 Sleep Count: {sleepCount}
      </div>

      <video ref={videoRef} autoPlay playsInline muted style={{ transform: 'scaleX(-1)' }} />

      {isDrowsy &&
        <div className="mt-4 text-center text-white bg-red-600 p-3 rounded-lg">
          🚨 DROWSINESS DETECTED 🚨
        </div>
      }

      <audio ref={beepAudioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />
    </GlassCard>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderPage = () => {
    if (loading) return <p className="text-white">Loading...</p>;
    if (!user) return <HomePage setPage={setPage} />;
    return <DrivingPage setPage={setPage} />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <Header user={user} setPage={setPage} />
      {renderPage()}
    </div>
  );
}
