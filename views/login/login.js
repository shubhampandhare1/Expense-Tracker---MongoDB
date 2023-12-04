const baseUrl = 'http://localhost:3000';
async function login(e) {
    try {
        e.preventDefault();
        const user = {
            email: e.target.email.value,
            password: e.target.password.value
        }
        const response = await axios.post(`${baseUrl}/user/login`, user);
        // console.log(response.data.token)
        if (response.data.success == true) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('expPerPage', 10);
            // alert(response.data.message);
            window.location.href = '../expense/expense.html';
        }
    }
    catch (err) {
        console.log(err)
        let error = document.getElementById('error');
        error.innerHTML = `<p style="color:red;">${err.response.data.message}</p>`;
        console.log(err)
    }
}