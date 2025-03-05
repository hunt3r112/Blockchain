import React from 'react';
import CreateTokenForm from './components/CreateTokenForm';
import TokenList from './components/TokenList';
import './App.css';

const App = () => {
  return (
    <div>
      <CreateTokenForm />
      <hr />
      <TokenList />
    </div>
  );
};

export default App;
