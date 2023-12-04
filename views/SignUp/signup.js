const baseUrl = 'http://localhost:3000';;
async function signup(event) {

    try {
        event.preventDefault();

        const user = {
            name: event.target.name.value,
            email: event.target.email.value,
            password: event.target.password.value
        }

        // console.log(user);
        const response = await axios.post(`${baseUrl}/user/signup`, user);
        // console.log('User Created',response.data);
        if (response.data.success == true) {
            let errDiv = document.createElement('div');
            let existing = document.getElementById('existing');
            errDiv.innerHTML = `<div style="color:green">${response.data.message}</div>`;
            existing.appendChild(errDiv);
        }

    } catch (err) {
        console.log("User Exists", err)
        if (err.response.data.error) {
            let errDiv = document.createElement('div');
            let existing = document.getElementById('existing');
            errDiv.innerHTML = `<div style="color:red">${err.message}</div>`;
            existing.appendChild(errDiv);
        }
    }
}