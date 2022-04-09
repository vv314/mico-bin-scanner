import http from 'node:http'

async function headFetch(url) {
  const options = {
    method: 'HEAD',
    headers: {
      'content-type': 'application/octet-stream',
    },
  }

  return new Promise((resolve, reject) => {
    http.request(new URL(url), options, (res) => resolve(res.statusCode)).end()
  })
}

export default headFetch
