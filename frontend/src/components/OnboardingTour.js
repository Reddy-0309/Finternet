import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';
import { useSelector } from 'react-redux';
import '../styles/tour.css';

// Tour steps configuration
const tourSteps = [
  {
    target: '[data-tour="welcome"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Welcome to Finternet! 🚀</h3>
        <p className="mb-2">Your gateway to the future of digital finance. This guided tour will help you navigate our platform and discover its powerful features.</p>
        <p className="text-sm text-gray-600">Take a few minutes to explore what Finternet can do for you.</p>
      </div>
    ),
    disableBeacon: true,
    placement: 'center',
    spotlightClicks: true,
  },
  {
    target: '[data-tour="dashboard"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Your Financial Command Center</h3>
        <p className="mb-2">This dashboard gives you a complete overview of your financial portfolio at a glance.</p>
        <ul className="list-disc pl-5 text-sm">
          <li>Monitor your asset performance</li>
          <li>Track recent transactions</li>
          <li>View important financial metrics</li>
          <li>Get personalized insights</li>
        </ul>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="assets"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Your Digital Asset Portfolio</h3>
        <p className="mb-2">Manage all your tokenized assets in one secure place. Each asset is backed by blockchain technology for maximum security and transparency.</p>
        <div className="bg-gray-100 p-2 rounded-md text-sm mb-2">
          <strong>Pro Tip:</strong> Click on any asset to view detailed information, transfer ownership, or manage its properties.
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="create-asset"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Tokenize Your Assets</h3>
        <p className="mb-2">Transform physical and digital assets into blockchain tokens with just a few clicks.</p>
        <p className="mb-2">Finternet supports multiple asset types:</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-blue-50 p-1 rounded">🏠 Real Estate</div>
          <div className="bg-green-50 p-1 rounded">📈 Stocks</div>
          <div className="bg-yellow-50 p-1 rounded">🥇 Commodities</div>
          <div className="bg-purple-50 p-1 rounded">🖼️ Art & Collectibles</div>
        </div>
      </div>
    ),
    placement: 'left',
    spotlightClicks: true,
  },
  {
    target: '[data-tour="blockchain-explorer"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Blockchain Explorer</h3>
        <p className="mb-2">Dive into the blockchain world with our powerful explorer tool. Track transactions, analyze smart contracts, and verify ownership - all in real-time.</p>
        <div className="flex items-center text-sm bg-gray-100 p-2 rounded-md">
          <span className="text-amber-600 mr-2">💡</span> Our explorer supports multiple blockchain networks including Ethereum, Binance Smart Chain, and Polygon.
        </div>
      </div>
    ),
    placement: 'bottom',
  },
  {
    target: '[data-tour="smart-contracts"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Smart Contract Templates</h3>
        <p className="mb-2">Create and deploy smart contracts without writing a single line of code. Our templates cover the most common use cases:</p>
        <ul className="list-disc pl-5 text-sm">
          <li><strong>ERC-20 Tokens</strong> - Create your own cryptocurrency</li>
          <li><strong>ERC-721 NFTs</strong> - Mint unique digital collectibles</li>
          <li><strong>Multi-signature Wallets</strong> - Enhanced security for high-value assets</li>
          <li><strong>Escrow Agreements</strong> - Secure transactions between parties</li>
        </ul>
      </div>
    ),
    placement: 'top',
  },
  {
    target: '[data-tour="notifications"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Stay Informed</h3>
        <p className="mb-2">Our notification center keeps you updated on everything that matters:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Asset price alerts
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Transaction confirmations
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> Security alerts
          </div>
          <div className="flex items-center">
            <span className="text-green-500 mr-2">✓</span> System updates
          </div>
        </div>
      </div>
    ),
    placement: 'left',
  },
  {
    target: '[data-tour="settings"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Personalize Your Experience</h3>
        <p className="mb-2">Customize Finternet to match your preferences and security needs:</p>
        <div className="space-y-1 text-sm">
          <div className="bg-gray-100 p-1 rounded-md flex items-center">
            <span className="text-primary-600 mr-2">🔒</span> Two-factor authentication
          </div>
          <div className="bg-gray-100 p-1 rounded-md flex items-center">
            <span className="text-primary-600 mr-2">🌙</span> Dark mode toggle
          </div>
          <div className="bg-gray-100 p-1 rounded-md flex items-center">
            <span className="text-primary-600 mr-2">🔔</span> Notification preferences
          </div>
          <div className="bg-gray-100 p-1 rounded-md flex items-center">
            <span className="text-primary-600 mr-2">📱</span> Mobile app sync
          </div>
        </div>
      </div>
    ),
    placement: 'right',
  },
  {
    target: '[data-tour="help"]',
    content: (
      <div className="tour-content">
        <h3 className="text-xl font-bold mb-2 text-primary-600">Help & Resources</h3>
        <p className="mb-2">Need assistance? We've got you covered with comprehensive support options:</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">📚</span> <strong>Knowledge Base</strong> - Detailed guides and tutorials
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">💬</span> <strong>Live Chat</strong> - Connect with our support team
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">🎓</span> <strong>Video Tutorials</strong> - Visual learning resources
          </div>
        </div>
        <p className="mt-3 text-primary-600 font-medium">You can restart this tour anytime by clicking the help button!</p>
      </div>
    ),
    placement: 'left',
  },
  {
    target: 'body',
    content: (
      <div className="tour-content text-center">
        <h3 className="text-xl font-bold mb-2 text-primary-600">You're All Set! 🎉</h3>
        <p className="mb-3">You're now ready to explore Finternet and revolutionize your financial management.</p>
        <div className="bg-primary-50 border border-primary-200 p-3 rounded-md mb-3">
          <p className="font-medium text-primary-700">Remember, your financial security is our top priority.</p>
          <p className="text-sm text-primary-600">All transactions are secured with enterprise-grade encryption and blockchain verification.</p>
        </div>
        <p className="text-sm text-gray-600">Have questions? Our support team is available 24/7 to assist you.</p>
      </div>
    ),
    placement: 'center',
    disableOverlayClose: true,
    spotlightClicks: false,
  },
];

