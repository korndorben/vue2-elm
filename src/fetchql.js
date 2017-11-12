import {default as _fetch} from 'whatwg-fetch'
const fetchql = {
    query: function({operationName, query, variables}) {
        return fetch('/graphql', {
            method: 'post',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({query: query, variables: variables}),
            credentials: 'include'
        }).then(function(response) {
            return response.text();
        }).then(function(responseBody) {
            try {
                return JSON.parse(responseBody);
            } catch (error) {
                return responseBody;
            }
        });
    }
}
export default fetchql
// import FetchQL from 'fetchql/src/index.js'
// export default new FetchQL({
//     url: '/graphql', // GraphQL server address
//     interceptors: [
//         {
//             request: function(url, config) {
//                 let user = JSON.parse(sessionStorage.getItem('user'));
//                 config.headers.authorization = user.token
//                 return [url, config];
//             }
//         }
//     ],
//     headers: {}, // customized headers of all requests,
//     onStart: function(requestQueueLength) {}, // callback of a new request queue
//     onEnd: function(requestQueueLength) {}, // callback of a request queue finished
//     omitEmptyVariables: true
// })

// export const baidukey = 'dAeaG6HwIFGlkbqtyKkyFGEC'
