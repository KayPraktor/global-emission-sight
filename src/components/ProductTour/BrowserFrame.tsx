import React from 'react';

interface BrowserFrameProps {
  children: React.ReactNode;
  url?: string;
}

export function BrowserFrame({ children, url = 'carbontrack.ir/dashboard' }: BrowserFrameProps) {
  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-2xl bg-background">
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border">
        {/* Traffic Lights */}
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        
        {/* Address Bar */}
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-background rounded-md border border-border text-sm">
            <svg 
              className="w-4 h-4 text-green-600" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path 
                fillRule="evenodd" 
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" 
                clipRule="evenodd" 
              />
            </svg>
            <span className="text-muted-foreground" dir="ltr">{url}</span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
