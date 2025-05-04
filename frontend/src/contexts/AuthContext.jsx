// import axios from "axios";
// import { createContext, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export const Authcontext = createContext({});

// const client = axios.create({
//     baseURL: "http://localhost:8000/api/v1/users", // Fixed baseURL
// });

// export const AuthProvider = ({ children }) => {
//     const [userData, setUserData] = useState(null); 
//     const navigate = useNavigate(); 

//     // Handle User Registration
//     const handleRegister = async (name, username, password) => {
//         try {
//             let request = await client.post("/register", {
//                 name,
//                 username,
//                 password, // Fixed Password casing
//             });

//             if (request.status === 201) { // Fixed httpStatus.CREATED issue
//                 return request.data.message;
//             }
//         } catch (err) {
//             throw err;
//         }
//     };

//     // Handle User Login
//     const handleLogin = async (username, password) => {
//         try {
//             let request = await client.post("/login", {
//                 username,
//                 password, // Fixed Password casing
//             });

//             if (request.status === 200) { // Fixed httpStatus.Ok issue
//                 localStorage.setItem("token", request.data.token);
//                 setUserData(request.data.user); // Update userData state
//                 navigate("/dashboard"); // Redirect after login
//             }
//         } catch (err) {
//             throw err;
//         }
//     };

//     const data = {
//         userData,
//         setUserData,
//         handleRegister,
//         handleLogin, // Added handleLogin
//     };

//     return <Authcontext.Provider value={data}>{children}</Authcontext.Provider>;
// };
import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment.jsx";


export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})


export const AuthProvider = ({ children }) => {

    const authContext = useContext(AuthContext);


    const [userData, setUserData] = useState(authContext);


    const router = useNavigate();

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })


            if (request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch (err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            console.log(username, password)
            console.log(request.data)

            if (request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                router("/home")
            }
        } catch (err) {
            throw err;
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data
        } catch
         (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }


    const data = {
        userData, setUserData, addToUserHistory, getHistoryOfUser, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )

}
