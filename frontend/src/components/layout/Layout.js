import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MessengerPopup from '../messenger/MessengerPopup';

const styles = {
  appWrap: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f0fdfa',
  },
  mainArea: {
    marginLeft: '220px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  content: {
    flex: 1,
    padding: '24px',
    overflowY: 'auto',
  },
};

function Layout() {
  return (
    <div style={styles.appWrap}>
      <Sidebar />
      <div style={styles.mainArea}>
        <Header />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
      <MessengerPopup />
    </div>
  );
}

export default Layout;
