import React, { useEffect, useRef } from 'react';

export const LiveMarketTicker: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = '100%';

    const widgetInner = document.createElement('div');
    widgetInner.className = 'tradingview-widget-container__widget';
    widgetContainer.appendChild(widgetInner);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: 'OANDA:XAUUSD', title: 'XAU/USD (Gold)' },
        { proName: 'FX:EURUSD', title: 'EUR/USD' },
        { proName: 'FX:GBPUSD', title: 'GBP/USD' },
        { proName: 'FX:USDJPY', title: 'USD/JPY' },
        { proName: 'CAPITALCOM:US30', title: 'US30' },
        { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
      ],
      showSymbolLogo: true,
      isTransparent: true,
      displayMode: 'adaptive',
      colorTheme: 'dark',
      locale: 'id',
    });

    widgetContainer.appendChild(script);
    containerRef.current.appendChild(widgetContainer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-[46px] overflow-hidden bg-[#0A0A0A] border-b border-[#222222]"
    />
  );
};
