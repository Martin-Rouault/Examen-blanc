import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState([]);
  const navigate = useNavigate();
  console.log(error)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError([]);

    if(username.trim() && password.trim()) {
      try {
        const response = await api.post('/auth/register', { username, password });
        if(response.status === 200) {
          alert('Compte créé');
          navigate('/login');
        }
      } catch (err) {
          if (err.response?.data?.errors) {                                                                                                                                            
            setError(err.response.data.errors);                                                                                                                           
          } else {                                                                                                                                                                     
            setError([{ msg: err.response?.data?.msg || "Une erreur est survenue" }]);                                                                                                
          }                                                                                                                                                                            
          console.error('Register failed', err);  
      }
    } else {
      alert('Veuillez remplir les champs')
    }
  };

  return (
    <div className="container">
      <h1>Register</h1>
      {error.map((err, index) => (                                                                                                                                                          
        <p key={index} style={{ color: "red" }}>{err.msg}</p>                                                                                                                              
      ))}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input required type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button type="submit" className="btn">Register</button>
      </form>
    </div>
  );
};

export default Register;
