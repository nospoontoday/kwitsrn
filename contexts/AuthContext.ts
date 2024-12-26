import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  setUser: (p0: null) => {},
});

export default AuthContext;