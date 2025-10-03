import React, { useState, useContext, createContext, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [auth, setAuth] = useState({
        user: null,
        token: "",
    });

    // Set axios default header
    axios.defaults.headers.common["Authorization"] = auth?.token;

    // useEffect to load initial data from localStorage
    useEffect(() => {
       const data = localStorage.getItem("auth");
       if (data) {
        const parseData = JSON.parse(data);
        setAuth({
            ...auth,
            user: parseData.user,
            token: parseData.token,
        });
       }
       //eslint-disable-next-line
    }, []);

    // useEffect to save data to localStorage whenever auth state changes
    useEffect(() => {
        if (auth.token) {
            localStorage.setItem("auth", JSON.stringify(auth));
        }
    }, [auth]);

    return (
        <AuthContext.Provider value={[auth, setAuth]}>
            {children}
        </AuthContext.Provider>
    );
};

// custom hook
const useAuth = () => useContext(AuthContext);

export { useAuth, AuthProvider };
