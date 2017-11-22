import {default as _fetch} from 'whatwg-fetch'
console.log(_fetch);
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

// export const baidukey = 'dAeaG6HwIFGlkbqtyKkyFGEC'
