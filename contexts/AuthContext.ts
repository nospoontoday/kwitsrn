import { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  setUser: (p0: null) => {},
  echo: null
});

export default AuthContext;