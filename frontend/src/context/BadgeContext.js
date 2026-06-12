import { createContext, useContext, useState } from 'react';

// Κοινός μετρητής για το badge της καρτέλας Εισιτήρια (επερχόμενες κρατήσεις)
const Ctx = createContext(null);
export const useBadge = () => useContext(Ctx);

export function BadgeProvider({ children }) {
  const [ticketsCount, setTicketsCount] = useState(0);
  return <Ctx.Provider value={{ ticketsCount, setTicketsCount }}>{children}</Ctx.Provider>;
}
