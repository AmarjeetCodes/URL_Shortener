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
        const response = await fetch ("http://localhost:5000/shorten" ,{
            method:"POST",
            headers:{
                "content-type" : "application/json"
            },
            body:JSON.stringify({longURL})
        });

        const data =await response.json();
        console.log("shorten url recieved :" , data.shortURL);
        result.innerHTML= `<a href="${data.shortURL}" target="_blank">${data.shortURL}</a>`;
    }
    catch(error){
        console.log("error : ",error);
        alert("some error ...check console");

    }

});