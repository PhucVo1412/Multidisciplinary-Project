import axios from "axios";


const ActionRequest = (action) => {
  const response =  axios.get('http://localhost:5000/records', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })
    return response;
}

export default ActionRequest;