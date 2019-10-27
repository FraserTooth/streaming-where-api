const api = async query => {
  const response = await fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: query })
  });

  return response.json();
};

const getAllMedia = async () => {
  const query = `{
        getAllMedia {
          id
          title
          type
          created_at
          tmdb_api_url
        }
    }`;

  const jsonResponse = await api(query);
  return jsonResponse.data.getAllMedia;
};

const createMediaRecord = async (record, authentication) => {
  const query = `
            mutation {
                addMediaRecord(
                input: {
                    title: "${record.title}"
                    streaming_service: "${record.streaming_service}"
                    country: "${record.country}"
                    media_url: "${record.media_url}"
                }
                authentication: {
                    username: "${authentication.username}"
                    password: "${authentication.password}"
                }){
                    media_url
                    user_id
                }
            }`;

  const jsonResponse = await api(query);
  return jsonResponse.data.addMediaRecord;
};

const addUser = async (username, email, password) => {
  if (!username || !email || !password) {
    return "Field is still null";
  }
  const query = `
              mutation {
                  addUser(
                  input: {
                      username: "${username}"
                      email: "${email}"
                      password: "${password}"
                  }){
                      id
                      username
                      email
                  }
              }`;

  const jsonResponse = await api(query);
  return jsonResponse.data.addUser;
};

const getMediaRecordsByTitle = async title => {
  const query = `{
        getMediaRecordsByTitle(title:"${title}") {
          id
          media{
              title
          }
        }
      }`;

  const jsonResponse = await api(query);
  return jsonResponse.data.getMediaRecordsByTitle;
};

const inputUsername = document.getElementById("inputUsername");
const inputEmail = document.getElementById("inputEmail");
const inputPassword = document.getElementById("inputPassword");
const userForm = document.getElementById("userForm");

const inputTitle = document.getElementById("inputTitle");
const inputService = document.getElementById("inputService");
const inputCountry = document.getElementById("inputCountry");
const inputMediaURL = document.getElementById("inputMediaURL");
const authMediaUsername = document.getElementById("authMediaUsername");
const authMediaPassword = document.getElementById("authMediaPassword");
const mediaRecordForm = document.getElementById("mediaRecordForm");

document
  .getElementById("userSubmitButton")
  .addEventListener("click", async event => {
    event.preventDefault();
    inputUsername.setAttribute("readonly", true);
    inputEmail.setAttribute("readonly", true);
    inputPassword.setAttribute("readonly", true);
    const username = inputUsername.value;
    const email = inputEmail.value;
    const password = inputPassword.value;
    const response = addUser(username, email, password);
    console.log(await response);
    userForm.reset();
    inputUsername.removeAttribute("readonly");
    inputEmail.removeAttribute("readonly");
    inputPassword.removeAttribute("readonly");
  });

document
  .getElementById("recordSubmitButton")
  .addEventListener("click", async event => {
    event.preventDefault();
    inputTitle.setAttribute("readonly", true);
    inputService.setAttribute("readonly", true);
    inputCountry.setAttribute("readonly", true);
    inputMediaURL.setAttribute("readonly", true);
    authMediaUsername.setAttribute("readonly", true);
    authMediaPassword.setAttribute("readonly", true);

    const input = {
      title: inputTitle.value,
      streaming_service: inputService.value,
      country: inputCountry.value,
      media_url: inputMediaURL.value
    };

    const authentication = {
      username: authMediaUsername.value,
      password: authMediaUsername.value
    };

    const response = createMediaRecord(input, authentication);
    console.log(await response);
    inputTitle.removeAttribute("readonly");
    inputService.removeAttribute("readonly");
    inputCountry.removeAttribute("readonly");
    inputMediaURL.removeAttribute("readonly");
    authMediaPassword.removeAttribute("readonly");
    authMediaUsername.removeAttribute("readonly");
  });
