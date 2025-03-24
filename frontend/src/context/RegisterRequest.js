import axios from 'axios';

const RegisterRequest = () => {
    const response = axios.post('http://localhost:5000/register', {
      username,
      password,
    });
    return response
}
 
export default RegisterRequest;