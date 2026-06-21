// load-test.js - k6 Performance Test
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests < 500ms
    errors: ['rate<0.05'],            // Error rate < 5%
  },
};

// Test configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';
const API_URL = `${BASE_URL}/api`;

// Helper to get auth token
function getAuthToken() {
  const loginPayload = JSON.stringify({
    email: 'admin@company.com',
    password: 'admin123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const response = http.post(`${API_URL}/auth/login`, loginPayload, params);
  
  if (response.status === 200) {
    const body = JSON.parse(response.body);
    return body.access_token;
  }
  
  return null;
}

// Helper for random data generation
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Test scenarios
export default function() {
  // 1. Authentication - Login
  const token = getAuthToken();
  
  if (!token) {
    errorRate.add(1);
    return;
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 2. Get Dashboard Stats
  const statsResponse = http.get(`${API_URL}/dashboard/stats?days=30`, { headers });
  check(statsResponse, {
    'Dashboard stats status 200': (r) => r.status === 200,
  });
  errorRate.add(statsResponse.status !== 200);
  sleep(1);

  // 3. Get Master Data
  const brandsResponse = http.get(`${API_URL}/master/brands`, { headers });
  check(brandsResponse, {
    'Brands status 200': (r) => r.status === 200,
  });
  errorRate.add(brandsResponse.status !== 200);
  
  let brands = [];
  if (brandsResponse.status === 200) {
    brands = JSON.parse(brandsResponse.body).data || [];
  }
  sleep(0.5);

  // 4. Create Appraisal
  if (brands.length > 0) {
    const brand = randomItem(brands);
    
    // Get models for brand
    const modelsResponse = http.get(
      `${API_URL}/master/models?brand_id=${brand.id}`,
      { headers }
    );
    
    let models = [];
    if (modelsResponse.status === 200) {
      models = JSON.parse(modelsResponse.body).data || [];
    }
    
    if (models.length > 0) {
      const model = randomItem(models);
      
      // Get variants for model
      const variantsResponse = http.get(
        `${API_URL}/master/variants?model_id=${model.id}`,
        { headers }
      );
      
      let variants = [];
      if (variantsResponse.status === 200) {
        variants = JSON.parse(variantsResponse.body).data || [];
      }
      
      // Get colors
      const colorsResponse = http.get(`${API_URL}/master/colors`, { headers });
      let colors = [];
      if (colorsResponse.status === 200) {
        colors = JSON.parse(colorsResponse.body).data || [];
      }
      
      // Get conditions
      const conditionsResponse = http.get(`${API_URL}/master/conditions`, { headers });
      let conditions = [];
      if (conditionsResponse.status === 200) {
        conditions = JSON.parse(conditionsResponse.body).data || [];
      }
      
      if (variants.length > 0 && colors.length > 0 && conditions.length > 0) {
        const variant = randomItem(variants);
        const color = randomItem(colors);
        const condition = randomItem(conditions);
        
        // Get accessories
        const accessoriesResponse = http.get(`${API_URL}/master/accessories`, { headers });
        let accessories = [];
        if (accessoriesResponse.status === 200) {
          accessories = JSON.parse(accessoriesResponse.body).data || [];
        }
        
        // Create appraisal
        const appraisalPayload = JSON.stringify({
          brand_id: brand.id,
          model_id: model.id,
          variant_id: variant.id,
          color_id: color.id,
          physical_condition_id: condition.id,
          battery_health: randomInt(60, 100),
          accessories: accessories.slice(0, randomInt(0, 5)).map(a => a.id),
          notes: `Test appraisal ${Date.now()}`,
          imei: `${randomInt(100000000000000, 999999999999999)}`,
        });
        
        const appraisalResponse = http.post(
          `${API_URL}/appraisal`,
          appraisalPayload,
          { headers }
        );
        
        check(appraisalResponse, {
          'Appraisal creation status 200': (r) => r.status === 200 || r.status === 201,
        });
        errorRate.add(appraisalResponse.status !== 200 && appraisalResponse.status !== 201);
        
        // 5. Get Transactions
        if (appraisalResponse.status === 200 || appraisalResponse.status === 201) {
          const transactionsResponse = http.get(
            `${API_URL}/transactions?limit=20`,
            { headers }
          );
          check(transactionsResponse, {
            'Transactions status 200': (r) => r.status === 200,
          });
          errorRate.add(transactionsResponse.status !== 200);
        }
      }
    }
  }

  sleep(1);
}

// Stress test with higher concurrency
export function stressTest() {
  const options = {
    stages: [
      { duration: '1m', target: 200 },
      { duration: '3m', target: 200 },
      { duration: '1m', target: 500 },
      { duration: '3m', target: 500 },
      { duration: '1m', target: 0 },
    ],
  };
}