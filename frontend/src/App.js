import React from 'react';
import CreateTokenForm from './components/CreateTokenForm';
import TokenList from './components/TokenList';

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
