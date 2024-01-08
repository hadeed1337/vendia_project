import * as React from 'react';
import Header from '../components/Header';
import Devices from './Devices';
import Orgs from './Orgs';
import '../components/Main.css';

const HomePage = () => {
  
  const accountType = localStorage.getItem('accountType');

  return (
    <>
      <Header />
      <Devices/>
      {accountType === 'Admin' && <Orgs />}
    </>
  );
};

export default HomePage;
