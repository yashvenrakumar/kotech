import React, { useRef, useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import CanvasDraw from "react-canvas-draw";
import io from "socket.io-client";

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

const Whiteboard = () => {
  const { sessionId } = useParams();
  const socket = useRef(null);
  const canvasRef = useRef(null);
  const [color, setColor] = useState("#000");
  const [tool, setTool] = useState("pen");
  const [poolSize, setPoolSize] = useState(0);
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    socket.current = io.connect("http://localhost:5000");

    const username = prompt("Enter your username:");

    // Join the session
    socket.current.emit("joinSession", { sessionId, username });

    // Listen for session updates (users list)
    socket.current.on("sessionUpdated", (data) => {
      setPoolSize(data.connectedUsers || 0);
      setActiveUsers(data.users || []);
    });

    // Load initial canvas data
    socket.current.on("loadCanvas", (data) => {
      if (canvasRef.current) {
        canvasRef.current.loadSaveData(data, true);
      }
    });

    // Listen for canvas updates
    socket.current.on("updateCanvas", (data) => {
      if (canvasRef.current) {
        canvasRef.current.loadSaveData(data, true);
      }
    });

    return () => {
      socket.current.disconnect();
    };
  }, [sessionId]);

  const handleDraw = () => {
    if (canvasRef.current) {
      const saveData = canvasRef.current.getSaveData();
      socket.current.emit("updateCanvas", { sessionId, data: saveData });
    }
  };

  const handleDrawDebounced = useCallback(
    debounce(handleDraw, 500),
    []
  );

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      const saveData = canvasRef.current.getSaveData();
      socket.current.emit("updateCanvas", { sessionId, data: saveData });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        Connected Users: <span className="text-blue-600">{poolSize}</span>
      </h2>
      <ul className="text-sm text-gray-600 mb-4">
        {activeUsers.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Whiteboard - Session ID:{" "}
        <span className="text-blue-600">{sessionId}</span>
      </h2>
      <div className="flex flex-wrap items-center justify-center gap-4 mb-6 bg-white p-4 rounded shadow-md w-full max-w-2xl">
        <button
          onClick={() => setTool("pen")}
          className={`py-2 px-4 rounded ${
            tool === "pen" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
          } shadow hover:bg-blue-600 transition`}
        >
          Pen
        </button>
        <button
          onClick={() => setTool("eraser")}
          className={`py-2 px-4 rounded ${
            tool === "eraser" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"
          } shadow hover:bg-red-600 transition`}
        >
          Eraser
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
        />
        <button
          onClick={handleClearCanvas}
          className="py-2 px-4 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
        >
          Clear
        </button>
      </div>
      <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-lg shadow-md p-4">
        <CanvasDraw
          ref={canvasRef}
          style={{ width: "850px" }}
          onChange={handleDrawDebounced}
          brushColor={tool === "pen" ? color : "#fff"}
          brushRadius={tool === "pen" ? 2 : 10}
          lazyRadius={0}
        />
      </div>
    </div>
  );
};

export default Whiteboard;


// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import CanvasDraw from "react-canvas-draw";
// import io from "socket.io-client";

// // Custom debounce function
// const debounce = (func, delay) => {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

// const Whiteboard = () => {
//   const { sessionId } = useParams();
//   const socket = useRef(null); // Keep socket instance in useRef
//   const canvasRef = useRef(null);
//   const [color, setColor] = useState("#000");
//   const [tool, setTool] = useState("pen");
//   const [poolSize, setPoolSize] = useState(0);

//   useEffect(() => {
//     // Establish socket connection
//     socket.current = io.connect("http://localhost:5000"); // Backend server URL

//     // Listen for pool updates (connected users count)
//     socket.current.on("joinSession", (data) => {
//       setPoolSize(data.connectedUsers);
//       console.log("data connectedUsers", data);
//     });

//     // Load the current canvas data from the server
//     socket.current.on("loadCanvas", (data) => {
//       if (data && canvasRef.current) {
//         try {
//           canvasRef.current.loadSaveData(data);
//         } catch (error) {
//           console.error("Error loading canvas data:", error);
//         }
//       }
//     });

//     // Listen for canvas updates from other users
//     socket.current.on("updateCanvas", (data) => {
//       if (canvasRef.current) {
//         try {
//           canvasRef.current.loadSaveData(data, true); // Load without overwriting history
//         } catch (error) {
//           console.error("Error updating canvas:", error);
//         }
//       }
//     });

//     // Cleanup socket connection when the component unmounts
//     return () => {
//       socket.current.disconnect();
//     };
//   }, [sessionId]);

