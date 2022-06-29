const URL = "https://forum2022.codeschool.cloud";

var app = new Vue({
    el: "#app",
    data: {
        loginEmailInput: "",
        loginPasswordInput: "",

        newEmailInput: "",
        newPasswordInput: "",
        newFullnameInput: ""
    },
    methods: {
        // GET /session - Ask the server if we are logged in
        getSession: async function () {
            let response = await fetch(`${URL}/session`, {
                method: "GET",
                credentials: "include"
            });

            // Are we logged in?
            if (response.status == 200) {
                // logged in :)
                console.log("logged in");
                let data = await response.json();
                console.log(data);

            } else if (response.status == 401) {
                // Not logged in :(
                console.log("Not logged in");
                let data = await response.json();
                console.log(data);

            } else {
                console.log("Some sort of error when GETTING /session:", response.status, response);
            }
        },
        // POST /session - Attempt to login
        postSession: async function () {
            let loginCredentials = {
                username: this.loginEmailInput, 
                password: this.loginPasswordInput
            };

            let response = await fetch(URL + "/session", {
                method: "POST",
                body: JSON.stringify(loginCredentials),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            // 1. parse response body
            try {
                let body = response.json();
                console.log(body);
            } catch (error) {
                console.log("Response body was not json.")
            }

            // 2. check - was the login successful?
            if (response.status == 201) {
                console.log("Successful login attempt");

                // clear inputs
                this.loginEmailInput = "";
                this.loginPasswordInput = "";

                // take the user to a home page

            } else if (response.status == 401) {
                console.log("Unsuccessful login attempt");

                // let the user know it was unsuccessful
                alert("Unsuccessful login");

                // clear password input
                this.loginPasswordInput = "";
            } else {
                console.log("Some sort of error when POSTING /session:", response.status, response);
            }
        },
        // POST /user - create new user
        postUser: async function () {
            let newUser = {
                username: this.newEmailInput,
                fullname: this.newFullnameInput,
                password: this.newPasswordInput
            }

            let response = await 
        }
    },
    created: function () {
        this.getSession();
    }
})