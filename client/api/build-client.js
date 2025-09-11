import axios from 'axios';

export default function buildClient({ req }) {
  if (typeof window === 'undefined') {
    // we are on the server
    // requests should be made to http://ingress-nginx-controller.ingress-nginx.svc.cluster.local
    // return axios.create({
    //   baseURL:
    //     'http://ingress-nginx-controller.ingress-nginx.svc.cluster.local',
    //   headers: req.headers,
    // });

    // we are on server
    // requests should be made to base url of purchased domain
    // for cluster running in production
    return axios.create({
      baseURL: 'http://www.ticketing-app-production.site/',
      headers: req.headers,
    });
  } else {
    // we are on client
    // requests should be made to base url of ''
    return axios.create({
      baseURL: '/',
    });
  }
}
