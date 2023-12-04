const token = localStorage.getItem('token');
const baseUrl = 'http://localhost:3000';
let editId = null;
//show premium user badge on screen
function showPremiumUser() {
    const premiumText = document.createElement('h4');
    premiumText.innerText = 'Premium User';
    premiumText.className = 'text-warning text-center';
    document.getElementById('isPremium').append(premiumText);
    document.getElementById('rzp-button1').style.display = 'none';
}

//funtion to parse JWT token
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', async () => {
    try {
        document.querySelector('#expenseperpage').value = localStorage.getItem('expPerPage');   //show default no. of expenses per page

        const page = 1;
        getExpenses(page);

        const decodeToken = parseJwt(token);

        if (decodeToken.ispremiumuser) {
            showPremiumUser();  //premium feature
            showleaderboard(page);  //premium feature
        } else {
            document.getElementById('rzp-button1').style.visibility = 'visible';
        }
        //shows list of reecntly downloaded expense files
        recentdownload();

    } catch (error) {
        showError(error);
    }
})

function showPagination(pageData) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    if (pageData.hasPrevPage) {
        const btn3 = document.createElement('button');
        btn3.className = 'btn btn-light'
        btn3.innerHTML = `${pageData.prevPage}`;
        btn3.addEventListener('click', () => getExpenses(pageData.prevPage))
        pagination.appendChild(btn3);
    }
    const btn1 = document.createElement('button');
    btn1.className = 'btn btn-light m-1 btn-lg'
    btn1.innerHTML = `${pageData.currPage}`;
    btn1.addEventListener('click', () => getExpenses(pageData.currPage))
    pagination.appendChild(btn1);

    if (pageData.hasNextPage) {
        const btn2 = document.createElement('button');
        btn2.className = 'btn btn-light'
        btn2.innerHTML = `${pageData.nextPage}`;
        btn2.addEventListener('click', () => getExpenses(pageData.nextPage))
        pagination.appendChild(btn2);
    }
}

//show expenses on particular page that user clicks
async function getExpenses(page) {
    try {
        const pagesize = localStorage.getItem('expPerPage');
        const response = await axios.get(`${baseUrl}/expense/get-expense?pagesize=${pagesize}&page=${page}`, { headers: { "Authorization": token } })

        const expArr = response.data.expenses;
        document.getElementById('tbody').innerHTML = '';
        expArr.forEach((exp) => {
            showExpenseInTable(exp)
        })
        showPagination(response.data);
    } catch (error) {
        showError(error)
    }
}

//To add expenses for the user
async function addExpense(event) {
    try {
        event.preventDefault();
        let today = new Date().toJSON().slice(0, 10);
        const expense = {
            amount: event.target.amount.value,
            description: event.target.description.value,
            category: event.target.category.value,
            date: today,
        }
        console.log('editId>>>>>>>>', editId)
        if (editId == null) {
            const response = await axios.post(`${baseUrl}/expense/add-expense`, expense, { headers: { "Authorization": token } });
            
            showExpenseInTable(response.data.newExpense);
        }
        else {
            await axios.put(`${baseUrl}/expense/edit-expense/${editId}`, expense, { headers: { "Authorization": token } })
            location.reload();
        }

    } catch (error) {
        showError(error)
    }
}

function showExpenseInTable(expense) {
    let tr = document.createElement('tr');
    let td1 = tr.appendChild(document.createElement('td'));
    let td2 = tr.appendChild(document.createElement('td'));
    let td3 = tr.appendChild(document.createElement('td'));
    let td4 = tr.appendChild(document.createElement('td'));
    let td5 = tr.appendChild(document.createElement('td'));
    const date = expense.date;
    td1.innerHTML = date.substring(0, 10);
    td2.innerHTML = expense.amount;
    td3.innerHTML = expense.description;
    td4.innerHTML = expense.category;

    //edit buuton
    let editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.id = 'edit-expense';
    editBtn.classList = 'btn btn-primary btn-sm';
    editBtn.setAttribute('data-bs-toggle', 'modal');
    editBtn.setAttribute('data-bs-target', '#editexpense');
    editBtn.onclick = async () => {
        editId = expense._id;
        document.getElementById('edit-amount').value = expense.amount;
        document.getElementById('edit-description').value = expense.description;
        document.getElementById('edit-category').value = expense.category;
    }

    //delete button
    let delBtn = document.createElement('button');
    delBtn.innerText = 'Delete';
    delBtn.classList = 'btn btn-danger btn-sm ms-2'
    delBtn.onclick = async () => {
        try {
            const id = expense._id;

            await axios.delete(`${baseUrl}/expense/delete-expense/${id}`, { headers: { "Authorization": token } })
            document.getElementById('tbody').removeChild(tr);
        } catch (error) {
            showError(error);
        }
    }

    td5.appendChild(editBtn);
    td5.appendChild(delBtn);
    document.getElementById('tbody').appendChild(tr);
}


