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
const API_BASE_URL = const API_BASE_URL = "https://drowsiness-detection-r66j.onrender.com";


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
    <div className="pt-8 mt-8 border-t border-gray-700 text-center">
      <h3 className="text-3xl font-bold">Project Team</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mt-6">
        {['C. THARUN', 'K. LATHA', 'G. NARENDRA'].map((name, index) => (
          <div key={name} className="flex flex-col items-center group">
            <div className="w-28 h-28 mb-4 bg-teal-500 rounded-full flex items-center justify-center text-5xl font-bold text-gray-900 shadow-lg transform group-hover:scale-110 transition-transform duration-300">
              {['T', 'L', 'N'][index]}
            </div>
            <p className="text-xl font-semibold">{name}</p>
          </div>
        ))}
      </div>
    </div>
  </GlassCard>
);

// --- AUTH PAGE (LOGIN + REGISTER with SHOW/HIDE password) ---
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
  const [showPassword, setShowPassword] = useState(false); // toggle
  const isLogin = mode === 'login';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
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

        // ✅ Save user details in firestore (Removed photoURL and terms checkbox)
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
      setError(err?.code ? err.code.replace('auth/', '').replace(/-/g, ' ') : (err.message || String(err)));
    }

    setLoading(false);
  };

  return (
    <GlassCard className="w-full max-w-md animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-white">{isLogin ? 'SIGN IN' : 'Create an Account'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        {!isLogin && (
          <>
            <div className="flex gap-2">
              <input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required className="w-1/2 px-4 py-2 bg-gray-700 text-white rounded-md" />
              <input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required className="w-1/2 px-4 py-2 bg-gray-700 text-white rounded-md" />
            </div>
            <input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required className="w-full px-4 py-2 bg-gray-700 text-white rounded-md" />
            <input type="date" name="dob" value={form.dob} onChange={handleChange} required className="w-full px-4 py-2 bg-gray-700 text-white rounded-md" />
            <select name="gender" value={form.gender} onChange={handleChange} required className="w-full px-4 py-2 bg-gray-700 text-white rounded-md">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} required className="w-full px-4 py-2 bg-gray-700 text-white rounded-md"></textarea>

            {/* ✅ Removed Upload Photo */}
            {/* ✅ Removed Terms & Conditions */}
          </>
        )}

        <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} required className="w-full px-4 py-2 bg-gray-700 text-white rounded-md" />

        {/* Password input with show/hide */}
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
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-sm text-gray-300 hover:text-white"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button type="submit" disabled={loading} className="w-full px-4 py-3 font-bold text-white bg-teal-600 rounded-md hover:bg-teal-700 transition">
          {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
        </button>

        {error && <p className="text-sm text-center text-red-400 capitalize">{error}</p>}
      </form>
    </GlassCard>
  );
};

// --- DASHBOARD PAGE ---
const DashboardPage = ({ setPage }) => (
  <GlassCard className="text-center text-white animate-fade-in">
    <h2 className="text-4xl font-bold mb-2">Welcome Back, Driver!</h2>
    <p className="text-gray-400 mb-8">Ready for a safe journey?</p>
    <button onClick={() => setPage('driving')} className="px-12 py-4 text-2xl font-bold text-gray-900 bg-green-400 rounded-md hover:bg-green-500 transition-transform hover:scale-105 animate-pulse">
      START DRIVING
    </button>
  </GlassCard>
);

