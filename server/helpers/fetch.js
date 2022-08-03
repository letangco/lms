import fetch from 'isomorphic-fetch';
export function fetchData(link) {
  return fetch(`${link}`, {
    headers: {
      'content-type': 'application/json'
    },
    method: 'GET'
  })
    .then(response => response.json().then(json => ({json, response})))
    .then(({json, response}) => {
      if (!response.ok) {
        return Promise.reject(json);
      }
      return json;
    })
    .then(
      response => response,
      error => error
    );
}
