import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getDuration = new Trend('get_duration', true);
export const statusCode = new Rate('status_code_200');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.12'],
    http_req_duration: ['p(95)<5700']
  },

  stages: [
    { duration: '5s', target: 10 },
    { duration: '20s', target: 30 },
    { duration: '30s', target: 70 },
    { duration: '60s', target: 90 },
    { duration: '85s', target: 150 },
    { duration: '100s', target: 300 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const baseUrl = 'https://meowfacts.herokuapp.com/';

  const params = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const OK = 200;

  const res = http.get(`${baseUrl}`, params);
  sleep(5);

  getDuration.add(res.timings.duration);
  statusCode.add(res.status === OK);

  //check(res, {
  //'Status 200 - Primeira validação': () => res.status === OK
  //});

  check(res, {
    'GET - Status 200': () => res.status === OK
  });
}
