import axios from 'axios';


const LoginResponse = () => { 
    const response=  axios.post('http://localhost:5000/login', {
        username,
        password,
        }
    );

    // Save the token to localStorage
    localStorage.setItem('access_token', response.data.access_token);
    console.log('New token:', response.data.access_token);
    // Update the login state in App.jsx
    return response
}
export default c;
