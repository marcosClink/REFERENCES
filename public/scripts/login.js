

document.addEventListener('DOMContentLoaded', function () {
    var modal = document.getElementById('loginModal');
    var link = document.getElementById('openModal');
    const labelWel = document.getElementById('login-label');
    const modalContent = document.getElementById('login-content');
    window.modeDev = false;

    //starting permission block:
    if (!modeDev) {
        const div = document.querySelector('#all-actions');
        elements = div.querySelectorAll('button,input,select');
        elements.forEach(element => {
            //   element.disabled = false;
            makeElementNotClickable(element);
        });
    }

    // Open modal on link click
    link.addEventListener('click', event => {
        event.preventDefault(); // Prevent default anchor action

        fetch('/views/login.html')
            .then(response => response.text())
            .then(html => {

                modalContent.innerHTML = html; // Load form content
                modal.style.display = 'flex'; // Show modal

                const closeModal = document.getElementById('login-close');
                if (closeModal) {
                    closeModal.addEventListener('click', function () {
                        modal.style.display = 'none';
                    });
                }

                const btnLogin = modalContent.querySelector('#submitLogin');
                if (btnLogin) {
                    btnLogin.addEventListener('click', function () {
                        const username = modalContent.querySelector('#username').value;
                        const password = modalContent.querySelector('#password').value;

                        // Send login request
                        fetch('/api/login', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ username, password })
                        })
                            .then(response => response.json())
                            .then(data => {
                                if (data.message == 'success') {
                                    console.log('Login success');
                                    window.sharedPermission = data.permission;
                                    permissionsElements(data.permission, data.workername)
                                    modal.style.display = 'none'; // Optionally close the modal
                                } 
                                else {
                                    console.log('Login failed');
                                    alert('שם משתמש או סיסמא אינם נכונים');
                                }
                            })
                            .catch(error => console.error(error));
                              
                    });
                }
            });
    });

    //here it only give permission to elements, download and edit will be in the renderTable func
    function permissionsElements(permission, worker_name) {
        labelWel.textContent = " ברוך הבא " + worker_name;
        var elements = [];
        var element1;
        var div1 = [], div2 = [];

        //allow to see but not add/add-file/download/edit - 'VIEWER'
        if (permission >= 1) {
            div1 = Array.from(document.querySelector('#line2').querySelectorAll('button,input,select'));
            div2 = Array.from(document.querySelector('#sum-date-func').querySelectorAll('button,input,select'));
            elements = div1.concat(div2);
        }
        //allow to add manualy - 'ADDING'
        if (permission >= 2) {
            element1 = document.getElementById('open-modal');
            elements.push(element1);
        }
        //allow to edit rows - 'EDITOR'
        if (permission >= 3) {
            //nothing here only in renderTable func
        }
        //allow to add-file and download files - 'ALL-FUNCTIONS'
        if (permission >= 4) {
            //donwload - in renderTable func
           // element1 = document.getElementById('fileInput');
          //  elements.push(element1);
        }
        //admin - now nothing
        if (permission >= 5) {

        }
        elements.forEach(element => {
            makeElementClickable(element);
        });


    }

    // Close modal when clicking outside of it
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });


    function makeElementClickable(element) {
        element.classList.remove('not-clickable');
        element.classList.add('clickable');
    }

    function makeElementNotClickable(element) {
        // element.classList.remove('clickable');
        element.classList.add('not-clickable');
    }


});
