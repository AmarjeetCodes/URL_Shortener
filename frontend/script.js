// const inputField = document.getElementById("urlShortener")
// const shortenButton = document.getElementById("shortenURL");
// const result = document.getElementById("result");

// shortenButton.addEventListener("click", async ()=>{
//     const longURL = inputField.value.trim();

//     if(longURL===""){
//         alert("please enter a valid URL");
//         return;
//     }

//     try{
//         const response = await fetch ("https://url-shortener-backend-gmlc.onrender.com/shorten" ,{
//             method:"POST",
//             headers:{
//                 "content-type" : "application/json"
//             },
//             body:JSON.stringify({longURL})
//         });

//         const data =await response.json();
//         const shortCode = data.shortCode;
//         const fullRedirectLink = `https://url-shortener-backend-gmlc.onrender.com/${shortCode}`;
//         result.innerHTML = `<a href="${fullRedirectLink}" target="_blank">${shortCode}</a>`;

//     }
//     catch(error){
//         console.log("error : ",error);
//         alert("some error ...check console");

//     }

// });

// for local host


const inputField = document.getElementById("urlShortener")
const shortenButton = document.getElementById("shortenURL");
const result = document.getElementById("result");

shortenButton.addEventListener("click", async ()=>{
    const longURL = inputField.value.trim();

    if(longURL===""){
        alert("please enter a valid URL");
        return;
    }

    try{
        const response = await fetch("https://url-shortener-backend-gmlc.onrender.com/shorten" ,{
            method:"POST",
            headers:{
                "content-type" : "application/json"
            },
            body:JSON.stringify({longURL})
        });

        const data = await response.json(); // You missed this
        console.log("Shortened code received:", data.shortCode);
        
        const shortCode = data.shortCode;
        const fullRedirectLink = `https://url-shortener-backend-gmlc.onrender.com/${shortCode}`;

        result.innerHTML = `<a href="${fullRedirectLink}" target="_blank">${shortCode}</a>`;

    }
    catch(error){
        console.log("error : ",error);
        alert("some error ...check console");

    }

});
