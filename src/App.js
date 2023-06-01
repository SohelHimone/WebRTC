
import './App.css';
import {Routes,Route} from "react-router-dom";

import Home from './screens/home';
import Room from './screens/room';
function App() {
  return (
    <div className="App">
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/room/:roomId' element={<Room/>}/>
        </Routes>    
        </div>
  );
}

export default App;
