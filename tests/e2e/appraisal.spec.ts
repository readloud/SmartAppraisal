// e2e/appraisal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SmartAppraisal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
  });

  test('should login successfully', async ({ page }) => {
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL('/dashboard');
    
    // Verify dashboard loaded
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible();
  });

  test('should create a new appraisal', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to appraisal form
    await page.click('text=New Appraisal');
    await page.waitForURL('/appraisal/new');

    // Fill form
    await page.selectOption('select[name="brand_id"]', { index: 1 });
    await page.selectOption('select[name="model_id"]', { index: 1 });
    await page.selectOption('select[name="variant_id"]', { index: 1 });
    await page.selectOption('select[name="color_id"]', { index: 1 });
    await page.selectOption('select[name="physical_condition_id"]', { index: 1 });
    
    await page.fill('input[name="battery_health"]', '85');
    await page.check('input[value="box"]');
    await page.check('input[value="charger"]');
    await page.fill('textarea[name="notes"]', 'Test appraisal from E2E test');

    // Submit form
    await page.click('button:has-text("Save Appraisal")');

    // Wait for result
    await page.waitForSelector('.result-container', { timeout: 10000 });
    
    // Verify result is displayed
    const result = await page.locator('.result-container .amount');
    await expect(result).toBeVisible();
    
    const price = await result.textContent();
    expect(price).toMatch(/Rp\s+[\d,]+/);
  });

  test('should search and filter transactions', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to transactions
    await page.click('text=Transactions');
    await page.waitForURL('/transactions');

    // Apply filters
    await page.fill('input[placeholder*="Search"]', 'iPhone');
    await page.click('button:has-text("Search")');

    // Verify results
    await page.waitForSelector('table tbody tr', { timeout: 5000 });
    const rows = await page.locator('table tbody tr').count();
    expect(rows).toBeGreaterThan(0);
  });

  test('should export data', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to reports
    await page.click('text=Reports');
    await page.waitForURL('/reports');

    // Click export
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.(xlsx|csv)$/);
  });

  test('should handle invalid login', async ({ page }) => {
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Verify error message
    const error = await page.locator('.toast-error');
    await expect(error).toBeVisible();
    await expect(error).toContainText('Invalid email or password');
  });

  test('should load dashboard stats', async ({ page }) => {
    // Login
    await page.fill('input[type="email"]', 'admin@company.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Check stats cards
    const stats = await page.locator('.stat-card .value');
    await expect(stats).toHaveCount(4);
    
    // Verify each stat has a value
    for (const stat of await stats.all()) {
      const text = await stat.textContent();
      expect(text).toBeTruthy();
    }

    // Check chart presence
    const chart = await page.locator('.recharts-wrapper');
    await expect(chart).toBeVisible();
  });
});