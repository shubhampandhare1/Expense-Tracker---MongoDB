const baseUrl = 'http://localhost:3000';
function forgotPass(event) {
    event.preventDefault();
    const email = {
        email: event.target.email.value
    }

    axios.post(`${baseUrl}/password/forgotpassword`, email)
        .then((response) => {
            // console.log(response)
            if (response.data.success == true){
                alert(response.data.message);
            }
            else{
                alert(response.data.message);
            }
    })
        .catch(err => console.log('error at axios.post forgot pass', err))
}