//Buy Premium Button feature + Razorpay
document.getElementById('rzp-button1').onclick = async (event) => {
    try {
        const response = await axios.get(`${baseUrl}/purchase/premiummembership`, { headers: { "Authorization": token } });

        let options = {
            "key": response.data.key_id,    //Enter the KeyId generated from dahsboard
            "order_id": response.data.order.orderid,    //For one time payment
            //This handler function will handle the success payment
            "handler": async function (response) {
                const res = await axios.post(`${baseUrl}/purchase/updatetransactionstatus`, {
                    orderid: options.order_id,
                    paymentid: response.razorpay_payment_id,
                }, { headers: { "Authorization": token } })
                alert('You are Premium User Now!');
                localStorage.setItem('token', res.data.token);
                showPremiumUser();
                showleaderboard();
            }
        }
        const rzp1 = new Razorpay(options);
        rzp1.open();
        event.preventDefault();
        rzp1.on('payment.failed', function (response) {
            axios.post(`${baseUrl}/purchase/updatetransactionstatus`, {
                orderid: options.order_id,
                paymentid: response.error.reason,
            }, { headers: { "Authorization": token } })
            alert('Payment Failed => Try Again');
        })
    } catch (err) {
        console.log(err);
    }

}

async function showlbpagination(page) {
    try {
        const response = await axios.get(`${baseUrl}/premium/showleaderboard?page=${page}`, { headers: { 'Authorization': token } });
        const leaderboardList = document.getElementById('lb-tbody');
        leaderboardList.innerHTML = '';
        response.data.leaderboardofUsers.forEach((userDeatails) => {
            let tr = document.createElement('tr');
            let td1 = document.createElement('td');
            let td2 = document.createElement('td');
            td1.innerText = `${userDeatails.name}`;
            td2.innerText = `${userDeatails.totalExpense}`;
            tr.appendChild(td1);
            tr.appendChild(td2);
            leaderboardList.appendChild(tr);
        })
        lbPagination(response.data)
    } catch (error) {
        showError(error)
    }
}


function showleaderboard(page) {
    showlbpagination(page);
    document.getElementById('lb-button').style.visibility = 'visible';
    document.getElementById('show-lb').onclick = async () => {
        showlbpagination(1);
    }
}

function lbPagination(pageData) {
    const pagination = document.getElementById('lbpagination');
    pagination.innerHTML = '';
    if (pageData.hasPrevPage) {
        const btn3 = document.createElement('button');
        btn3.className = 'btn btn-light'
        btn3.innerHTML = `${pageData.prevPage}`;
        btn3.addEventListener('click', () => showleaderboard(pageData.prevPage))
        pagination.appendChild(btn3);
    }
    const btn1 = document.createElement('button');
    btn1.className = 'btn btn-light m-1 btn-lg'
    btn1.innerHTML = `${pageData.currPage}`;
    btn1.addEventListener('click', () => showleaderboard(pageData.currPage))
    pagination.appendChild(btn1);

    if (pageData.hasNextPage) {
        const btn2 = document.createElement('button');
        btn2.className = 'btn btn-light'
        btn2.innerHTML = `${pageData.nextPage}`;
        btn2.addEventListener('click', () => showleaderboard(pageData.nextPage))
        pagination.appendChild(btn2);
    }
}

//download expense file
async function download() {
    try {
        const response = await axios.get(`${baseUrl}/premium/download`, { headers: { "Authorization": token } })

        if (response.status == 200) {
            let a = document.createElement('a');
            a.href = response.data.url;
            a.download = 'myexpenses.csv';
            a.click();
        }
        else {
            throw new Error(response.message);
        }
    } catch (err) {
        console.log(err)
        showError(err.response.data);
    }
}

//show recently downloaded expense files
async function recentdownload() {
    try {
        const response = await axios.get(`${baseUrl}/premium/recentdownload`, { headers: { "Authorization": token } })
        let recentdownloads = document.getElementById('recentdownloads');
        response.data.forEach((data) => {
            let file = document.createElement('li');
            const date = (data.date).substring(0,10);
            file.innerHTML = `<a href="${data.fileUrl}">Downloaded On ${date}  </a>`;
            recentdownloads.appendChild(file);
        })
    } catch (err) {
        showError(err);
    }
}

function showError(err) {
    document.getElementById('error').innerHTML = `<div style="color:Red;">${err.message}</div>`
}

//store number of expenses to show per page in local storage
document.querySelector('#expenseperpage').addEventListener("change", () => {
    localStorage.setItem('expPerPage', document.querySelector('#expenseperpage').value);
    location.reload();
})