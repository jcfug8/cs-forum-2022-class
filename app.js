const URL = "https://forum2022.codeschool.cloud";

var app = new Vue({
    el: "#app",
    data: {
        page: "login",

        loginEmailInput: "",
        loginPasswordInput: "",

        newEmailInput: "",
        newPasswordInput: "",
        newFullnameInput: "",

        newPostBody: "",

        newThreadName: "",
        newThreadDescription: "",
        newThreadCategory: "",

        threads: [],
    },
    methods: {
        // change the page that the user sees
        setPage: function (page) {
            this.page = page;
        },

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

                // send the user to the home page
                this.loadHomePage();
                return;

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
            let body;
            try {
                body = response.json();
                // console.log(body);
            } catch (error) {
                console.log("Response body was not json.")
            }

            // 2. check - was the login successful?
            if (response.status == 201) {
                // successful login

                // clear inputs
                this.loginEmailInput = "";
                this.loginPasswordInput = "";

                // take the user to the home page
                this.loadHomePage();

            } else if (response.status == 401) {
                // unsuccessful login

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

            let response = await fetch(URL + "/user", {
                method: "POST",
                body: JSON.stringify(newUser),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            // parse the response body
            let body;
            try {
                body = response.json();
            } catch (error) {
                console.error("Error parsing body as JSON:", error);
                body = "An Unknown Error has occured";
            }

            if (response.status == 201) {
                // user successfully created
                this.newEmailInput = "";
                this.newFullnameInput = "";
                this.newPasswordInput = "";

                // send them back to the login page
                this.setPage('login');
            } else {
                // error creating user
                this.newPasswordInput = "";

                // create notification

            }
        },
        loadHomePage: async function () {
            await this.getThread();
            this.setPage('home');
        },
        // GET /thread - get a list of all threads
        getThread: async function () {
            let response = await fetch(URL + "/thread", {
                credentials: "include"
            });
            
            // check response status
            if (response.status == 200) {
                // successfully got the data
                let body = await response.json();
                this.threads = body;
            } else {
                console.error("Error fetching threads:", response.status);
            }
        },
        loadThreadPage: async function () {
            this.newPostBody = "";
            this.setPage("thread");
        },
        // GET /thread/_id - get a single thread & its posts
        getSingleThread: async function (id) {
            let response = await fetch(URL + "/thread/" + id, {
                credentials: "include"
            });

            // check response status
            if (response.status == 200) {
                this.currentThread = await response.json();
                this.loadThreadPage();
            } else {
                console.error("Error fetching individual request with id", id, "- status:", response.status);
            }
        },
        // DELETE /thread/_id - deletes a thread if the user owns it
        deleteThread: async function (id) {
            let response = await fetch(URL + '/thread/' + id, {
                method: "DELETE",
                credentials: "include"
            });

            switch (response.status) {
            case 200:
                this.getThread();
                break;
            case 403:
                alert("Cannot delete: User does not own the thread")
            default:
                console.log("Error when deleting post:", response.status);
                break;
            }
        },
        logoutUser: function () {
            this.setPage('login');
        },
        // POST /post - posts a comment to a specific thread
        postPost: async function (id) {
            let postBody = {
                body: this.newPostBody,
                thread_id: id
            }

            let response = await fetch(URL + "/post", {
                method: "POST",
                body: JSON.stringify(postBody),
                headers: {
                    "Content-Type" : "application/json"
                },
                credentials: "include"
            });

            if (response.status == 201) {
                // created successfully
                this.getSingleThread(id);
            } else {
                console.log("Error posting new post:", response.status);
            }
        },
        loadNewThreadPage: function () {
            // clear inputs
            this.newThreadCategory = "";
            this.newThreadName = "";
            this.newThreadDescription = "";

            // show new form for threads
            this.setPage("newThread");
        },
        // POST /thread - sends a new thread to the server
        postThread: async function () {
            // create body to send to server
            let newThread = {
                name: this.newThreadName,
                description: this.newThreadDescription,
                category: this.newThreadCategory
            };

            let response = await fetch(URL + "/thread", {
                method: "POST",
                body: JSON.stringify(newThread),
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            // read the status of the response
            if (response.status == 201) {
                // successful creation

                this.loadHomePage();
            } else {
                console.log("Error posting thread:", response.status);
            }
        }
    },
    created: function () {
        this.getSession();
    }
})