import React, { useRef, useState } from "react";
import axios from 'axios';

const Camera = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);

  const token = localStorage.getItem("access_token");
  const API_BASE_URL = 'http://localhost:5000';
  // Start the webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error("Error accessing webcam: ", err);
    }
  };

  // Capture the image
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      
      // Reduce dimensions (adjust as needed)
      const scaleFactor = 0.7; // Reduce to 70% of original size
      canvas.width = videoRef.current.videoWidth * scaleFactor;
      canvas.height = videoRef.current.videoHeight * scaleFactor;
      
      context.drawImage(
        videoRef.current, 
        0, 0, 
        canvas.width, canvas.height
      );
  
      // Convert to JPEG with quality setting (0.7 = 70% quality)
      const imageData = canvas.toDataURL("image/jpeg", 0.7);
      setImageSrc(imageData);
    }
  };
  // Stop the webcam
  const stopWebcam = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  // Submit the image to the API
  const submitToAPI = async () => {
    if (!imageSrc) {
      alert("Please capture an image first!");
      return;
    }
  
    try {
      const base64Data = imageSrc.split(",")[1];
      
      // Create proper FormData
      const requestBody = new FormData();
      requestBody.append("face_id", "FACE123");
      requestBody.append("name", "John Doe");
      
      // Convert base64 to Blob to properly handle the file
      const byteString = atob(base64Data);
      const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      
      const blob = new Blob([ab], { type: mimeString });
      requestBody.append("face_image", blob, "captured.jpg");
      requestBody.append("user_id", "6");
      const response = await axios.post(`${API_BASE_URL}/face_identity`, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data) {
        console.log("API Response:", response.data);
        alert("Face identity saved successfully!");
      }
    } catch (err) {
      console.error("Error calling API:", err);
      alert(`Failed to save face identity! ${err.message}`);
    }
  };
  
  return (
    <div>
      <h1>Webcam Capture</h1>
      <div>
        <video ref={videoRef} style={{ width: "100%", maxWidth: "500px" }}></video>
        <button onClick={startWebcam}>Start Webcam</button>
        <button onClick={captureImage}>Capture Image</button>
        <button onClick={stopWebcam}>Stop Webcam</button>
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
      {imageSrc && (
        <div>
          <h2>Captured Image:</h2>
          <img src={imageSrc} alt="Captured" style={{ width: "100%", maxWidth: "500px" }} />
          <button onClick={submitToAPI}>Submit to API</button>
        </div>
      )}
    </div>
  );
};

export default Camera;
