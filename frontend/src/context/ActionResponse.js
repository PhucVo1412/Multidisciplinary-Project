import axios from "axios";


const ActionResponse = (action) => {
    const response =  axios.post(
    'http://localhost:5000/records', // Adjust URL if your backend runs on a different port/domain
    { action },
    {
      headers: {
        Authorization: `Bearer ${token}`, // Include JWT token in the request
        'Content-Type': 'application/json',
      },
    })
    return response;
}

export default ActionResponse;