// --- DRIVING PAGE ---
const DrivingPage = ({ setPage }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [isDrowsy, setIsDrowsy] = useState(false);

  // ✅ sleep count added
  const [sleepCount, setSleepCount] = useState(0);

  // ✅ Track previous state (Awake/Drowsy)
  const prevDrowsyRef = useRef(false);

  const beepAudioRef = useRef(null);

  const detectDrowsiness = async () => {
    if (videoRef.current && videoRef.current.readyState === 4) {
      const video = videoRef.current;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = video.videoWidth;
      tempCanvas.height = video.videoHeight;
      const ctx = tempCanvas.getContext('2d');
      ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
      const imageSrc = tempCanvas.toDataURL('image/jpeg');

      try {
        const response = await axios.post(`${API_BASE_URL}/detect`, { image: imageSrc.split(',')[1] });
        const { detections = [], is_drowsy: isDrowsyConfirmed = false, trigger_alarm } = response.data;

        // ✅ Increase count ONLY on Awake -> Drowsy transition
        if (isDrowsyConfirmed === true && prevDrowsyRef.current === false) {
          setSleepCount(prev => prev + 1);
        }

        // update current & prev
        prevDrowsyRef.current = isDrowsyConfirmed;
        setIsDrowsy(isDrowsyConfirmed);

        const displayCanvas = canvasRef.current;
        const displayCtx = displayCanvas.getContext('2d');
        displayCanvas.width = video.videoWidth;
        displayCanvas.height = video.videoHeight;
        displayCtx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);

        detections.forEach(det => {
          const [x1, y1, x2, y2] = det.box;
          const mirroredX1 = displayCanvas.width - x2;
          const boxWidth = x2 - x1;

          displayCtx.strokeStyle = isDrowsyConfirmed ? '#EF4444' : '#10B981';
          displayCtx.lineWidth = 3;
          displayCtx.strokeRect(mirroredX1, y1, boxWidth, y2 - y1);
          displayCtx.fillStyle = isDrowsyConfirmed ? '#EF4444' : '#10B981';
          displayCtx.font = '18px sans-serif';
          displayCtx.fillText(`${det.name} (${det.conf?.toFixed?.(2) ?? ''})`, mirroredX1, y1 > 20 ? y1 - 10 : 20);
        });

        if (trigger_alarm) {
          playBeepSequence();
        }

      } catch (error) {
        console.error("Error connecting to backend:", error);
      }
    }
  };

  const playBeepSequence = () => {
    let beepCount = 0;
    const beepInterval = setInterval(() => {
      if (beepAudioRef.current && beepCount < 3) {
        beepAudioRef.current.currentTime = 0;
        beepAudioRef.current.play().catch(() => {});
        beepCount++;
      } else {
        clearInterval(beepInterval);
      }
    }, 300);
  };

  useEffect(() => {
    let stream;
    const setupCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        alert("Could not access webcam. Please allow camera permissions.");
      }
    };

    setupCamera();

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(detectDrowsiness, 300);
    return () => clearInterval(interval);
  }, []);

  return (
    <GlassCard className="w-full max-w-4xl animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl font-bold text-white">Live Driving Monitor</h2>
        <button onClick={() => setPage('dashboard')} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">Stop Driving</button>
      </div>

      {/* ✅ Sleep count display */}
      <div className="mb-4 text-white text-center bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg p-3">
        <h3 className="text-xl font-bold">
          😴 Sleep Count: <span className="text-yellow-300">{sleepCount}</span>
        </h3>
      </div>

      <div className={`relative aspect-video bg-black rounded-lg overflow-hidden border-4 transition-colors duration-300 ${isDrowsy ? 'border-red-500' : 'border-green-500'}`}>
        <video ref={videoRef} autoPlay playsInline muted className="absolute top-0 left-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full object-cover" />
      </div>

      {isDrowsy && (
        <div className="mt-4 text-center text-white bg-red-600 p-3 rounded-lg">
          <h2 className="text-2xl font-extrabold animate-pulse">🚨 DROWSINESS DETECTED 🚨</h2>
        </div>
      )}

      <audio ref={beepAudioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" preload="auto"></audio>
    </GlassCard>
  );
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('home');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (['login', 'register', 'home'].includes(page)) setPage('dashboard');
      } else {
        if (['dashboard', 'driving'].includes(page)) setPage('home');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [page]);

  const renderPage = () => {
    if (loading) return <p className="text-white text-xl">Loading...</p>;
    switch (page) {
      case 'about': return <AboutPage />;
      case 'login': return <AuthPage mode="login" setPage={setPage} />;
      case 'register': return <AuthPage mode="register" setPage={setPage} />;
      case 'dashboard': return user ? <DashboardPage setPage={setPage} /> : <HomePage setPage={setPage} />;
      case 'driving': return user ? <DrivingPage setPage={setPage} /> : <HomePage setPage={setPage} />;
      default: return user ? <DashboardPage setPage={setPage} /> : <HomePage setPage={setPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502899576159-f224dc2349fa?q=80&w=2070&auto=format&fit=crop')" }}>
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <Header user={user} setPage={setPage} />
      <main className="relative z-10 w-full flex flex-col items-center justify-center flex-grow pt-20">
        {renderPage()}
      </main>
    </div>
  );
}
