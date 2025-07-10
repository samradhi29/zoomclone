import React, { useContext, useState } from 'react';
import withAuth from '../utils/withAuth';
import { useNavigate } from 'react-router-dom';
import "../App.css";
import { Button, TextField } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext.jsx';

function HomeComponent() {
    const navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);

    const handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    return (
        <>
            {/* NavBar */}
            <div className="navBar" style={{
                backgroundColor: "#0d47a1",
                color: "#ffffff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 32px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
            }}>
                <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600 }}>Apna Video Call</h2>
                <Button
                    variant="contained"
                    onClick={() => {
                        localStorage.removeItem("token");
                        navigate("/auth");
                    }}
                    style={{
                        backgroundColor: "#ffffff",
                        color: "#0d47a1",
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "8px"
                    }}
                >
                    Logout
                </Button>
            </div>

            {/* Main Container */}
            <div className="meetContainer" style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                alignItems: "center",
                height: "calc(100vh - 80px)",
                padding: "40px",
                backgroundColor: "#f0f4f8"
            }}>
                {/* Left Panel */}
                <div className="leftPanel" style={{
                    flex: "1 1 400px",
                    padding: "40px",
                    maxWidth: "600px",
                    background: "linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)",
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                    marginRight: "20px"
                }}>
                    <h2 style={{
                        fontSize: "2.2rem",
                        color: "#0d47a1",
                        marginBottom: "24px",
                        fontFamily: "Poppins, sans-serif"
                    }}>
                        High-Quality Video Calls, Simplified.
                    </h2>

                    <div style={{ display: 'flex', gap: "16px", alignItems: "center" }}>
                        <TextField
                            onChange={e => setMeetingCode(e.target.value)}
                            label="Enter Meeting Code"
                            variant="outlined"
                            fullWidth
                            InputProps={{
                                style: { backgroundColor: "#ffffff", borderRadius: 8 }
                            }}
                        />
                        <Button
                            variant="contained"
                            onClick={handleJoinVideoCall}
                            style={{
                                backgroundColor: "#2196f3",
                                color: "#ffffff",
                                height: "56px",
                                padding: "0 24px",
                                fontWeight: "bold",
                                borderRadius: "8px",
                                textTransform: "none"
                            }}
                        >
                            Join
                        </Button>
                    </div>
                </div>

                {/* Right Panel */}
                <div className='rightPanel' style={{
                    flex: "1 1 300px",
                    textAlign: "center"
                }}>
                    <img
                        src="/logo3.png"
                        alt="Logo"
                        style={{
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: "12px",
                            boxShadow: "0 8px 24px rgba(0,0,0,0.1)"
                        }}
                    />
                </div>
            </div>
        </>
    );
}

export default withAuth(HomeComponent);
