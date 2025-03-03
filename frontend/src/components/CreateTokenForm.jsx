import React, { useState } from 'react';
import axios from 'axios';

const CreateTokenForm = () => {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const tokenData = { name, symbol, description, image };
      const response = await axios.post('http://localhost:5000/create-token', tokenData);
      
      if (response.data.success) {
        alert('Token created successfully!');
        // Clear form fields
        setName('');
        setSymbol('');
        setDescription('');
        setImage('');
      }
    } catch (error) {
      console.error('Error creating token:', error);
      alert('Error creating token');
    }
  };

  return (
    <div>
      <h1>Create New Token</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Token Name:</label>
          <input
            type="text"
            placeholder="Token Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Token Symbol:</label>
          <input
            type="text"
            placeholder="Token Symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Description:</label>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Image URL:</label>
          <input
            type="text"
            placeholder="Image URL"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            required
          />
        </div>

        <button type="submit">Create Token</button>
      </form>
    </div>
  );
};

export default CreateTokenForm;
