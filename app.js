$(() => {
    const appKey = 'kid_HJz7o3UsW';
    const appSecret = 'b04afc56e70e4bb989ae2f553ce7beb8';
    let infoBox = $('#infoBox');
    let errorBox = $('#errorBox');
    let loadingBox = $('#loadingBox');

    $('#linkHome').click(() => showPage('viewHome'));
    $('#linkLogin').click(() => showPage('viewLogin'));
    $('#linkRegister').click(() => showPage('viewRegister'));
    $('#linkListBooks').click(() => showPage('viewBooks'));
    $('#linkCreateBook').click(() => showPage('viewCreateBook'));
    $('#formLogin').submit(login);
    $('#formRegister').submit(register);
    $('#linkLogout').click(logout);
    $(document).on({
        ajaxStart: () => loadingBox.show(),
        ajaxStop: () => loadingBox.fadeOut()
    })
    infoBox.click(event => $(event.target).hide());
    errorBox.click(event => $(event.target).hide());
    sayGreeting();

    // Display page using selector
    function showPage(toShow) {
        $('section').hide();
        $(`#${toShow}`).show();
        if(toShow == 'viewBooks')
        {
            getBooks();
        }
    }
    
    // ajax request with error catch => handleError
    function request(endpoint, method, header, data) {
        let req = {
            url: `https://baas.kinvey.com/${endpoint}`,
            method: method,
            error: handleError
        }

        if(header != undefined)
        {
            req.headers = header;
        }

        if (data != undefined) {
            req.data = JSON.stringify(data);
        }

        return $.ajax(req);
    }

    function login() {
        let username = $(this).find('input[name="username"]');
        let password = $(this).find('input[name="passwd"]');

        request(`user/${appKey}/login`, 'POST',
            {
                "Authorization": "Basic " + btoa(appKey + ':' + appSecret),
                "Content-Type": "application/json"
            },
            { username: "Pesho", password: "p" })
            .then((data) => 
                setStorage(data.username, data._kmd.authtoken, 'login'));

        return false;

    }

    function register() {
        let username = $(this).find('input[name="username"]');
        let password = $(this).find('input[name="passwd"]');
        let repeat = $(this).find('input[name="passRepeat"]');

        if (repeat.val() == password.val() && password.val().length >= 5 && username.val().length >= 5) {
            request(`user/${appKey}`, 'POST',
                {
                    "Authorization": "Basic " + btoa(appKey + ':' + appSecret),
                    "Content-Type": "application/json"
                },
                {
                    username: username.val(),
                    password: password.val()
                })
            .then((data) => redirect(data));
        }
        else {
            $('#errorBox').show();
            $('#errorBox').text("Your password doesn't match or is too short(min 5)");
            setTimeout(() => $('#errorBox').hide(), 3000);
            password.val('');
            repeat.val('');

        }

        function redirect(data) {
            setStorage(data.username, data._kmd.authtoken, 'register');
        }
        return false;
    }

    // set token in session storage Display unecessary pages Mesage and Show page
    function setStorage(username, token, msgType) {
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('username', username);

        sayGreeting();
        showPage('viewBooks');

        let message;
        if (msgType == 'login') {
            message = 'You have successfully logged in!';
        }
        else {
            message = 'You have registered successfully!';
        }

        infoBox.show().text(message);
        setTimeout(() => infoBox.fadeOut(), 2500);
    }

    //navigation for logged in user
    function updateNavigation()
    {
       $('#linkLogin').hide();
       $('#linkRegister').hide(); 
       $('#linkListBooks').show();
       $('#linkCreateBook').show();
       $('#linkLogout').show();
       showPage('viewBooks');
    }

    // manage menu with loged/unlogged user
    function sayGreeting() {
        let username = sessionStorage.getItem('username');
        if (username != undefined) {
            $('#loggedInUser').text(`Welcome ${username}!`);
            updateNavigation();
        }
        else
        {
            $('#viewHome').show();
            $('#linkLogin').show();
            $('#linkRegister').show(); 
            $('#linkListBooks').hide();
            $('#linkCreateBook').hide();
            $('#linkLogout').hide();
            $('#loggedInUser').text('');
            showPage('viewHome');
        }
    }

    function logout() {
        request(`user/${appKey}/_logout`, 'POST',
            {
                "Authorization": `Kinvey ${sessionStorage.getItem('authToken')}`,
                "Content-Type": "application/json"
            }).then(() => logoutAcc());
    }

    function logoutAcc()
    {
        sessionStorage.clear('username');
        sessionStorage.clear('authToken');
        sayGreeting();
        showPage('viewHome');
    }

    function handleError(err)
    {
        $('#errorBox').show();
        $('#errorBox').text(err.responseJSON.description);
        setTimeout(() => $('#errorBox').hide(), 2500);
    }

    function getBooks()
    {
        request(`appdata/${appKey}/BookLibrary`,'GET',
        {
            "Authorization": `Kinvey ${sessionStorage.getItem('authToken')}`,
            "Content-Type": "application/json"
        })
        .then(displayBooks);
    }

    function displayBooks(data)
    {
        let table = $('#viewBooks table');
        table.empty();
        //header row
        table.append($('<tr>')
                .append($('<th>').text('Title'))
                .append($('<th>').text('Author'))
                .append($('<th>').text('Description'))
                .append($('<th>').text('Actions')));

        for(let book of data)
        {
            let row = $('<tr>');
            row.append(`<td>${book.title}</td>`);
            row.append(`<td>${book.author}</td>`);
            row.append(`<td>${book.description}</td>`);
            row.append(`<td></td>`);
            row.appendTo($('#viewBooks table'))
        }
    }

})