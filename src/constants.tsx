export const baseUrl = "http://localhost:8000/";
export const baseUrlMedia = "http://localhost:8000";
export const baseWsUrl = "ws://localhost:8000/";

//export const baseUrl = "http://92.112.194.239:6161/";
//export const baseUrlMedia = "http://92.112.194.239:6161";
//export const baseWsUrl = "ws://92.112.194.239:6161/";



//export const baseUrl = "http://localhost:5050/";
//export const baseWsUrl = "ws://localhost:5050/";

//export const userToken = localStorage.getItem('token');
export const userToken = localStorage.getItem('token');
export const userID = localStorage.getItem('user_id');

export const userEmail = localStorage.getItem('email');

export const username = localStorage.getItem('username');


export const userPhoto = localStorage.getItem('photo');
export const projectID = localStorage.getItem('projectID');
export const project_name = localStorage.getItem('project_name');


export const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  
  export const LANGUAGE_VERSIONS = {
    javascript: "18.15.0",
    typescript: "5.0.3",
    python: "3.10.0",
    java: "15.0.2",
    csharp: "6.12.0",
    php: "8.2.3",
  };
  