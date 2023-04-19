
import './App.css';
import BookingForm from './pages/BookingForm';
import {Routes,Route} from "react-router-dom";
import Logs from './pages/Logs';
import Edit from './pages/Edit';
import Navbar from './pages/Navbar';
function App() {
  return (
    <div className='site-contain'>
      <div>
        <Navbar/>
      </div>
      <Routes>
        <Route path="/" element={<Logs/>}/>
        <Route path="/home" element={<Logs/>}/>
        <Route path="/edit/:id" element={<Edit/>}/>
        <Route path="/newroom" element={<BookingForm/>}/>
      </Routes>
    </div>
  );
}

export default App;