const accentColor = '#4F46E5';

function OnboardingTour() {
  const [runTour, setRunTour] = useState(false);
  const { user } = useSelector((state) => state.auth);
  
  // Create a global method to start the tour from anywhere in the app
  useEffect(() => {
    // Expose the startTour method globally
    window.startFinTour = () => {
      localStorage.removeItem('hasSeenTour');
      setRunTour(true);
    };
    
    return () => {
      // Clean up the global method when component unmounts
      delete window.startFinTour;
    };
  }, []);
  
  // Check if this is the user's first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (user && !hasSeenTour) {
      // Delay the tour slightly to ensure the UI is fully loaded
      const timer = setTimeout(() => {
        setRunTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenTour', 'true');
    }
  };
  
  const startTour = () => {
    setRunTour(true);
  };
  
  // Custom tooltip component to enhance the visual appearance
  const CustomTooltip = ({
    continuous,
    index,
    step,
    backProps,
    closeProps,
    primaryProps,
    skipProps,
    isLastStep,
    size
  }) => (
    <div className="p-4 max-w-md bg-white rounded-lg shadow-xl border border-gray-100 dark:bg-gray-800 dark:border-gray-700">
      <div className="mb-3">
        {step.content}
      </div>
      
      <div className="flex items-center justify-between mt-4 border-t border-gray-100 dark:border-gray-700 pt-3">
        <div className="flex items-center">
          {index > 0 && (
            <button
              {...backProps}
              className="mr-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded transition-colors"
            >
              Back
            </button>
          )}
          
          {!isLastStep && (
            <button
              {...skipProps}
              className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              Skip
            </button>
          )}
        </div>
        
        <div className="flex items-center">
          {continuous && (
            <div className="mr-4 text-xs text-gray-500 dark:text-gray-400">
              {index + 1}/{size}
            </div>
          )}
          
          <button
            {...primaryProps}
            className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white rounded transition-colors"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous={true}
        scrollToFirstStep={true}
        showProgress={false}
        showSkipButton={true}
        disableOverlayClose={false}
        spotlightPadding={8}
        hideBackButton={false}
        tooltipComponent={CustomTooltip}
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: accentColor,
            zIndex: 10000,
            arrowColor: '#ffffff',
            backgroundColor: '#ffffff',
            overlayColor: 'rgba(0, 0, 0, 0.65)',
            textColor: '#333333',
            width: 'auto',
          },
          spotlight: {
            borderRadius: '8px',
            boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.3)'
          },
          overlay: {
            mixBlendMode: 'hard-light'
          },
          tooltip: {
            borderRadius: '8px',
            padding: 0
          },
        }}
        floaterProps={{
          disableAnimation: false,
          styles: {
            floater: {
              filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.15))'
            }
          }
        }}
      />
      
      {/* Optional: Button to restart the tour */}
      <button 
        onClick={startTour} 
        className="hidden" // Hidden by default, can be shown in help section
        aria-label="Start guided tour"
      >
        Start Guided Tour
      </button>
    </>
  );
}

export default OnboardingTour;