//   // Handle drawing changes
//   const handleDraw = () => {
//     if (canvasRef.current) {
//       const saveData = canvasRef.current.getSaveData(); // Get canvas data
//       if (socket.current) {
//         socket.current.emit("updateCanvas", saveData); // Emit updated data to the server
//       } else {
//         console.error("Socket is not initialized.");
//       }
//     }
//   };

//   // Apply debouncing on the handleDraw function
//   const handleDrawDebounced = useCallback(
//     debounce(handleDraw, 500), // 500ms debounce delay
//     [] // Empty dependency array ensures debounce is created once
//   );

//   // Handle canvas clearing
//   const handleClearCanvas = () => {
//     if (canvasRef.current) {
//       canvasRef.current.clear(); // Clear canvas locally
//       const saveData = canvasRef.current.getSaveData(); // Get empty canvas data
//       if (socket.current) {
//         socket.current.emit("updateCanvas", saveData); // Emit updated (empty) data to the server
//       } else {
//         console.error("Socket is not initialized.");
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
//       <h2>Connected Users: {poolSize}</h2>

//       <h2 className="text-2xl font-bold text-gray-800 mb-6">
//         Whiteboard - Session ID:{" "}
//         <span className="text-blue-600">{sessionId}</span>
//       </h2>
//       <div className="flex flex-wrap items-center justify-center gap-4 mb-6 bg-white p-4 rounded shadow-md w-full max-w-2xl">
//         <button
//           onClick={() => setTool("pen")}
//           className={`py-2 px-4 rounded ${
//             tool === "pen"
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-blue-600 transition`}
//         >
//           Pen
//         </button>
//         <button
//           onClick={() => setTool("eraser")}
//           className={`py-2 px-4 rounded ${
//             tool === "eraser"
//               ? "bg-red-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-red-600 transition`}
//         >
//           Eraser
//         </button>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//           className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
//         />
//         <button
//           onClick={handleClearCanvas}
//           className="py-2 px-4 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
//         >
//           Clear
//         </button>
//       </div>
//       <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-lg shadow-md p-4">
//         <CanvasDraw
//           ref={canvasRef}
//           style={{ width: "850px" }}
//           onChange={handleDrawDebounced} // Use the debounced version
//           brushColor={tool === "pen" ? color : "#fff"}
//           brushRadius={tool === "pen" ? 2 : 10}
//           lazyRadius={0}
//         />
//       </div>
//     </div>
//   );
// };

// export default Whiteboard;

// import React, { useRef, useEffect, useState, useCallback } from "react";
// import { useParams } from "react-router-dom";
// import CanvasDraw from "react-canvas-draw";
// import io from "socket.io-client";

// // Custom debounce function
// const debounce = (func, delay) => {
//   let timer;
//   return (...args) => {
//     clearTimeout(timer);
//     timer = setTimeout(() => {
//       func(...args);
//     }, delay);
//   };
// };

// const Whiteboard = () => {
//   const { sessionId } = useParams();
//   const socket = useRef(null); // Keep socket instance in useRef
//   const canvasRef = useRef(null);
//   const [color, setColor] = useState("#000");
//   const [tool, setTool] = useState("pen");
//   const [poolSize, setPoolSize] = useState(0);

//   useEffect(() => {
//     // Establish socket connection
//     socket.current = io.connect("http://localhost:5000"); // Backend server URL

//     // Listen for pool updates (connected users count)
//     socket.current.on("joinSession", (data) => {
//       setPoolSize(data.connectedUsers);
//       console.log("data connectedUsers", data);
//     });

//     // Load the current canvas data from the server
//     socket.current.on("loadCanvas", (data) => {
//       if (data && canvasRef.current) {
//         try {
//           canvasRef.current.loadSaveData(data);
//         } catch (error) {
//           console.error("Error loading canvas data:", error);
//         }
//       }
//     });

//     // Listen for canvas updates from other users
//     socket.current.on("updateCanvas", (data) => {
//       if (canvasRef.current) {
//         try {
//           canvasRef.current.loadSaveData(data, true); // Load without overwriting history
//         } catch (error) {
//           console.error("Error updating canvas:", error);
//         }
//       }
//     });

//     // Cleanup socket connection when the component unmounts
//     return () => {
//       socket.current.disconnect();
//     };
//   }, [sessionId]);

//   // Handle drawing changes
//   const handleDraw = () => {
//     if (canvasRef.current) {
//       const saveData = canvasRef.current.getSaveData(); // Get canvas data
//       if (socket.current) {
//         socket.current.emit("updateCanvas", saveData); // Emit updated data to the server
//       } else {
//         console.error("Socket is not initialized.");
//       }
//     }
//   };

//   // Apply debouncing on the handleDraw function
//   const handleDrawDebounced = () => {
//     handleDraw();
//     // debounce(handleDraw, 500); // 500ms debounce delay
//   };

//   // Handle canvas clearing
//   // const handleClearCanvas = () => {
//   //   socket.current.emit("clearCanvas", { sessionId });
//   //   if (canvasRef.current) {
//   //     canvasRef.current.clear(); // Clear canvas locally
//   //   }
//   // };

//   // Handle canvas clearing
//   const handleClearCanvas = () => {
//     if (canvasRef.current) {
//       const saveData = canvasRef.current.clear(); // Get canvas data
//       if (socket.current) {
//         socket.current.emit("updateCanvas", saveData); // Emit updated data to the server
//       } else {
//         console.error("Socket is not initialized.");
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
//       <h2>Connected Users: {poolSize}</h2>

//       <h2 className="text-2xl font-bold text-gray-800 mb-6">
//         Whiteboard - Session ID:{" "}
//         <span className="text-blue-600">{sessionId}</span>
//       </h2>
//       <div className="flex flex-wrap items-center justify-center gap-4 mb-6 bg-white p-4 rounded shadow-md w-full max-w-2xl">
//         <button
//           onClick={() => setTool("pen")}
//           className={`py-2 px-4 rounded ${
//             tool === "pen"
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-blue-600 transition`}
//         >
//           Pen
//         </button>
//         <button
//           onClick={() => setTool("eraser")}
//           className={`py-2 px-4 rounded ${
//             tool === "eraser"
//               ? "bg-red-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-red-600 transition`}
//         >
//           Eraser
//         </button>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//           className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
//         />
//         <button
//           onClick={handleClearCanvas}
//           className="py-2 px-4 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
//         >
//           Clear
//         </button>
//       </div>
//       <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-lg shadow-md p-4">
//         <CanvasDraw
//           ref={canvasRef}
//           style={{ width: "850px" }}
//           onChange={handleDrawDebounced} // Use the debounced version
//           brushColor={tool === "pen" ? color : "#fff"}
//           brushRadius={tool === "pen" ? 2 : 10}
//           lazyRadius={0}
//         />
//       </div>
//     </div>
//   );
// };

// export default Whiteboard;

// import React, { useRef, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import CanvasDraw from "react-canvas-draw";
// import io from "socket.io-client";

// const Whiteboard = () => {
//   const { sessionId } = useParams();
//   const socket = useRef(null); // Keep socket instance in useRef
//   const canvasRef = useRef(null);
//   const [color, setColor] = useState("#000");
//   const [tool, setTool] = useState("pen");
//   const [poolSize, setPoolSize] = useState(0);

//   useEffect(() => {
//     // Establish socket connection
//     socket.current = io.connect("http://localhost:5000"); // Backend server URL

//     // Listen for pool updates (connected users count)
//     socket.current.on("joinSession", (data) => {
//       setPoolSize(data.connectedUsers);
//       console.log("data connectedUsers", data);
//     });

//     // Load the current canvas data from the server
//     socket.current.on("loadCanvas", (data) => {
//       if (data && canvasRef.current) {
//         canvasRef.current.loadSaveData(data);
//       }
//     });

//     // Listen for canvas updates from other users
//     socket.current.on("updateCanvas", (data) => {
//       if (canvasRef.current) {
//         canvasRef.current.loadSaveData(data, false); // Load without overwriting history
//       }
//     });

//     // Cleanup socket connection when the component unmounts
//     return () => {
//       socket.current.disconnect();
//     };

//   }, [sessionId]);

//   // Handle drawing changes
//   const handleDraw = () => {
//     if (canvasRef.current) {
//       const saveData = canvasRef.current.getSaveData(); // Get canvas data
//       if (socket.current) {
//         socket.current.emit("updateCanvas", saveData); // Emit updated data to the server
//       } else {
//         console.error("Socket is not initialized.");
//       }
//     }
//   };

//   // Handle canvas clearing
//   const handleClearCanvas = () => {
//     socket.current.emit("clearCanvas", { sessionId });
//     if (canvasRef.current) {
//       canvasRef.current.clear(); // Clear canvas locally
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
//       <h2>Connected Users: {poolSize}</h2>

//       <h2 className="text-2xl font-bold text-gray-800 mb-6">
//         Whiteboard - Session ID:{" "}
//         <span className="text-blue-600">{sessionId}</span>
//       </h2>
//       <div className="flex flex-wrap items-center justify-center gap-4 mb-6 bg-white p-4 rounded shadow-md w-full max-w-2xl">
//         <button
//           onClick={() => setTool("pen")}
//           className={`py-2 px-4 rounded ${
//             tool === "pen"
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-blue-600 transition`}
//         >
//           Pen
//         </button>
//         <button
//           onClick={() => setTool("eraser")}
//           className={`py-2 px-4 rounded ${
//             tool === "eraser"
//               ? "bg-red-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-red-600 transition`}
//         >
//           Eraser
//         </button>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//           className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
//         />
//         <button
//           onClick={handleClearCanvas}
//           className="py-2 px-4 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
//         >
//           Clear
//         </button>
//       </div>
//       <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-lg shadow-md p-4">
//         <CanvasDraw
//           ref={canvasRef}
//           style={{ width: "850px" }}
//           onChange={handleDraw}
//           brushColor={tool === "pen" ? color : "#fff"}
//           brushRadius={tool === "pen" ? 2 : 10}
//           lazyRadius={0}
//         />
//       </div>
//     </div>
//   );
// };

// export default Whiteboard;

// import React, { useRef, useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import CanvasDraw from "react-canvas-draw";
// import io from "socket.io-client";
// import axios from "axios";

// const Whiteboard = () => {
//   const { sessionId } = useParams();
//   const socket = useRef(null);
//   const canvasRef = useRef(null);
//   const [color, setColor] = useState("#000");
//   const [tool, setTool] = useState("pen");

//   const [sessionData, setSessionData] = useState(null); // State to hold session data

//   const getSession = async () => {
//     const token = localStorage.getItem("token");

//     if (!token) {
//       alert("No token found. Please log in again.");
//       return;
//     }

//     try {
//       const response = await axios.get(
//         `http://localhost:5000/api/session/${sessionId}`, // Fixed the URL
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, // Added Bearer token here
//           },
//         }
//       );

//       // Collecting the response data in state
//       setSessionData(response.data);
//       } catch (error) {
//        alert("Failed to retrieve session. Please try again.");
//     }
//   };

//   useEffect(() => {

//     getSession();

//     socket.current = io("http://localhost:5000/api/session", {
//       extraHeaders: {
//         Authorization: `Bearer ${localStorage.getItem("token")}`,
//       },
//       query: {
//         sessionId, // Pass sessionId as a query parameter
//       },
//     });
//     socket.current.on("drawing", (data) => {
//       if (canvasRef.current) {
//         canvasRef.current.loadSaveData(data, true);
//       }
//     });

//     return () => {
//       socket.current.disconnect();
//     };
//   }, [sessionId]);

//   const handleDraw = () => {
//     const data = canvasRef.current.getSaveData();
//     socket.current.emit("drawing", data);
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-100 to-indigo-100 p-6">
//       {sessionData && sessionData['users'].length} Users
//       <h2 className="text-2xl font-bold text-gray-800 mb-6">
//         Whiteboard - Session ID:{" "}
//         <span className="text-blue-600">{sessionId}</span>
//       </h2>
//       <div className="flex flex-wrap items-center justify-center gap-4 mb-6 bg-white p-4 rounded shadow-md w-full max-w-2xl">
//         <button
//           onClick={() => setTool("pen")}
//           className={`py-2 px-4 rounded ${
//             tool === "pen"
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-blue-600 transition`}
//         >
//           Pen
//         </button>
//         <button
//           onClick={() => setTool("eraser")}
//           className={`py-2 px-4 rounded ${
//             tool === "eraser"
//               ? "bg-red-500 text-white"
//               : "bg-gray-200 text-gray-800"
//           } shadow hover:bg-red-600 transition`}
//         >
//           Eraser
//         </button>
//         <input
//           type="color"
//           value={color}
//           onChange={(e) => setColor(e.target.value)}
//           className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
//         />
//         <button
//           onClick={() => socket.current.emit("clearCanvas")}
//           className="py-2 px-4 bg-yellow-500 text-white rounded shadow hover:bg-yellow-600 transition"
//         >
//           Clear
//         </button>
//       </div>
//       <div className="w-full max-w-4xl bg-white border border-gray-300 rounded-lg shadow-md p-4">
//         <CanvasDraw
//           ref={canvasRef}
//           style={{ width: "850px"}}
//           onChange={handleDraw}
//           brushColor={tool === "pen" ? color : "#fff"}
//           brushRadius={tool === "pen" ? 2 : 10}
//           lazyRadius={0}
//         />
//       </div>
//     </div>
//   );
// };

// export default Whiteboard;

// // Fetch session data
// const getSession = async () => {
//   if (!token) {
//     alert("No token found. Please log in again.");
//     return;
//   }

//   try {
//     const response = await axios.get(
//       `http://localhost:5000/api/session/${sessionId}`, // Adjusted the URL
//       {
//         headers: {
//           Authorization: `Bearer ${token}`, // Added Bearer token here
//         },
//       }
//     );
//     setSessionData(response.data); // Store session data
//   } catch (error) {
//     alert("Failed to retrieve session. Please try again.");
//   }
// };
