import React, { useState } from 'react';
import { Web3Provider } from './context/Web3Context';
import { Sidebar } from './components/Sidebar';
import { UserProfile } from './components/UserProfile';
import { TrustScore } from './components/TrustScore';
import { ReferenceManagement } from './components/ReferenceManagement';
import { DataSourceIntegration } from './components/DataSourceIntegration';
import { PrivacyControls } from './components/PrivacyControls';
import { Support } from './components/Support';
import { ConnectWallet } from './components/ConnectWallet';
import { Toaster } from 'react-hot-toast';

function App() {
  const [activeSection, setActiveSection] = useState('profile');

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <>
            <UserProfile />
            <TrustScore />
          </>
        );
      case 'references':
        return <ReferenceManagement />;
      case 'datasources':
        return <DataSourceIntegration />;
      case 'privacy':
        return <PrivacyControls />;
      case 'support':
        return <Support />;
      default:
        return null;
    }
  };

  return (
    <Web3Provider>
      <div className="min-h-screen bg-[#1A1A1A] text-white">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#2E2E2E',
              color: '#fff',
              border: '1px solid #A8E6CF',
            },
          }}
        />
        <ConnectWallet />
        <Sidebar onSectionChange={setActiveSection} activeSection={activeSection} />
        
        <main className="lg:ml-64 p-6">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </Web3Provider>
  );
}

export default App;