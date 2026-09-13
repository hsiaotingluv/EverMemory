const paths={
arrowUpRight:'<path d="M5 19 19 5M6 5h13v13"/>',
arrowRight:'<path d="M4 12h16m-6-6 6 6-6 6"/>',

 sound:'<path d="M4 10h4l5-4v12l-5-4H4zM16 9c2 1 2 5 0 6M19 6c4 3 4 9 0 12"/>',
 muted:'<path d="M4 10h4l5-4v12l-5-4H4zM17 9l5 6m0-6-5 6"/>',
 journal:'<path d="M12 6C9 4 5 4 3 5v14c3-1 6-1 9 1 3-2 6-2 9-1V5c-2-1-6-1-9 1Zm0 0v14M6 8h3m-3 3h3m6-3h3m-3 3h3"/>',
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Zm6-3v15m6-12v15"/>',
 settings:'<path d="M9 5v14M15 5v14"/>',
 ticket:'<path d="M4 6h16v4c-3 0-3 4 0 4v4H4v-4c3 0 3-4 0-4ZM15 6v2m0 2v2m0 2v2m0 1v1M7 9h5m-5 3h4m-4 3h5"/>',
 bowl:'<path d="M3 11h18c0 6-4 8-9 8s-9-2-9-8Zm5 8v2h8v-2M8 3c-2 2 2 3 0 5m5-6c-2 2 2 3 0 5m5-4c-2 2 2 3 0 5"/>',
 tea:'<path d="M5 10h12v6c0 4-12 4-12 0Zm12 1h2c4 0 3 5-2 4M3 21h17M8 3c-2 2 2 3 0 5m5-6c-2 2 2 3 0 5"/>',
 film:'<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 3v18m8-18v18M4 7h4m-4 5h4m-4 5h4m8-10h4m-4 5h4m-4 5h4M8 12h8"/>',
 cat:'<path d="m5 12-1-8 6 4h4l6-4-1 8c5 9-19 9-14 0ZM8 13h1m6 0h1m-5 3 1 1 1-1M2 14l5 1m-5 3 5-1m10-2 5-1m-5 3 5 1"/>',
 lantern:'<path d="M12 2v3M7 5h10M7 20h10m-5 0v3M6 7c-4 5-2 10 1 12h10c3-2 5-7 1-12ZM9 7c-2 5-2 8 0 12m6-12c2 5 2 8 0 12M12 7v12"/>',
 lock:'<rect x="6" y="10" width="12" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3"/>',
};
export const icon=(name)=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${paths[name]??paths.lantern}</svg>`;
