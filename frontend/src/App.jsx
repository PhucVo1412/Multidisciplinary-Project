import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Login from './components/Login'
import UserUI from './components/UserUI'

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

    return (
        <div>
        {isLoggedIn ? (
            <UserUI setIsLoggedIn={setIsLoggedIn} />
        ) : (
            <Login setIsLoggedIn={setIsLoggedIn} />
        )}
        </div>
    );
}

export default App;
