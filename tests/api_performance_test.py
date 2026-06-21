import asyncio
import aiohttp
import time
import json
from typing import Dict, List
import statistics
from datetime import datetime
import matplotlib.pyplot as plt
import numpy as np

class APIPerformanceTest:
    def __init__(self, base_url: str = "http://localhost:8000/api"):
        self.base_url = base_url
        self.token = None
        self.results = []
    
    async def login(self, session):
        """Get authentication token"""
        data = {
            "email": "admin@company.com",
            "password": "admin123"
        }
        async with session.post(f"{self.base_url}/auth/login", json=data) as resp:
            if resp.status == 200:
                result = await resp.json()
                self.token = result["access_token"]
                return True
            return False
    
    async def make_request(self, session, method: str, endpoint: str, data: Dict = None) -> Dict:
        """Make API request with timing"""
        url = f"{self.base_url}{endpoint}"
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        
        start = time.perf_counter()
        
        try:
            if method.lower() == "get":
                async with session.get(url, headers=headers) as resp:
                    end = time.perf_counter()
                    return {
                        "endpoint": endpoint,
                        "status": resp.status,
                        "duration": end - start,
                        "success": resp.status < 400
                    }
            elif method.lower() == "post":
                async with session.post(url, json=data, headers=headers) as resp:
                    end = time.perf_counter()
                    return {
                        "endpoint": endpoint,
                        "status": resp.status,
                        "duration": end - start,
                        "success": resp.status < 400
                    }
        except Exception as e:
            end = time.perf_counter()
            return {
                "endpoint": endpoint,
                "status": 0,
                "duration": end - start,
                "success": False,
                "error": str(e)
            }
    
    async def run_test(self, concurrent: int = 10, iterations: int = 100):
        """Run performance test with concurrent requests"""
        print(f"Running performance test: {concurrent} concurrent, {iterations} iterations")
        
        async with aiohttp.ClientSession() as session:
            # Login first
            if not await self.login(session):
                print("Login failed!")
                return
            
            print("✓ Authenticated")
            
            # Prepare test scenarios
            scenarios = [
                ("GET", "/dashboard/stats?days=30", None),
                ("GET", "/master/brands", None),
                ("GET", "/master/conditions", None),
                ("GET", "/master/accessories", None),
                ("GET", "/transactions?limit=20", None),
            ]
            
            # Create appraisal data
            appraisal_data = {
                "brand_id": "00000000-0000-0000-0000-000000000001",
                "model_id": "00000000-0000-0000-0000-000000000002",
                "variant_id": "00000000-0000-0000-0000-000000000003",
                "color_id": "00000000-0000-0000-0000-000000000004",
                "physical_condition_id": "00000000-0000-0000-0000-000000000005",
                "battery_health": 85,
                "accessories": [],
                "notes": f"Performance test {datetime.now().isoformat()}"
            }
            
            # Run tests
            for i in range(iterations):
                # Randomly select scenario
                import random
                scenario = random.choice(scenarios)
                method, endpoint, data = scenario
                
                # Occasionally create new appraisal
                if random.random() < 0.2:
                    method, endpoint, data = "POST", "/appraisal", appraisal_data
                
                result = await self.make_request(session, method, endpoint, data)
                self.results.append(result)
                
                # Progress update
                if (i + 1) % 10 == 0:
                    print(f"Progress: {i + 1}/{iterations}")
            
            # Analyze results
            self.analyze_results()
    
    def analyze_results(self):
        """Analyze and display test results"""
        if not self.results:
            print("No results to analyze")
            return
        
        # Group by endpoint
        endpoints = {}
        for r in self.results:
            endpoint = r["endpoint"]
            if endpoint not in endpoints:
                endpoints[endpoint] = []
            endpoints[endpoint].append(r["duration"])
        
        print("\n=== Performance Test Results ===")
        print(f"Total requests: {len(self.results)}")
        
        # Overall stats
        all_durations = [r["duration"] for r in self.results if r["success"]]
        successful = len([r for r in self.results if r["success"]])
        failed = len(self.results) - successful
        
        print(f"Success rate: {successful}/{len(self.results)} ({successful/len(self.results)*100:.1f}%)")
        print(f"Failed requests: {failed}")
        
        if all_durations:
            print(f"Overall average: {statistics.mean(all_durations)*1000:.2f}ms")
            print(f"Overall p95: {statistics.quantiles(all_durations, n=20)[18]*1000:.2f}ms")
            print(f"Overall p99: {statistics.quantiles(all_durations, n=100)[98]*1000:.2f}ms")
        
        # Per endpoint stats
        print("\n--- Per Endpoint Statistics ---")
        for endpoint, durations in endpoints.items():
            if durations:
                valid = [d for d in durations if d > 0]
                if valid:
                    print(f"\n{endpoint}:")
                    print(f"  Count: {len(valid)}")
                    print(f"  Avg: {statistics.mean(valid)*1000:.2f}ms")
                    print(f"  Min: {min(valid)*1000:.2f}ms")
                    print(f"  Max: {max(valid)*1000:.2f}ms")
                    print(f"  P95: {statistics.quantiles(valid, n=20)[18]*1000:.2f}ms")
        
        # Generate chart
        self.generate_chart()
    
    def generate_chart(self):
        """Generate performance chart"""
        if not self.results:
            return
        
        # Prepare data
        durations = [r["duration"] * 1000 for r in self.results if r["success"]]  # Convert to ms
        endpoints = [r["endpoint"] for r in self.results if r["success"]]
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))
        
        # Histogram
        ax1.hist(durations, bins=30, alpha=0.7, color='blue')
        ax1.axvline(statistics.mean(durations), color='red', linestyle='dashed', linewidth=2)
        ax1.axvline(statistics.quantiles(durations, n=20)[18], color='orange', linestyle='dashed', linewidth=2)
        ax1.set_xlabel('Response Time (ms)')
        ax1.set_ylabel('Frequency')
        ax1.set_title('Response Time Distribution')
        ax1.legend(['Mean', 'P95'])
        
        # Box plot by endpoint
        endpoint_names = sorted(set(endpoints))
        endpoint_data = []
        labels = []
        for endpoint in endpoint_names:
            data = [self.results[i]["duration"] * 1000 for i in range(len(self.results)) 
                    if self.results[i]["success"] and self.results[i]["endpoint"] == endpoint]
            if data:
                endpoint_data.append(data)
                labels.append(endpoint.split('/')[-1])
        
        if endpoint_data:
            ax2.boxplot(endpoint_data, labels=labels, vert=True)
            ax2.set_ylabel('Response Time (ms)')
            ax2.set_title('Response Time by Endpoint')
            ax2.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        plt.savefig('performance_report.png', dpi=150)
        print("\n✓ Performance chart saved as 'performance_report.png'")

async def main():
    tester = APIPerformanceTest()
    await tester.run_test(concurrent=10, iterations=200)

if __name__ == "__main__":
    asyncio.run(main())