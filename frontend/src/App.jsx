import './App.css';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import LandingPage from './page/Landingpage'
import Authentication from './page/Authpage'
import { AuthProvider } from './context/AtuhContext' // adjust the path if needed
import HomeComponent from './page/Home'
import VideoMeetComponent from './page/VideoMeet';

function App() {
  return (
    <div className="App">

      <Router>

        <AuthProvider>


          <Routes>

            <Route path='/' element={<LandingPage />} />

            <Route path='/auth' element={<Authentication />} />

            <Route path='/home' element={<HomeComponent />} />
            <Route path='/history' element={<History />} />
            <Route path='/:url' element={<VideoMeetComponent />} />
          </Routes>
        </AuthProvider>

      </Router>
    </div>
  );
}

export default App;
