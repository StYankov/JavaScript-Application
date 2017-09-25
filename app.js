$(() => {
    const appKey = 'kid_HJz7o3UsW';
    const appSecret = 'b04afc56e70e4bb989ae2f553ce7beb8';

    $('#linkHome').click(() => showPage('viewHome'));
    $('#linkLogin').click(() => showPage('viewLogin'));
    $('#linkRegister').click(() => showPage('viewRegister'));
    $('#linkListBooks').click(() => showPage('viewBooks'));
    $('#linkCreateBook').click(() => showPage('viewCreateBook'));
    $('#formLogin').submit(login);
    $('#formRegister').submit(register);

    function showPage(toShow)
    {
       $('section').hide();
       $(`#${toShow}`).show();

    }


    function request(endpoint, method, header, data) {
        let req = {
            url: `https://baas.kinvey.com/${endpoint}`,
            method: method,
            headers: header
        }

        if (data != undefined) {
            req.data = JSON.stringify(data);
        }

        return $.ajax(req);
    }

    function login()
    {
        console.log('Attempting to login...');
        let username = $(this).find('input[name="username"]');
        let password = $(this).find('input[name="passwd"]');

        request(`user/${appKey}/login`, 'POST',
         {"Authorization": "Basic " + btoa(appKey + ':' + appSecret),
            "Content-Type": "application/json"},
         {username: "Pesho", password: "p"}).then(setSession)
        return false;

        function setSession(data)
        {
            sessionStorage.setItem('authToken', data._kmd.authtoken);
            showPage('viewBooks');
        }
    }

    function register()
    {
        let username = $(this).find('input[name="username"]');
        let password = $(this).find('input[name="passwd"]');
        let repeat = $(this).find('input[name="passRepeat"]');
    }
})